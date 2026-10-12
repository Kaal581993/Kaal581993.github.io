package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

/**
 * Generic text frame for passing text between processors.
 */
public final class TextFrame extends AbstractFrame {
    private final String text;
    private final TextType type;
    
    public enum TextType {
        USER_MESSAGE,
        SYSTEM_PROMPT,
        CONTEXT,
        METADATA
    }
    
    @JsonCreator
    public TextFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId,
            @JsonProperty("text") String text,
            @JsonProperty("type") TextType type) {
        super(id, timestamp, sessionId, correlationId);
        this.text = text;
        this.type = type != null ? type : TextType.USER_MESSAGE;
    }
    
    public TextFrame(String text) {
        this(null, null, null, null, text, TextType.USER_MESSAGE);
    }
    
    public TextFrame(String text, TextType type) {
        this(null, null, null, null, text, type);
    }
    
    public String getText() { return text; }
    public TextType getType() { return type; }
    
    @Override
    public String getFrameType() { return "TextFrame"; }
}