package com.viral.pipecat.service;

import com.viral.pipecat.frame.*;
import com.viral.pipecat.processor.FrameProcessor;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

/**
 * Large Language Model service interface.
 * Converts transcription frames to streaming LLM response frames.
 */
public interface LLMService extends FrameProcessor {
    
    /**
     * Process input and generate streaming response.
     * Handles TranscriptionFrame, TextFrame, and SystemFrame.
     */
    @Override
    default Flux<Frame> process(Frame frame) {
        return switch (frame) {
            case TranscriptionFrame tf -> generateResponse(tf.getText(), tf.getSessionId()).cast(Frame.class);
            case TextFrame tf -> generateResponse(tf.getText(), tf.getSessionId()).cast(Frame.class);
            case SystemFrame sf -> handleSystemCommand(sf);
            default -> Flux.just(frame);
        };
    }
    
    /**
     * Generate streaming LLM response for user input.
     * Returns multiple LLMResponseFrame chunks (streaming tokens).
     */
    Flux<LLMResponseFrame> generateResponse(String userInput, String sessionId);
    
    /**
     * Generate response with conversation history.
     */
    default Flux<LLMResponseFrame> generateResponse(String userInput, String sessionId, List<Message> history) {
        return generateResponse(userInput, sessionId);
    }
    
    /**
     * Handle system commands (prompt updates, config changes).
     */
    default Flux<Frame> handleSystemCommand(SystemFrame frame) {
        return Flux.empty();
    }
    
    /**
     * Set the system prompt for this LLM instance.
     */
    void setSystemPrompt(String systemPrompt);
    
    /**
     * Get current system prompt.
     */
    String getSystemPrompt();
    
    /**
     * Message record for conversation history.
     */
    record Message(String role, String content, Map<String, Object> metadata) {
        public static Message user(String content) {
            return new Message("user", content, Map.of());
        }
        public static Message assistant(String content) {
            return new Message("assistant", content, Map.of());
        }
        public static Message system(String content) {
            return new Message("system", content, Map.of());
        }
    }
    
    /**
     * Configuration for LLM generation.
     */
    record Config(
        String model,
        double temperature,
        int maxTokens,
        double topP,
        boolean stream,
        List<String> stopSequences
    ) {
        public static Config defaultConfig() {
            return new Config("gpt-4o", 0.7, 2048, 1.0, true, List.of());
        }
    }
}