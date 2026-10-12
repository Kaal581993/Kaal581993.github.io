package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

/**
 * Error frame for propagating errors through the pipeline.
 */
public final class ErrorFrame extends AbstractFrame {
    private final String errorCode;
    private final String message;
    private final String sourceProcessor;
    private final boolean recoverable;
    private final Throwable cause;
    
    @JsonCreator
    public ErrorFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId,
            @JsonProperty("errorCode") String errorCode,
            @JsonProperty("message") String message,
            @JsonProperty("sourceProcessor") String sourceProcessor,
            @JsonProperty("recoverable") boolean recoverable,
            @JsonProperty("cause") Throwable cause) {
        super(id, timestamp, sessionId, correlationId);
        this.errorCode = errorCode;
        this.message = message;
        this.sourceProcessor = sourceProcessor;
        this.recoverable = recoverable;
        this.cause = cause;
    }
    
    public ErrorFrame(String errorCode, String message, String sourceProcessor) {
        this(null, null, null, null, errorCode, message, sourceProcessor, true, null);
    }
    
    public ErrorFrame(Throwable throwable, String sourceProcessor) {
        this(null, null, null, null, throwable.getClass().getSimpleName(), 
             throwable.getMessage(), sourceProcessor, true, throwable);
    }
    
    public String getErrorCode() { return errorCode; }
    public String getMessage() { return message; }
    public String getSourceProcessor() { return sourceProcessor; }
    public boolean isRecoverable() { return recoverable; }
    public Throwable getCause() { return cause; }
    
    @Override
    public String getFrameType() { return "ErrorFrame"; }
}