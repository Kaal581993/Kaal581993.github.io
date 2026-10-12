package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Metrics frame for pipeline observability.
 */
public final class MetricsFrame extends AbstractFrame {
    private final String processorName;
    private final MetricType type;
    private final double value;
    private final Map<String, String> tags;
    
    public enum MetricType {
        LATENCY_MS,
        THROUGHPUT_FPS,
        AUDIO_LEVEL_DB,
        VAD_PROBABILITY,
        STT_CONFIDENCE,
        LLM_TOKENS_PER_SEC,
        TTS_LATENCY_MS,
        QUEUE_DEPTH,
        ERROR_RATE,
        INTERRUPTION_COUNT
    }
    
    @JsonCreator
    public MetricsFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId,
            @JsonProperty("processorName") String processorName,
            @JsonProperty("type") MetricType type,
            @JsonProperty("value") double value,
            @JsonProperty("tags") Map<String, String> tags) {
        super(id, timestamp, sessionId, correlationId);
        this.processorName = processorName;
        this.type = type;
        this.value = value;
        this.tags = tags;
    }
    
    public MetricsFrame(String processorName, MetricType type, double value) {
        this(null, null, null, null, processorName, type, value, Map.of());
    }
    
    public String getProcessorName() { return processorName; }
    public MetricType getType() { return type; }
    public double getValue() { return value; }
    public Map<String, String> getTags() { return tags; }
    
    @Override
    public String getFrameType() { return "MetricsFrame"; }
}