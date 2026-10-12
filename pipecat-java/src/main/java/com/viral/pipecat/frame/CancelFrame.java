package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

/**
 * Frame to cancel ongoing operations gracefully.
 * Similar to InterruptionFrame but for cooperative cancellation.
 */
public final class CancelFrame extends AbstractFrame {
    private final String reason;
    private final boolean graceful;
    
    @JsonCreator
    public CancelFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId,
            @JsonProperty("reason") String reason,
            @JsonProperty("graceful") boolean graceful) {
        super(id, timestamp, sessionId, correlationId);
        this.reason = reason;
        this.graceful = graceful;
    }
    
    public CancelFrame(String reason) {
        this(null, null, null, null, reason, true);
    }
    
    public String getReason() { return reason; }
    public boolean isGraceful() { return graceful; }
    
    @Override
    public String getFrameType() { return "CancelFrame"; }
}