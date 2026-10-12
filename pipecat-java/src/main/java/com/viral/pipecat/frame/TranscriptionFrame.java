package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

/**
 * Frame containing transcribed text from STT.
 */
public final class TranscriptionFrame extends AbstractFrame {
    private final String text;
    private final boolean isFinal;
    private final double confidence;
    private final String language;
    private final long audioStartMs;
    private final long audioEndMs;
    
    @JsonCreator
    public TranscriptionFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId,
            @JsonProperty("text") String text,
            @JsonProperty("isFinal") boolean isFinal,
            @JsonProperty("confidence") double confidence,
            @JsonProperty("language") String language,
            @JsonProperty("audioStartMs") long audioStartMs,
            @JsonProperty("audioEndMs") long audioEndMs) {
        super(id, timestamp, sessionId, correlationId);
        this.text = text;
        this.isFinal = isFinal;
        this.confidence = confidence;
        this.language = language;
        this.audioStartMs = audioStartMs;
        this.audioEndMs = audioEndMs;
    }
    
    public TranscriptionFrame(String text, boolean isFinal) {
        this(null, null, null, null, text, isFinal, 1.0, "en", 0, 0);
    }
    
    public TranscriptionFrame(String text, boolean isFinal, double confidence) {
        this(null, null, null, null, text, isFinal, confidence, "en", 0, 0);
    }
    
    public String getText() { return text; }
    public boolean isFinal() { return isFinal; }
    public double getConfidence() { return confidence; }
    public String getLanguage() { return language; }
    public long getAudioStartMs() { return audioStartMs; }
    public long getAudioEndMs() { return audioEndMs; }
    
    @Override
    public String getFrameType() { return "TranscriptionFrame"; }
    
    public TranscriptionFrame withSessionId(String sessionId) {
        return new TranscriptionFrame(getId(), getTimestamp(), sessionId, getCorrelationId(),
                                     text, isFinal, confidence, language, audioStartMs, audioEndMs);
    }
}