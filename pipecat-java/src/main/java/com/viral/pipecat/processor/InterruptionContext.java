package com.viral.pipecat.processor;

import com.viral.pipecat.frame.Frame;
import com.viral.pipecat.frame.InterruptionFrame;

/**
 * Context passed to processors during interruption handling.
 */
public record InterruptionContext(
    InterruptionFrame interruptionFrame,
    String sourceProcessor,
    long interruptionTimestamp
) {
    public InterruptionFrame getInterruptionFrame() {
        return interruptionFrame;
    }
}