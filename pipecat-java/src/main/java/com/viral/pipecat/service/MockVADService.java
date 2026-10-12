package com.viral.pipecat.service;

import com.viral.pipecat.frame.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Mock VAD service using simple energy-based detection.
 * Simulates voice activity detection for testing.
 */
public class MockVADService implements VADService {
    private static final Logger log = LoggerFactory.getLogger(MockVADService.class);
    
    private final Config config;
    private final AtomicBoolean isSpeaking = new AtomicBoolean(false);
    private final AtomicInteger speechFrameCount = new AtomicInteger(0);
    private final AtomicInteger silenceFrameCount = new AtomicInteger(0);
    private final AtomicReference<Double> lastVoiceProbability = new AtomicReference<>(0.0);
    
    public MockVADService() {
        this(Config.defaultConfig());
    }
    
    public MockVADService(Config config) {
        this.config = config;
    }
    
    @Override
    public String getName() {
        return "MockVADService";
    }
    
    @Override
    public Flux<Frame> analyzeAudio(AudioRawFrame audio) {
        double energy = calculateEnergy(audio.getAudioData());
        double voiceProb = Math.min(1.0, energy * 2.0); // Scale energy to probability
        lastVoiceProbability.set(voiceProb);
        
        boolean wasSpeaking = isSpeaking.get();
        boolean nowSpeaking = voiceProb > config.threshold();
        
        if (!wasSpeaking && nowSpeaking) {
            // Speech started
            isSpeaking.set(true);
            speechFrameCount.set(0);
            silenceFrameCount.set(0);
            
            log.debug("VAD: Speech started, probability={:.2f}", voiceProb);
            return Flux.just(new UserStartedSpeakingFrame(voiceProb));
            
        } else if (wasSpeaking && !nowSpeaking) {
            // Potential speech end - check silence duration
            silenceFrameCount.incrementAndGet();
            int silenceMs = silenceFrameCount.get() * config.frameSizeMs();
            
            if (silenceMs >= config.minSilenceDurationMs()) {
                isSpeaking.set(false);
                int speechMs = speechFrameCount.get() * config.frameSizeMs();
                
                log.debug("VAD: Speech ended, duration={}ms", speechMs);
                return Flux.just(new UserStoppedSpeakingFrame(speechMs, speechFrameCount.get()));
            }
            
        } else if (wasSpeaking && nowSpeaking) {
            // Continue speaking
            speechFrameCount.incrementAndGet();
            silenceFrameCount.set(0);
        }
        
        return Flux.empty();
    }
    
    @Override
    public void reset() {
        isSpeaking.set(false);
        speechFrameCount.set(0);
        silenceFrameCount.set(0);
        lastVoiceProbability.set(0.0);
        log.debug("VAD state reset");
    }
    
    @Override
    public double getCurrentVoiceProbability() {
        return lastVoiceProbability.get();
    }
    
    private double calculateEnergy(byte[] audioData) {
        if (audioData == null || audioData.length == 0) return 0.0;
        
        long sum = 0;
        for (byte b : audioData) {
            sum += (long) b * b;
        }
        double rms = Math.sqrt((double) sum / audioData.length);
        return Math.min(1.0, rms / 128.0); // Normalize to 0-1
    }
}