package com.viral.pipecat.service;

import com.viral.pipecat.frame.*;
import com.viral.pipecat.processor.FrameProcessor;
import reactor.core.publisher.Flux;

/**
 * Speech-to-Text service interface.
 * Converts audio frames to transcription frames.
 */
public interface STTService extends FrameProcessor {
    
    /**
     * Process audio and return transcription.
     * Only processes AudioRawFrame and UserStoppedSpeakingFrame.
     */
    @Override
    default Flux<Frame> process(Frame frame) {
        return switch (frame) {
            case AudioRawFrame audio -> processAudio(audio).cast(Frame.class);
            case UserStoppedSpeakingFrame stop -> finalizeTranscription(stop).cast(Frame.class);
            default -> Flux.just(frame);
        };
    }
    
    /**
     * Process a chunk of audio data.
     * Returns intermediate transcription frames (isFinal=false) as audio streams in.
     */
    Flux<TranscriptionFrame> processAudio(AudioRawFrame audio);
    
    /**
     * Finalize transcription when user stops speaking.
     * Returns final transcription frame (isFinal=true).
     */
    Flux<TranscriptionFrame> finalizeTranscription(UserStoppedSpeakingFrame stop);
    
    /**
     * Get supported languages.
     */
    default String[] getSupportedLanguages() {
        return new String[]{"en", "es", "fr", "de", "zh", "ja", "ko"};
    }
    
    /**
     * Get sample rate requirement.
     */
    default int getRequiredSampleRate() {
        return 16000;
    }
}