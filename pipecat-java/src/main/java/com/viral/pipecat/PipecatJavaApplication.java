package com.viral.pipecat;

import com.viral.pipecat.config.WebSocketConfig;
import com.viral.pipecat.pipeline.PipelineOrchestrator;
import com.viral.pipecat.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableAsync;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

/**
 * Pipecat Java - Real-time Voice AI Agent Framework
 * 
 * Main application entry point for the Pipecat Java port.
 * Provides a complete voice agent pipeline with:
 * - WebSocket transport for real-time audio streaming
 * - Voice Activity Detection (VAD)
 * - Speech-to-Text (STT)
 * - LLM orchestration with sales executive personality
 * - Text-to-Speech (TTS)
 * - Interruption/barge-in handling
 * 
 * Run with: ./mvnw spring-boot:run
 * WebSocket endpoint: ws://localhost:8080/api/voice/stream
 */
@SpringBootApplication
@Import(WebSocketConfig.class)
@EnableAsync
public class PipecatJavaApplication {
    
    private static final Logger log = LoggerFactory.getLogger(PipecatJavaApplication.class);
    
    private final PipelineOrchestrator pipeline;
    private final VADService vadService;
    private final STTService sttService;
    private final LLMService llmService;
    private final TTSService ttsService;
    
    public PipecatJavaApplication(
            PipelineOrchestrator pipeline,
            VADService vadService,
            STTService sttService,
            LLMService llmService,
            TTSService ttsService) {
        this.pipeline = pipeline;
        this.vadService = vadService;
        this.sttService = sttService;
        this.llmService = llmService;
        this.ttsService = ttsService;
    }
    
    public static void main(String[] args) {
        log.info("Starting Pipecat Java Voice Agent Framework...");
        SpringApplication.run(PipecatJavaApplication.class, args);
    }
    
    @PostConstruct
    public void init() {
        log.info("===========================================");
        log.info("Pipecat Java Voice Agent Framework Started");
        log.info("===========================================");
        log.info("WebSocket Endpoint: ws://localhost:8080/api/voice/stream");
        log.info("Pipeline ID: {}", pipeline.getPipelineId());
        log.info("Processors: VAD -> STT -> LLM -> TTS");
        log.info("LLM System Prompt: Sales Executive (Viral Prajapati)");
        log.info("Interruption/Barge-in: ENABLED");
        log.info("===========================================");
        
        // Print metrics periodically
        startMetricsReporting();
    }
    
    @PreDestroy
    public void shutdown() {
        log.info("Shutting down Pipecat Java...");
        pipeline.stop().block();
        log.info("Pipecat Java stopped.");
    }
    
    private void startMetricsReporting() {
        Thread metricsThread = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    Thread.sleep(30000); // Every 30 seconds
                    var metrics = pipeline.getMetrics();
                    log.info("Pipeline Metrics: frames={}, interruptions={}, processors={}, audioBuffer={}, llmBuffer={}, ttsBuffer={}",
                            metrics.totalFramesProcessed(),
                            metrics.totalInterruptions(),
                            metrics.processorNames(),
                            metrics.audioBufferSize(),
                            metrics.llmBufferSize(),
                            metrics.ttsBufferSize());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.warn("Error reporting metrics: {}", e.getMessage());
                }
            }
        });
        metricsThread.setDaemon(true);
        metricsThread.setName("pipecat-metrics-reporter");
        metricsThread.start();
    }
}