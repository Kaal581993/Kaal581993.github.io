package com.viral.pipecat.service;

import com.viral.pipecat.frame.*;
import com.viral.pipecat.processor.FrameProcessor;
import reactor.core.publisher.Flux;

/**
 * Text-to-Speech service interface.
 * Converts LLM response frames to audio frames.
 */
public interface TTSService extends FrameProcessor {
    
    /**
     * Process frames and generate audio.
     * Handles LLMResponseFrame and TextFrame.
     */
    @Override
    default Flux<Frame> process(Frame frame) {
        return switch (frame) {
            case LLMResponseFrame llm -> synthesize(llm).cast(Frame.class);
            case TextFrame tf -> synthesize(tf.getText(), tf.getSessionId()).cast(Frame.class);
            default -> Flux.just(frame);
        };
    }
    
    /**
     * Synthesize speech from LLM response frame.
     * Streams AudioRawFrame chunks as they're generated.
     */
    Flux<AudioRawFrame> synthesize(LLMResponseFrame response);
    
    /**
     * Synthesize speech from plain text.
     */
    default Flux<AudioRawFrame> synthesize(String text, String sessionId) {
        LLMResponseFrame frame = new LLMResponseFrame(text, true, true);
        return synthesize(frame);
    }
    
    /**
     * Get the voice ID/name being used.
     */
    String getVoiceId();
    
    /**
     * Set the voice for synthesis.
     */
    void setVoice(String voiceId);
    
    /**
     * Get sample rate of generated audio.
     */
    int getSampleRate();
    
    /**
     * Get available voices.
     */
    default String[] getAvailableVoices() {
        return new String[]{"alloy", "echo", "fable", "onyx", "nova", "shimmer"};
    }
    
    /**
     * TTS configuration.
     */
    record Config(
        String voiceId,
        double speed,
        String format, // "pcm", "mp3", "opus"
        int sampleRate
    ) {
        public static Config defaultConfig() {
            return new Config("alloy", 1.0, "pcm", 24000);
        }
        
        public String[] getAvailableVoices() {
            return new String[]{"alloy", "echo", "fable", "onyx", "nova", "shimmer"};
        }
    }
}