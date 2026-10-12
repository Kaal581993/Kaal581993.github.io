package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

/**
 * Frame signaling an interruption/barge-in event.
 * When received, all downstream processors should:
 * 1. Stop current processing immediately
 * 2. Flush output buffers
 * 3. Clear any queued frames
 * 4. Reset internal state
 */
public final class InterruptionFrame extends AbstractFrame {
    private final InterruptionReason reason;
    private final String sourceProcessor;
    private final boolean shouldFlushAudio;
    private final boolean shouldCancelLLM;
    private final boolean shouldCancelTTS;
    
    public enum InterruptionReason {
        USER_STARTED_SPEAKING,
        EXPLICIT_CANCEL,
        TIMEOUT,
        ERROR,
        NEW_PRIORITY_INPUT
    }
    
    @JsonCreator
    public InterruptionFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId,
            @JsonProperty("reason") InterruptionReason reason,
            @JsonProperty("sourceProcessor") String sourceProcessor,
            @JsonProperty("shouldFlushAudio") boolean shouldFlushAudio,
            @JsonProperty("shouldCancelLLM") boolean shouldCancelLLM,
            @JsonProperty("shouldCancelTTS") boolean shouldCancelTTS) {
        super(id, timestamp, sessionId, correlationId);
        this.reason = reason;
        this.sourceProcessor = sourceProcessor;
        this.shouldFlushAudio = shouldFlushAudio;
        this.shouldCancelLLM = shouldCancelLLM;
        this.shouldCancelTTS = shouldCancelTTS;
    }
    
    public InterruptionFrame(InterruptionReason reason, String sourceProcessor) {
        this(null, null, null, null, reason, sourceProcessor, true, true, true);
    }
    
    public static InterruptionFrame userBargeIn(String sourceProcessor) {
        return new InterruptionFrame(InterruptionReason.USER_STARTED_SPEAKING, sourceProcessor);
    }
    
    public static InterruptionFrame explicitCancel(String sourceProcessor) {
        return new InterruptionFrame(InterruptionReason.EXPLICIT_CANCEL, sourceProcessor);
    }
    
    public InterruptionReason getReason() { return reason; }
    public String getSourceProcessor() { return sourceProcessor; }
    public boolean shouldFlushAudio() { return shouldFlushAudio; }
    public boolean shouldCancelLLM() { return shouldCancelLLM; }
    public boolean shouldCancelTTS() { return shouldCancelTTS; }
    
    @Override
    public String getFrameType() { return "InterruptionFrame"; }
    
    public InterruptionFrame withSessionId(String sessionId) {
        return new InterruptionFrame(getId(), getTimestamp(), sessionId, getCorrelationId(),
                                    reason, sourceProcessor, shouldFlushAudio, shouldCancelLLM, shouldCancelTTS);
    }
}