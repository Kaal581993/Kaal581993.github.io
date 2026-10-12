package com.viral.pipecat.transport;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.viral.pipecat.frame.*;
import com.viral.pipecat.pipeline.PipelineOrchestrator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;

/**
 * WebSocket transport handler for Pipecat pipeline.
 * Handles bidirectional frame streaming over WebSocket.
 * 
 * Protocol:
 * - Client -> Server: Binary (AudioRawFrame) or Text (JSON Frame)
 * - Server -> Client: Binary (AudioRawFrame) or Text (JSON Frame)
 * - All frames include sessionId for multi-session support
 */
@Component
public class PipecatWebSocketHandler extends AbstractWebSocketHandler {
    private static final Logger log = LoggerFactory.getLogger(PipecatWebSocketHandler.class);
    
    private final PipelineOrchestrator pipeline;
    private final ObjectMapper objectMapper;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, AtomicBoolean> sessionActive = new ConcurrentHashMap<>();
    
    public PipecatWebSocketHandler(PipelineOrchestrator pipeline, ObjectMapper objectMapper) {
        this.pipeline = pipeline;
        this.objectMapper = objectMapper;
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String sessionId = getSessionId(session);
        sessions.put(sessionId, session);
        sessionActive.put(sessionId, new AtomicBoolean(true));
        
        log.info("WebSocket connection established: {} (session: {})", session.getId(), sessionId);
        
        // Send system frame to confirm connection
        sendFrame(session, new SystemFrame(SystemFrame.SystemCommand.SESSION_START, Map.of(
            "sessionId", sessionId,
            "pipelineId", pipeline.getPipelineId()
        )));
        
        // Start pipeline if not already started
        pipeline.start()
            .subscribeOn(Schedulers.boundedElastic())
            .subscribe(
                v -> log.debug("Pipeline started for session {}", sessionId),
                error -> log.error("Failed to start pipeline for session {}", sessionId, error)
            );
        
        // Subscribe to pipeline output and send to client
        subscribeToPipelineOutput(sessionId);
    }
    
    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        String sessionId = getSessionId(session);
        
        if (!sessionActive.getOrDefault(sessionId, new AtomicBoolean(false)).get()) {
            return;
        }
        
        ByteBuffer payload = message.getPayload();
        byte[] audioData = new byte[payload.remaining()];
        payload.get(audioData);
        
        // Create AudioRawFrame from binary data
        AudioRawFrame frame = new AudioRawFrame(audioData)
            .withSessionId(sessionId);
        
        // Submit to pipeline
        pipeline.submit(frame)
            .subscribeOn(Schedulers.boundedElastic())
            .subscribe(
                v -> {}, // Success - frame submitted
                error -> log.error("Failed to submit audio frame for session {}", sessionId, error)
            );
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String sessionId = getSessionId(session);
        
        try {
            Frame frame = objectMapper.readValue(message.getPayload(), Frame.class);
            
            // Ensure session ID is set
            if (frame.getSessionId() == null) {
                // Re-create with session ID (would need frame builder)
                log.warn("Received frame without sessionId: {}", frame.getFrameType());
            }
            
            // Handle special frames
            if (frame instanceof SystemFrame sysFrame) {
                handleSystemFrame(sessionId, sysFrame);
            } else if (frame instanceof CancelFrame) {
                pipeline.bargeIn("client-cancel").subscribe();
            } else {
                // Submit to pipeline
                pipeline.submit(frame)
                    .subscribeOn(Schedulers.boundedElastic())
                    .subscribe();
            }
            
        } catch (IOException e) {
            log.error("Failed to deserialize frame from session {}", sessionId, e);
            sendError(session, "INVALID_FRAME", "Failed to parse frame: " + e.getMessage());
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = getSessionId(session);
        sessions.remove(sessionId);
        sessionActive.remove(sessionId);
        
        log.info("WebSocket connection closed: {} (session: {}), status: {}", 
                session.getId(), sessionId, status);
        
        // Send session end frame to pipeline
        pipeline.submit(new SystemFrame(SystemFrame.SystemCommand.SESSION_END, Map.of(
            "sessionId", sessionId
        ))).subscribe();
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        String sessionId = getSessionId(session);
        log.error("WebSocket transport error for session {}: {}", sessionId, exception.getMessage(), exception);
    }
    
