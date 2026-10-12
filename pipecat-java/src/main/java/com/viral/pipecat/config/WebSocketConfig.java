package com.viral.pipecat.config;

import com.viral.pipecat.pipeline.PipelineOrchestrator;
import com.viral.pipecat.service.*;
import com.viral.pipecat.transport.PipecatWebSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.module.paramnames.ParameterNamesModule;

/**
 * WebSocket configuration for Pipecat transport.
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(pipecatWebSocketHandler(), "/api/voice/stream")
            .setAllowedOrigins("*")
            .withSockJS();
    }
    
    @Bean
    public PipecatWebSocketHandler pipecatWebSocketHandler() {
        return new PipecatWebSocketHandler(pipelineOrchestrator(), objectMapper());
    }
    
    @Bean
    public PipelineOrchestrator pipelineOrchestrator() {
        // Create pipeline with all processors
        PipelineOrchestrator pipeline = new PipelineOrchestrator("default-session");
        
        // Add processors in order: VAD -> STT -> LLM -> TTS
        pipeline.addProcessor(vadService())
                .addProcessor(sttService())
                .addProcessor(llmService())
                .addProcessor(ttsService());
        
        return pipeline;
    }
    
    @Bean
    public VADService vadService() {
        return new MockVADService();
    }
    
    @Bean
    public STTService sttService() {
        return new MockSTTService();
    }
    
    @Bean
    public LLMService llmService() {
        MockLLMService llm = new MockLLMService();
        // Set the sales executive system prompt
        llm.setSystemPrompt(llm.getSystemPrompt()); // Uses default
        return llm;
    }
    
    @Bean
    public TTSService ttsService() {
        return new MockTTSService();
    }
    
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.registerModule(new ParameterNamesModule());
        mapper.findAndRegisterModules();
        return mapper;
    }
    
    @Bean
    public ServletServerContainerFactoryBean servletServerContainerFactoryBean() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(64 * 1024); // 64KB
        container.setMaxBinaryMessageBufferSize(64 * 1024); // 64KB
        container.setMaxSessionIdleTimeout(30 * 60 * 1000L); // 30 minutes
        container.setAsyncSendTimeout(10000L); // 10 seconds
        return container;
    }
}