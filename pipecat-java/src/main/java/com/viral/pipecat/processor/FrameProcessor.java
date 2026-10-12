package com.viral.pipecat.processor;

import com.viral.pipecat.frame.Frame;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Core interface for all frame processors in the pipeline.
 * 
 * A FrameProcessor takes a Frame as input and produces a Flux of Frames as output.
 * This allows for 0, 1, or multiple output frames per input frame.
 * 
 * Uses Project Reactor for backpressure-aware asynchronous processing.
 * Virtual Threads are used for blocking I/O operations (STT, LLM, TTS API calls).
 */
public interface FrameProcessor {
    
    /**
     * Process a single frame and emit zero or more output frames.
     * 
     * @param frame the input frame to process
     * @return a Flux of output frames (may be empty, single, or multiple)
     */
    Flux<Frame> process(Frame frame);
    
    /**
     * Get the unique name of this processor for identification and metrics.
     */
    String getName();
    
    /**
     * Called when the processor is added to a pipeline.
     * Override for initialization logic.
     */
    default Mono<Void> onStart() {
        return Mono.empty();
    }
    
    /**
     * Called when the processor is removed from pipeline or pipeline stops.
     * Override for cleanup logic.
     */
    default Mono<Void> onStop() {
        return Mono.empty();
    }
    
    /**
     * Handle an interruption frame - should flush buffers and reset state.
     * Default implementation forwards to process().
     */
    default Flux<Frame> handleInterruption(InterruptionContext context) {
        return process(context.interruptionFrame());
    }
    
    /**
     * Check if this processor can handle the given frame type.
     * Used for optimization - processors can skip frames they don't handle.
     */
    default boolean canProcess(Class<? extends Frame> frameType) {
        return true;
    }
}