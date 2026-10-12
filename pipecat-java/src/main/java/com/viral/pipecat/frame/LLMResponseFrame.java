package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

/**
 * Frame containing a text chunk from LLM response.
 * Supports streaming token-by-token output.
 */
public final class LLMResponseFrame extends AbstractFrame {
    private final String text;
    private final boolean isComplete;
    private final String model;
    private final int tokenIndex;
    private final int totalTokensEstimate;
    private final boolean isFirstToken;
    
    @JsonCreator
    public LLMResponseFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId,
            @JsonProperty("text") String text,
            @JsonProperty("isComplete") boolean isComplete,
            @JsonProperty("model") String model,
            @JsonProperty("tokenIndex") int tokenIndex,
            @JsonProperty("totalTokensEstimate") int totalTokensEstimate,
            @JsonProperty("isFirstToken") boolean isFirstToken) {
        super(id, timestamp, sessionId, correlationId);
        this.text = text;
        this.isComplete = isComplete;
        this.model = model;
        this.tokenIndex = tokenIndex;
        this.totalTokensEstimate = totalTokensEstimate;
        this.isFirstToken = isFirstToken;
    }
    
    public LLMResponseFrame(String text, boolean isComplete) {
        this(null, null, null, null, text, isComplete, "gpt-4o", 0, 0, false);
    }
    
    public LLMResponseFrame(String text, boolean isComplete, boolean isFirstToken) {
        this(null, null, null, null, text, isComplete, "gpt-4o", 0, 0, isFirstToken);
    }
    
    public LLMResponseFrame(String text, boolean isComplete, String model, int tokenIndex, int totalTokensEstimate, boolean isFirstToken) {
        this(null, null, null, null, text, isComplete, model, tokenIndex, totalTokensEstimate, isFirstToken);
    }
    
    public String getText() { return text; }
    public boolean isComplete() { return isComplete; }
    public String getModel() { return model; }
    public int getTokenIndex() { return tokenIndex; }
    public int getTotalTokensEstimate() { return totalTokensEstimate; }
    public boolean isFirstToken() { return isFirstToken; }
    
    @Override
    public String getFrameType() { return "LLMResponseFrame"; }
    
    public LLMResponseFrame withSessionId(String sessionId) {
        return new LLMResponseFrame(getId(), getTimestamp(), sessionId, getCorrelationId(),
                                   text, isComplete, model, tokenIndex, totalTokensEstimate, isFirstToken);
    }
}