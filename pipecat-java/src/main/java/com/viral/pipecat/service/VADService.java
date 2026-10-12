package com.viral.pipecat.service;

import com.viral.pipecat.frame.*;
import com.viral.pipecat.processor.FrameProcessor;
import reactor.core.publisher.Flux;

/**
 * Voice Activity Detection service interface.
 * Detects speech/silence in audio stream and emits VAD frames.
 * Critical for barge-in detection and turn-taking.
 */
public interface VADService extends FrameProcessor {
    
    /**
     * Process audio and detect voice activity.
     * Emits UserStartedSpeakingFrame and UserStoppedSpeakingFrame.
     */
    @Override
    default Flux<Frame> process(Frame frame) {
        if (frame instanceof AudioRawFrame audio) {
            return analyzeAudio(audio).cast(Frame.class);
        }
        return Flux.just(frame);
    }
    
    /**
     * Analyze audio chunk for voice activity.
     * Returns VAD frames when state changes.
     */
    Flux<Frame> analyzeAudio(AudioRawFrame audio);
    
    /**
     * Reset VAD state (e.g., on interruption).
     */
    default void reset() {}
    
    /**
     * Get current voice probability (0.0 to 1.0).
     */
    default double getCurrentVoiceProbability() {
        return 0.0;
    }
    
    /**
     * VAD configuration.
     */
    record Config(
        double threshold,           // Voice probability threshold (0.0-1.0)
        int minSpeechDurationMs,    // Minimum speech duration to trigger start
        int minSilenceDurationMs,   // Minimum silence duration to trigger stop
        int frameSizeMs,            // Analysis frame size in ms
        int sampleRate              // Expected sample rate
    ) {
        public static Config defaultConfig() {
            return new Config(0.5, 100, 500, 30, 16000);
        }
        
        public static Config sensitive() {
            return new Config(0.3, 50, 300, 20, 16000);
        }
        
        public static Config aggressive() {
            return new Config(0.7, 200, 800, 30, 16000);
        }
    }
}