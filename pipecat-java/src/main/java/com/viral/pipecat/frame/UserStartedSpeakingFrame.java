package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

/**
 * Frame emitted when VAD detects user started speaking.
 * Critical for barge-in handling - immediately interrupts TTS/LLM.
 */
public final class UserStartedSpeakingFrame extends AbstractFrame {
    private final double voiceProbability;
    private final long vadTimestampMs;
    
    @JsonCreator
    public UserStartedSpeakingFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId,
            @JsonProperty("voiceProbability") double voiceProbability,
            @JsonProperty("vadTimestampMs") long vadTimestampMs) {
        super(id, timestamp, sessionId, correlationId);
        this.voiceProbability = voiceProbability;
        this.vadTimestampMs = vadTimestampMs;
    }
    
    public UserStartedSpeakingFrame(double voiceProbability) {
        this(null, null, null, null, voiceProbability, System.currentTimeMillis());
    }
    
    public double getVoiceProbability() { return voiceProbability; }
    public long getVadTimestampMs() { return vadTimestampMs; }
    
    @Override
    public String getFrameType() { return "UserStartedSpeakingFrame"; }
    
    public UserStartedSpeakingFrame withSessionId(String sessionId) {
        return new UserStartedSpeakingFrame(getId(), getTimestamp(), sessionId, getCorrelationId(),
                                           voiceProbability, vadTimestampMs);
    }
}