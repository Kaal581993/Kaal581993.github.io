package com.viral.pipecat.processor;

import com.viral.pipecat.frame.Frame;
import reactor.core.publisher.Flux;

/**
 * Extended interface for processors that need custom interruption handling.
 */
public interface InterruptibleProcessor extends FrameProcessor {
    Flux<Frame> onInterruption(InterruptionContext context);
}