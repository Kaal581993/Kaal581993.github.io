package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

/**
 * Frame emitted when VAD detects user stopped speaking.
 * Triggers STT processing of accumulated audio.
 */
public final class UserStoppedSpeakingFrame extends AbstractFrame {
    private final long speechDurationMs;
    private final long silenceDurationMs;
    private final int audioFramesCount;
    
    @JsonCreator
    public UserStoppedSpeakingFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId,
            @JsonProperty("speechDurationMs") long speechDurationMs,
            @JsonProperty("silenceDurationMs") long silenceDurationMs,
            @JsonProperty("audioFramesCount") int audioFramesCount) {
        super(id, timestamp, sessionId, correlationId);
        this.speechDurationMs = speechDurationMs;
        this.silenceDurationMs = silenceDurationMs;
        this.audioFramesCount = audioFramesCount;
    }
    
    public UserStoppedSpeakingFrame(long speechDurationMs, int audioFramesCount) {
        this(null, null, null, null, speechDurationMs, 0, audioFramesCount);
    }
    
    public long getSpeechDurationMs() { return speechDurationMs; }
    public long getSilenceDurationMs() { return silenceDurationMs; }
    public int getAudioFramesCount() { return audioFramesCount; }
    
    @Override
    public String getFrameType() { return "UserStoppedSpeakingFrame"; }
    
    public UserStoppedSpeakingFrame withSessionId(String sessionId) {
        return new UserStoppedSpeakingFrame(getId(), getTimestamp(), sessionId, getCorrelationId(),
                                           speechDurationMs, silenceDurationMs, audioFramesCount);
    }
}