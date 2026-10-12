package com.viral.pipecat.pipeline;

import com.viral.pipecat.frame.*;
import com.viral.pipecat.processor.FrameProcessor;
import com.viral.pipecat.processor.InterruptibleProcessor;
import com.viral.pipecat.processor.InterruptionContext;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import reactor.core.scheduler.Schedulers;
import reactor.core.Disposable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Predicate;

/**
 * Pipeline orchestrator that links FrameProcessors together and manages
 * frame flow, backpressure, and interruption/barge-in handling.
 * 
 * Uses Project Reactor for reactive streams and Virtual Threads for blocking operations.
 * Implements Pipecat's frame-based architecture with immediate interruption handling.
 */
public class PipelineOrchestrator implements AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(PipelineOrchestrator.class);
    
    private final String pipelineId;
    private final String sessionId;
    private final List<FrameProcessor> processors = new ArrayList<>();
    private final Sinks.Many<Frame> inputSink = Sinks.many().multicast().onBackpressureBuffer();
    private final Sinks.Many<Frame> outputSink = Sinks.many().multicast().onBackpressureBuffer();
    
    // Interruption handling state
    private final AtomicBoolean isInterrupted = new AtomicBoolean(false);
    private final AtomicReference<InterruptionFrame> currentInterruption = new AtomicReference<>();
    private final ConcurrentLinkedQueue<Frame> audioOutputBuffer = new ConcurrentLinkedQueue<>();
    private final ConcurrentLinkedQueue<Frame> llmOutputBuffer = new ConcurrentLinkedQueue<>();
    private final ConcurrentLinkedQueue<Frame> ttsOutputBuffer = new ConcurrentLinkedQueue<>();
    
    // Metrics
    private final AtomicReference<Instant> lastFrameTime = new AtomicReference<>(Instant.now());
    private final AtomicLong frameCount = new AtomicLong(0);
    private final AtomicLong interruptionCount = new AtomicLong(0);
    
    // Virtual thread executor for blocking I/O
    private final ExecutorService virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();
    
    // Pipeline flux
    private volatile Flux<Frame> pipelineFlux;
    private volatile Disposable pipelineSubscription;
    
    public PipelineOrchestrator(String sessionId) {
        this.pipelineId = UUID.randomUUID().toString();
        this.sessionId = sessionId;
        buildPipeline();
    }
    
    public PipelineOrchestrator(String pipelineId, String sessionId) {
        this.pipelineId = pipelineId;
        this.sessionId = sessionId;
        buildPipeline();
    }
    
    /**
     * Add a processor to the pipeline.
     * Processors are linked in the order they are added.
     */
    public PipelineOrchestrator addProcessor(FrameProcessor processor) {
        processors.add(processor);
        log.debug("Added processor '{}' to pipeline {}", processor.getName(), pipelineId);
        return this;
    }
    
    /**
     * Add multiple processors at once.
     */
    public PipelineOrchestrator addProcessors(FrameProcessor... processors) {
        this.processors.addAll(Arrays.asList(processors));
        return this;
    }
    
    /**
     * Build the reactive pipeline flux.
     */
    private void buildPipeline() {
        this.pipelineFlux = inputSink.asFlux()
            .publishOn(Schedulers.fromExecutor(virtualThreadExecutor))
            .flatMap(this::processFrameThroughPipeline, 16) // Concurrency for parallel frame processing
            .doOnNext(frame -> {
                lastFrameTime.set(Instant.now());
                frameCount.incrementAndGet();
                outputSink.tryEmitNext(frame);
            })
            .doOnError(error -> {
                log.error("Pipeline error in {}: {}", pipelineId, error.getMessage(), error);
                outputSink.tryEmitNext(new ErrorFrame(error, "PipelineOrchestrator"));
            })
            .doOnCancel(() -> log.info("Pipeline {} cancelled", pipelineId));
    }
    
    /**
     * Process a single frame through the entire processor chain.
     * Handles interruption logic at each stage.
     */
    private Flux<Frame> processFrameThroughPipeline(Frame frame) {
        // Check for interruption frames - highest priority
        if (frame instanceof InterruptionFrame interruptionFrame) {
            return handleInterruption(interruptionFrame);
        }
        
        // If pipeline is interrupted, only allow interruption frames through
        if (isInterrupted.get() && !(frame instanceof CancelFrame || frame instanceof SystemFrame)) {
            log.debug("Dropping frame {} due to active interruption", frame.getFrameType());
            return Flux.empty();
        }
        
        // Process through each processor sequentially
        return Flux.fromIterable(processors)
            .flatMap(processor -> {
                if (!processor.canProcess(frame.getClass())) {
                    return Flux.just(frame); // Pass through unchanged
                }
                
                return processor.process(frame)
                    .doOnNext(outputFrame -> {
                        // Track output buffers for flushing on interruption
                        trackOutputBuffer(processor.getName(), outputFrame);
                    })
                    .onErrorResume(error -> {
                        log.error("Processor '{}' error: {}", processor.getName(), error.getMessage());
                        return Flux.just(new ErrorFrame(error, processor.getName()));
                    });
            })
            .concatWith(Flux.empty()); // Ensure completion
    }
    
    /**
     * Handle interruption/barge-in event.
     * This is the core of Pipecat's real-time responsiveness.
     */
    private Flux<Frame> handleInterruption(InterruptionFrame interruption) {
        log.info("Pipeline {} received interruption: {} from {}", 
                pipelineId, interruption.getReason(), interruption.getSourceProcessor());
        
        interruptionCount.incrementAndGet();
        isInterrupted.set(true);
        currentInterruption.set(interruption);
        
        // Create interruption context
        InterruptionContext context = new InterruptionContext(
            interruption,
            interruption.getSourceProcessor(),
            System.currentTimeMillis()
        );
        
        // Flush all output buffers immediately
        flushAllBuffers();
        
        // Notify all processors of interruption
        return Flux.fromIterable(processors)
            .flatMap(processor -> {
                if (processor instanceof InterruptibleProcessor interruptible) {
                    return interruptible.onInterruption(context);
                } else {
                    return processor.handleInterruption(context);
                }
            })
            .thenMany(Flux.defer(() -> {
                // After interruption handling, reset state
                isInterrupted.set(false);
                currentInterruption.set(null);
                return Flux.empty();
            }));
    }
    
    /**
     * Track output frames in buffers for quick flushing on interruption.
     */
    private void trackOutputBuffer(String processorName, Frame frame) {
        if (frame instanceof AudioRawFrame) {
            audioOutputBuffer.offer(frame);
        } else if (frame instanceof LLMResponseFrame) {
            llmOutputBuffer.offer(frame);
        } else if (frame instanceof TextFrame && "TTS".equals(processorName)) {
            ttsOutputBuffer.offer(frame);
        }
    }
    
    /**
     * Flush all output buffers immediately on interruption.
     */
    private void flushAllBuffers() {
        log.debug("Flushing buffers for pipeline {}: audio={}, llm={}, tts={}",
                pipelineId, audioOutputBuffer.size(), llmOutputBuffer.size(), ttsOutputBuffer.size());
        
        audioOutputBuffer.clear();
        llmOutputBuffer.clear();
        ttsOutputBuffer.clear();
    }
    
    /**
     * Submit a frame to the pipeline input.
     * Non-blocking - returns immediately.
     */
    public Mono<Void> submit(Frame frame) {
        Frame frameWithSession = addSessionId(frame);
        return Mono.<Void>fromRunnable(() -> {
            Sinks.EmitResult result = inputSink.tryEmitNext(frameWithSession);
            if (result.isFailure()) {
                log.warn("Failed to emit frame to pipeline {}: {}", pipelineId, result);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }
    
    /**
     * Submit multiple frames.
     */
    public Flux<Void> submitAll(Iterable<Frame> frames) {
        return Flux.fromIterable(frames)
            .flatMap(this::submit, 16);
    }
    
    /**
     * Get the output flux for consuming pipeline results.
     */
    public Flux<Frame> getOutput() {
        return outputSink.asFlux();
    }
    
    /**
     * Get output filtered by frame type.
     */
    public <T extends Frame> Flux<T> getOutput(Class<T> frameType) {
        return getOutput().filter(frameType::isInstance).cast(frameType);
    }
    
    /**
     * Start the pipeline.
     */
    public Mono<Void> start() {
        log.info("Starting pipeline {} for session {}", pipelineId, sessionId);
        
        return Flux.fromIterable(processors)
            .flatMap(FrameProcessor::onStart)
            .then()
            .doOnSuccess(v -> {
                // Subscribe to pipeline to start processing
                pipelineSubscription = pipelineFlux.subscribe();
            });
    }
    
    /**
     * Stop the pipeline gracefully.
     */
    public Mono<Void> stop() {
        log.info("Stopping pipeline {}", pipelineId);
        
        if (pipelineSubscription != null) {
            pipelineSubscription.dispose();
        }
        
        return Flux.fromIterable(processors)
            .flatMap(FrameProcessor::onStop)
            .then(Mono.fromRunnable(() -> {
                inputSink.tryEmitComplete();
                outputSink.tryEmitComplete();
                virtualThreadExecutor.shutdown();
                try {
                    if (!virtualThreadExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                        virtualThreadExecutor.shutdownNow();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    virtualThreadExecutor.shutdownNow();
                }
            }));
    }
    
    /**
     * Send an interruption to the pipeline (for barge-in).
     */
    public Mono<Void> interrupt(InterruptionFrame.InterruptionReason reason, String source) {
        InterruptionFrame interruption = new InterruptionFrame(reason, source);
        return submit(interruption);
    }
    
    /**
     * Send a user-started-speaking interruption (barge-in).
     */
    public Mono<Void> bargeIn(String sourceProcessor) {
        return interrupt(InterruptionFrame.InterruptionReason.USER_STARTED_SPEAKING, sourceProcessor);
    }
    
    /**
     * Get pipeline metrics.
     */
    public PipelineMetrics getMetrics() {
        return new PipelineMetrics(
            pipelineId,
            sessionId,
            frameCount.get(),
            interruptionCount.get(),
            lastFrameTime.get(),
            processors.stream().map(FrameProcessor::getName).toList(),
            audioOutputBuffer.size(),
            llmOutputBuffer.size(),
            ttsOutputBuffer.size()
        );
    }
    
    private Frame addSessionId(Frame frame) {
        if (frame.getSessionId() == null) {
            // Create new frame with session ID - would need a builder pattern
            // For now, return as-is (processors should handle session propagation)
            return frame;
        }
        return frame;
    }
    
    @Override
    public void close() {
        stop().block();
    }
    
    // Getters
    public String getPipelineId() { return pipelineId; }
    public String getSessionId() { return sessionId; }
    public List<FrameProcessor> getProcessors() { return List.copyOf(processors); }
    public boolean isInterrupted() { return isInterrupted.get(); }
    public Optional<InterruptionFrame> getCurrentInterruption() { 
        return Optional.ofNullable(currentInterruption.get()); 
    }
    
    /**
     * Pipeline metrics record.
     */
    public record PipelineMetrics(
        String pipelineId,
        String sessionId,
        long totalFramesProcessed,
        long totalInterruptions,
        Instant lastFrameTime,
        List<String> processorNames,
        int audioBufferSize,
        int llmBufferSize,
        int ttsBufferSize
    ) {}
}