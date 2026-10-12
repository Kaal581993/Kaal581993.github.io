package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * System control frame for pipeline management.
 */
public final class SystemFrame extends AbstractFrame {
    private final SystemCommand command;
    private final Map<String, Object> payload;
    
    public enum SystemCommand {
        PIPELINE_START,
        PIPELINE_STOP,
        SESSION_START,
        SESSION_END,
        HEARTBEAT,
        CONFIG_UPDATE,
        RECONNECT
    }
    
    @JsonCreator
    public SystemFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId,
            @JsonProperty("command") SystemCommand command,
            @JsonProperty("payload") Map<String, Object> payload) {
        super(id, timestamp, sessionId, correlationId);
        this.command = command;
        this.payload = payload;
    }
    
    public SystemFrame(SystemCommand command) {
        this(null, null, null, null, command, Map.of());
    }
    
    public SystemFrame(SystemCommand command, Map<String, Object> payload) {
        this(null, null, null, null, command, payload);
    }
    
    public SystemCommand getCommand() { return command; }
    public Map<String, Object> getPayload() { return payload; }
    
    @Override
    public String getFrameType() { return "SystemFrame"; }
}