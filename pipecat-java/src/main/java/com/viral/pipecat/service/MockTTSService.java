package com.viral.pipecat.service;

import com.viral.pipecat.frame.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.Random;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Mock TTS service for testing.
 * Generates synthetic audio frames (silence with occasional tone).
 */
public class MockTTSService implements TTSService {
    private static final Logger log = LoggerFactory.getLogger(MockTTSService.class);
    
    private final Config config;
    private final AtomicReference<String> currentVoice = new AtomicReference<>("alloy");
    private final Random random = new Random();
    
    // Audio parameters
    private static final int FRAME_SIZE_MS = 20; // 20ms frames
    private static final int BYTES_PER_FRAME; // Will be calculated based on sample rate
    
    static {
        // 24kHz * 2 bytes * 1 channel * 20ms / 1000
        BYTES_PER_FRAME = 24000 * 2 * 1 * 20 / 1000;
    }
    
    public MockTTSService() {
        this(Config.defaultConfig());
    }
    
    public MockTTSService(Config config) {
        this.config = config;
    }
    
    @Override
    public String getName() {
        return "MockTTSService";
    }
    
    @Override
    public Flux<AudioRawFrame> synthesize(LLMResponseFrame response) {
        String text = response.getText();
        if (text == null || text.isBlank()) {
            return Flux.empty();
        }
        
        log.debug("TTS synthesizing: {} chars, firstToken={}, complete={}", 
                text.length(), response.isFirstToken(), response.isComplete());
        
        // Estimate duration: ~150 words per minute = 2.5 words/sec
        int wordCount = text.split("\\s+").length;
        int estimatedDurationMs = Math.max(500, (int) (wordCount / 2.5 * 1000));
        int frameCount = Math.max(1, estimatedDurationMs / FRAME_SIZE_MS);
        
        return Flux.range(0, frameCount)
            .map(i -> generateAudioFrame(i, frameCount, response.isFirstToken(), response.isComplete()))
            .delayElements(Duration.ofMillis(FRAME_SIZE_MS))
            .doOnComplete(() -> log.debug("TTS completed synthesis for {} chars", text.length()));
    }
    
    private AudioRawFrame generateAudioFrame(int index, int totalFrames, boolean isFirst, boolean isLast) {
        byte[] audioData = new byte[BYTES_PER_FRAME];
        
        // Generate a simple sine wave tone for first/last frames (audible feedback)
        // Silence for middle frames
        if (isFirst || isLast || index % 50 == 0) {
            generateTone(audioData, 440.0, 0.1); // 440Hz tone at 10% volume
        }
        // Rest is silence (zeros)
        
        long presentationTimestamp = System.currentTimeMillis() * 1000L + index * FRAME_SIZE_MS * 1000L;
        
        return new AudioRawFrame(
            audioData,
            config.sampleRate(),
            1, // mono
            16, // 16-bit
            presentationTimestamp
        );
    }
    
    private void generateTone(byte[] buffer, double frequencyHz, double amplitude) {
        int sampleRate = config.sampleRate();
        double twoPiF = 2 * Math.PI * frequencyHz / sampleRate;
        
        for (int i = 0; i < buffer.length / 2; i++) {
            short sample = (short) (Short.MAX_VALUE * amplitude * Math.sin(twoPiF * i));
            buffer[i * 2] = (byte) (sample & 0xFF);
            buffer[i * 2 + 1] = (byte) ((sample >> 8) & 0xFF);
        }
    }
    
    @Override
    public String getVoiceId() {
        return currentVoice.get();
    }
    
    @Override
    public void setVoice(String voiceId) {
        if (java.util.Arrays.asList(getAvailableVoices()).contains(voiceId)) {
            currentVoice.set(voiceId);
            log.info("TTS voice changed to: {}", voiceId);
        } else {
            log.warn("Unknown voice: {}, available: {}", voiceId, String.join(", ", getAvailableVoices()));
        }
    }
    
    @Override
    public int getSampleRate() {
        return config.sampleRate();
    }
    
    @Override
    public String[] getAvailableVoices() {
        return TTSService.super.getAvailableVoices();
    }
}