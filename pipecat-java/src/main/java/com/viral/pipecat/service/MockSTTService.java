package com.viral.pipecat.service;

import com.viral.pipecat.frame.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Mock STT service for testing and development.
 * Simulates speech recognition with configurable behavior.
 */
public class MockSTTService implements STTService {
    private static final Logger log = LoggerFactory.getLogger(MockSTTService.class);
    
    private final Config config;
    private final AtomicBoolean isProcessing = new AtomicBoolean(false);
    private final StringBuilder accumulatedAudio = new StringBuilder();
    
    public MockSTTService() {
        this(Config.defaultConfig());
    }
    
    public MockSTTService(Config config) {
        this.config = config;
    }
    
    @Override
    public String getName() {
        return "MockSTTService";
    }
    
    @Override
    public Flux<TranscriptionFrame> processAudio(AudioRawFrame audio) {
        if (!isProcessing.compareAndSet(false, true)) {
            return Flux.empty();
        }
        
        // Simulate processing delay
        return Flux.defer(() -> {
            // Simulate partial transcription based on audio energy
            double energy = calculateAudioEnergy(audio.getAudioData());
            String partialText = "";
            
            if (energy > 0.1) {
                // Simulate recognizing some words
                String[] words = {"Hello", "I'm", "interested", "in", "your", "services", 
                                 "backend", "Java", "Spring Boot", "microservices", "Kafka"};
                int wordCount = (int) (energy * words.length);
                partialText = String.join(" ", java.util.Arrays.copyOf(words, Math.max(1, wordCount)));
            }
            
            isProcessing.set(false);
            
            if (!partialText.isEmpty()) {
                return Flux.just(new TranscriptionFrame(partialText, false, 0.7));
            }
            return Flux.empty();
        }).delaySubscription(Duration.ofMillis(50));
    }
    
    @Override
    public Flux<TranscriptionFrame> finalizeTranscription(UserStoppedSpeakingFrame stop) {
        // Return a simulated final transcription
        String[] responses = {
            "I'm interested in hiring a backend developer for our Spring Boot microservices.",
            "We need help with Kafka consumer lag and SQL performance tuning.",
            "Our production system has been experiencing deployment failures.",
            "Can you help with database optimization and schema design?",
            "We're looking for someone with healthcare HL7 FHIR experience."
        };
        
        String transcription = responses[ThreadLocalRandom.current().nextInt(responses.length)];
        
        return Flux.just(new TranscriptionFrame(transcription, true, 0.95))
            .delaySubscription(Duration.ofMillis(200));
    }
    
    @Override
    public int getRequiredSampleRate() {
        return config.sampleRate();
    }
    
    private double calculateAudioEnergy(byte[] audioData) {
        if (audioData == null || audioData.length == 0) return 0.0;
        
        long sum = 0;
        for (byte b : audioData) {
            sum += b * b;
        }
        double rms = Math.sqrt((double) sum / audioData.length);
        return Math.min(1.0, rms / 128.0); // Normalize
    }
    
    public record Config(int sampleRate) {
        public static Config defaultConfig() {
            return new Config(16000);
        }
    }
}