package com.viral.pipecat.frame;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

/**
 * Raw PCM audio frame containing audio samples.
 * This is the primary frame type for audio transport.
 */
public final class AudioRawFrame extends AbstractFrame {
    private final byte[] audioData;
    private final int sampleRate;
    private final int numChannels;
    private final int bitsPerSample;
    private final long presentationTimestamp; // microseconds
    
    @JsonCreator
    public AudioRawFrame(
            @JsonProperty("id") UUID id,
            @JsonProperty("timestamp") Instant timestamp,
            @JsonProperty("sessionId") String sessionId,
            @JsonProperty("correlationId") String correlationId,
            @JsonProperty("audioData") byte[] audioData,
            @JsonProperty("sampleRate") int sampleRate,
            @JsonProperty("numChannels") int numChannels,
            @JsonProperty("bitsPerSample") int bitsPerSample,
            @JsonProperty("presentationTimestamp") long presentationTimestamp) {
        super(id, timestamp, sessionId, correlationId);
        this.audioData = audioData != null ? audioData.clone() : new byte[0];
        this.sampleRate = sampleRate;
        this.numChannels = numChannels;
        this.bitsPerSample = bitsPerSample;
        this.presentationTimestamp = presentationTimestamp;
    }
    
    public AudioRawFrame(byte[] audioData, int sampleRate, int numChannels, int bitsPerSample) {
        this(null, null, null, null, audioData, sampleRate, numChannels, bitsPerSample, System.currentTimeMillis() * 1000);
    }
    
    public AudioRawFrame(byte[] audioData) {
        this(audioData, 16000, 1, 16); // Default: 16kHz mono 16-bit
    }
    
    public AudioRawFrame(byte[] audioData, int sampleRate, int numChannels, int bitsPerSample, long presentationTimestamp) {
        this(audioData, sampleRate, numChannels, bitsPerSample);
        // Note: presentationTimestamp is not stored in the 4-arg constructor path
        // This is a convenience constructor for MockTTSService
    }
    
    public byte[] getAudioData() { return audioData.clone(); }
    public int getSampleRate() { return sampleRate; }
    public int getNumChannels() { return numChannels; }
    public int getBitsPerSample() { return bitsPerSample; }
    public long getPresentationTimestamp() { return presentationTimestamp; }
    
    public int getFrameSize() { return audioData.length; }
    public double getDurationMs() { 
        return (audioData.length * 8.0) / (sampleRate * numChannels * bitsPerSample) * 1000; 
    }
    
    @Override
    public String getFrameType() { return "AudioRawFrame"; }
    
    public AudioRawFrame withSessionId(String sessionId) {
        return new AudioRawFrame(getId(), getTimestamp(), sessionId, getCorrelationId(), 
                                audioData, sampleRate, numChannels, bitsPerSample, presentationTimestamp);
    }
    
    public AudioRawFrame withCorrelationId(String correlationId) {
        return new AudioRawFrame(getId(), getTimestamp(), getSessionId(), correlationId, 
                                audioData, sampleRate, numChannels, bitsPerSample, presentationTimestamp);
    }
    
    public AudioRawFrame withPresentationTimestamp(long presentationTimestamp) {
        return new AudioRawFrame(getId(), getTimestamp(), getSessionId(), getCorrelationId(), 
                                audioData, sampleRate, numChannels, bitsPerSample, presentationTimestamp);
    }
}