    /**
     * Subscribe to pipeline output and send frames to WebSocket client.
     */
    private void subscribeToPipelineOutput(String sessionId) {
        WebSocketSession session = sessions.get(sessionId);
        if (session == null || !session.isOpen()) {
            return;
        }
        
        AtomicBoolean active = sessionActive.get(sessionId);
        if (active == null || !active.get()) {
            return;
        }
        
        // Stream all frame types to client
        pipeline.getOutput()
            .filter(frame -> frame.getSessionId() == null || frame.getSessionId().equals(sessionId))
            .doOnNext(frame -> sendFrame(session, frame))
            .doOnError(error -> log.error("Pipeline output error for session {}: {}", sessionId, error.getMessage()))
            .doOnComplete(() -> log.debug("Pipeline output completed for session {}", sessionId))
            .subscribeOn(Schedulers.boundedElastic())
            .subscribe();
        
        // Also specifically stream audio frames as binary for efficiency
        pipeline.getOutput(AudioRawFrame.class)
            .filter(frame -> frame.getSessionId() == null || frame.getSessionId().equals(sessionId))
            .doOnNext(this::sendBinaryFrame)
            .subscribeOn(Schedulers.boundedElastic())
            .subscribe();
    }
    
    /**
     * Send a frame as JSON text message.
     */
    private void sendFrame(WebSocketSession session, Frame frame) {
        if (session == null || !session.isOpen()) {
            return;
        }
        
        try {
            String json = objectMapper.writeValueAsString(frame);
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            log.error("Failed to serialize frame for session {}", getSessionId(session), e);
        }
    }
    
    /**
     * Send audio frame as binary message for efficiency.
     */
    private void sendBinaryFrame(AudioRawFrame frame) {
        WebSocketSession session = sessions.get(frame.getSessionId());
        if (session == null || !session.isOpen()) {
            return;
        }
        
        try {
            ByteBuffer buffer = ByteBuffer.wrap(frame.getAudioData());
            session.sendMessage(new BinaryMessage(buffer));
        } catch (IOException e) {
            log.error("Failed to send binary audio to session {}: {}", 
                    frame.getSessionId(), e.getMessage());
        }
    }
    
    /**
     * Send error frame to client.
     */
    private void sendError(WebSocketSession session, String code, String message) {
        ErrorFrame errorFrame = new ErrorFrame(code, message, "WebSocketTransport");
        sendFrame(session, errorFrame);
    }
    
    /**
     * Handle system control frames.
     */
    private void handleSystemFrame(String sessionId, SystemFrame frame) {
        switch (frame.getCommand()) {
            case HEARTBEAT -> sendFrame(sessions.get(sessionId), 
                    new SystemFrame(SystemFrame.SystemCommand.HEARTBEAT, Map.of("timestamp", System.currentTimeMillis())));
            case SESSION_END -> {
                AtomicBoolean active = sessionActive.get(sessionId);
                if (active != null) active.set(false);
            }
            default -> log.debug("Unhandled system command: {}", frame.getCommand());
        }
    }
    
    /**
     * Extract session ID from WebSocket session.
     */
    private String getSessionId(WebSocketSession session) {
        // Try to get from query params or attributes
        String sessionId = (String) session.getAttributes().get("sessionId");
        if (sessionId == null) {
            sessionId = session.getId();
            session.getAttributes().put("sessionId", sessionId);
        }
        return sessionId;
    }
    
    /**
     * Broadcast a frame to all connected sessions.
     */
    public void broadcast(Frame frame) {
        sessions.values().forEach(session -> sendFrame(session, frame));
    }
    
    /**
     * Get active session count.
     */
    public int getActiveSessionCount() {
        return (int) sessionActive.values().stream()
            .filter(AtomicBoolean::get)
            .count();
    }
}