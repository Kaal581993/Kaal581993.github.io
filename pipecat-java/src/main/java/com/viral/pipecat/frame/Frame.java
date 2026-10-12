package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.time.Instant;
import java.util.UUID;

/**
 * Base interface for all frames in the Pipecat pipeline.
 * Every piece of data flowing through the pipeline is a Frame.
 * 
 * Uses Jackson polymorphic serialization for transport layer.
 */
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "frameType",
    visible = true
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = AudioRawFrame.class, name = "AudioRawFrame"),
    @JsonSubTypes.Type(value = TranscriptionFrame.class, name = "TranscriptionFrame"),
    @JsonSubTypes.Type(value = LLMResponseFrame.class, name = "LLMResponseFrame"),
    @JsonSubTypes.Type(value = UserStartedSpeakingFrame.class, name = "UserStartedSpeakingFrame"),
    @JsonSubTypes.Type(value = UserStoppedSpeakingFrame.class, name = "UserStoppedSpeakingFrame"),
    @JsonSubTypes.Type(value = InterruptionFrame.class, name = "InterruptionFrame"),
    @JsonSubTypes.Type(value = CancelFrame.class, name = "CancelFrame"),
    @JsonSubTypes.Type(value = TextFrame.class, name = "TextFrame"),
    @JsonSubTypes.Type(value = SystemFrame.class, name = "SystemFrame"),
    @JsonSubTypes.Type(value = ErrorFrame.class, name = "ErrorFrame"),
    @JsonSubTypes.Type(value = MetricsFrame.class, name = "MetricsFrame")
})
public interface Frame {
    
    /**
     * Unique identifier for this frame instance.
     */
    UUID getId();
    
    /**
     * Timestamp when this frame was created.
     */
    Instant getTimestamp();
    
    /**
     * The type discriminator for serialization.
     */
    String getFrameType();
    
    /**
     * Optional session ID for multi-session pipelines.
     */
    default String getSessionId() {
        return null;
    }
    
    /**
     * Optional correlation ID for tracing frame lineage.
     */
    default String getCorrelationId() {
        return null;
    }
}

/**
 * Base abstract class providing common frame implementation.
 */
abstract class AbstractFrame implements Frame {
    private final UUID id;
    private final Instant timestamp;
    private final String sessionId;
    private final String correlationId;
    
    @JsonCreator
    protected AbstractFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId) {
        this.id = id != null ? id : UUID.randomUUID();
        this.timestamp = timestamp != null ? timestamp : Instant.now();
        this.sessionId = sessionId;
        this.correlationId = correlationId;
    }
    
    @Override
    public UUID getId() { return id; }
    
    @Override
    public Instant getTimestamp() { return timestamp; }
    
    @Override
    public String getSessionId() { return sessionId; }
    
    @Override
    public String getCorrelationId() { return correlationId; }
}