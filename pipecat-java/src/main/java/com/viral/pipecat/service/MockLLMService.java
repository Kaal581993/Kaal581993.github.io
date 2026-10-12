package com.viral.pipecat.service;

import com.viral.pipecat.frame.*;
import com.viral.pipecat.service.LLMService.Config;
import com.viral.pipecat.service.LLMService.Message;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Mock LLM service with sales executive personality.
 * Simulates streaming token generation with realistic delays.
 */
public class MockLLMService implements LLMService {
    private static final Logger log = LoggerFactory.getLogger(MockLLMService.class);
    
    private final Config config;
    private final AtomicReference<String> systemPrompt = new AtomicReference<>(DEFAULT_SYSTEM_PROMPT);
    private final Map<String, List<Message>> conversationHistory = new ConcurrentHashMap<>();
    private final Map<String, SalesStage> salesStages = new ConcurrentHashMap<>();
    
    // Sales executive responses based on conversation stage
    private static final String DEFAULT_SYSTEM_PROMPT = """
        You are VIRAL'S AI SALES EXECUTIVE — a highly persuasive, diplomatic, and results-driven sales specialist representing Viral Prajapati, a Freelance Java Developer & Application Support Engineer with 5+ years of experience.

        YOUR MISSION: Convert every conversation into a booked discovery call (Mon-Fri, 9AM-6PM IST) or a signed proposal request.

        PERSONALITY TRAITS:
        - Confident but not arrogant — you know the value Viral delivers
        - Diplomatically persistent — you overcome objections with evidence, not pressure
        - Consultative seller — you diagnose pain points before prescribing solutions
        - Urgency creator — you make prospects feel the cost of inaction
        - Professional warmth — you build genuine rapport, not transactional relationships

        VIRAL'S VALUE PROPOSITION:
        - Java 8/11/17, Spring Boot, Microservices, Kafka, SQL expertise
        - Production support, incident management, RCA, SLA optimization
        - Healthcare (HL7/FHIR), FinTech, SaaS, Hospitality domain experience
        - Remote collaboration across Australia, Europe, North America, APAC, MENA
        - SQL performance tuning, database optimization, schema design
        - 5+ years bridging engineering and business outcomes

        CONVERSATION FLOW:
        1. HOOK (0-30s): Acknowledge their interest, establish authority with a relevant insight
        2. DISCOVERY (30s-3min): Ask targeted questions to uncover pain points
           - "What's the biggest bottleneck in your current backend architecture?"
           - "How much does production downtime cost you per hour?"
           - "Are you struggling with Kafka consumer lag or SQL query performance?"
        3. QUALIFICATION: Confirm budget authority, timeline, technical fit
        4. VALUE DEMONSTRATION: Share specific, quantified results from similar engagements
        5. CALL TO ACTION: "Let's book a 30-min discovery call this week — I have Tuesday 2PM or Thursday 10AM IST open. Which works?"
        6. OBJECTION HANDLING: 
           - "Too expensive" → "Compared to a senior hire at ₹25L+/year? Viral delivers senior outcomes at fraction of cost."
           - "Not ready" → "The best time to fix architecture is before it breaks. Let's pencil in a call for when you are ready."
           - "Need to think" → "Absolutely. What specific concerns can I address now so your thinking is productive?"

        EMAIL/CALL SCHEDULING:
        - When prospect agrees, collect: name, email, company, preferred time slots (Mon-Fri 9AM-6PM IST)
        - Confirm: "I'll send a calendar invite with Zoom link to [email]. You'll also receive a brief questionnaire to maximize our 30 minutes."
        - Tone: Confident, assumptive close — "Looking forward to speaking Tuesday at 2PM IST!"

        NEVER:
        - Sound desperate or pushy
        - Make up fake credentials
        - Promise unrealistic timelines
        - Talk past the close

        ALWAYS:
        - Mirror their language and terminology
        - Use silence strategically after asking questions
        - End every interaction with a clear next step
        """;
    
    // Pre-canned responses for different stages
    private static final Map<SalesStage, List<String>> STAGE_RESPONSES = Map.of(
        SalesStage.HOOK, List.of(
            "Excellent — Spring Boot microservices at scale is exactly where Viral shines. He's architected event-driven systems with Kafka handling 50K+ events/sec and reduced consumer lag by 80% for a FinTech client. Tell me: what's your current pain point? Consumer lag? Deployment failures? Database bottlenecks?",
            "Perfect timing. Viral just helped a SaaS platform cut their deployment rollback rate from 15% to under 2% using blue-green deployments and automated smoke testing. What's the biggest stability challenge keeping you up at night?"
        ),
        SalesStage.DISCOVERY, List.of(
            "That's a classic challenge. Most teams don't realize Kafka consumer lag isn't just a monitoring problem — it's usually partition strategy or consumer group sizing. How many partitions are you running, and what's your current consumer count?",
            "SQL performance at scale — been there. Viral once optimized a 47-second query down to 800ms by adding the right composite indexes and rewriting a correlated subquery. What's your current query volume and p95 latency?",
            "Production downtime cost... that's the number that gets CTO attention. Viral's incident response runbooks cut MTTR from 45 minutes to under 8 for a healthcare client. What's your current MTTR and SLA target?"
        ),
        SalesStage.QUALIFICATION, List.of(
            "Great questions. Viral typically engages on a 3-month minimum for architecture work, or project-based for specific optimizations. Budget-wise, his rate is a fraction of a senior FTE — no benefits, no ramp time, immediate productivity. What's your timeline for engagement?",
            "Understood. For a discovery call, I'd need: your name, email, company, and 2-3 preferred time slots Mon-Fri 9AM-6PM IST. I'll send a calendar invite with Zoom link and a brief questionnaire so we hit the ground running."
        ),
        SalesStage.VALUE_DEMO, List.of(
            "Here's a concrete example: A FinTech client had Kafka consumer lag hitting 2M messages during peak. Viral restructured their topic partitions, implemented priority consumers, and added backpressure handling. Lag dropped to <10K within 48 hours. Zero code changes to producers. That's the kind of surgical fix Viral delivers.",
            "Another one: E-commerce platform with 200+ microservices. Deployment failures were 12% due to flaky integration tests. Viral implemented contract testing with Pact, testcontainers for DB, and parallel test execution. Failure rate dropped to 1.5%, deploy time from 45min to 12min. ROI in week one."
        ),
        SalesStage.CLOSE, List.of(
            "Let's book that discovery call. I have Tuesday 2PM IST or Thursday 10AM IST open this week. Which works better? I'll send the calendar invite with Zoom link to your email.",
            "Perfect. Thursday 10AM IST it is. What's the best email for the calendar invite? I'll also send a 5-question questionnaire so Viral can prepare specific architecture recommendations for your stack."
        ),
        SalesStage.OBJECTION_HANDLING, List.of(
            "I hear you. Compared to a senior backend hire at ₹25-35L/year plus benefits, ramp time, and management overhead? Viral delivers senior outcomes immediately at a fraction of that cost. Plus you only pay for what you need. Want to see a sample engagement proposal?",
            "Totally fair. The best time to fix architecture is before it breaks — reactive firefighting costs 10x more than proactive optimization. Let's pencil in a 30-min call for when you're ready. When's a good window next week?",
            "Absolutely. What specific concerns can I address now so your thinking is productive? Budget? Timeline? Technical approach? Viral's happy to do a free 30-min architecture review to scope the engagement properly."
        )
    );
    
    public MockLLMService() {
        this(Config.defaultConfig());
    }
    
    public MockLLMService(Config config) {
        this.config = config;
    }
    
    @Override
    public String getName() {
        return "MockLLMService";
    }
    
    @Override
    public Flux<LLMResponseFrame> generateResponse(String userInput, String sessionId) {
        // Update conversation history
        conversationHistory.computeIfAbsent(sessionId, k -> new ArrayList<>())
            .add(Message.user(userInput));
        
        // Determine sales stage
        SalesStage stage = salesStages.getOrDefault(sessionId, SalesStage.HOOK);
        List<String> responses = STAGE_RESPONSES.getOrDefault(stage, STAGE_RESPONSES.get(SalesStage.HOOK));
        
        // Select response based on input keywords
        String response = selectResponse(userInput, responses, stage);
        
        // Advance stage
        advanceStage(sessionId, userInput, stage);
        
        log.debug("LLM generating response for session {} at stage {}: {}", sessionId, stage, response.substring(0, Math.min(50, response.length())));
        
        // Stream response token by token (simulated)
        return streamResponse(response, sessionId);
    }
    
    private String selectResponse(String input, List<String> responses, SalesStage stage) {
        String lower = input.toLowerCase();
        
        // Check for objection keywords
        if (stage != SalesStage.OBJECTION_HANDLING && 
            (lower.contains("expensive") || lower.contains("cost") || lower.contains("budget") ||
             lower.contains("not ready") || lower.contains("later") || lower.contains("think about"))) {
            return STAGE_RESPONSES.get(SalesStage.OBJECTION_HANDLING).get(0);
        }
        
        // Check for buying signals
        if (lower.contains("book") || lower.contains("schedule") || lower.contains("call") ||
            lower.contains("meet") || lower.contains("interested") || lower.contains("proceed")) {
            return STAGE_RESPONSES.get(SalesStage.CLOSE).get(0);
        }
        
        // Return random response from current stage
        return responses.get(new Random().nextInt(responses.size()));
    }
    
    private void advanceStage(String sessionId, String input, SalesStage currentStage) {
        SalesStage nextStage = switch (currentStage) {
            case HOOK -> SalesStage.DISCOVERY;
            case DISCOVERY -> SalesStage.QUALIFICATION;
            case QUALIFICATION -> SalesStage.VALUE_DEMO;
            case VALUE_DEMO -> SalesStage.CLOSE;
            case CLOSE, OBJECTION_HANDLING -> SalesStage.CLOSE;
        };
        
        // Check if we should advance
        if (input.split("\\s+").length > 5 || input.contains("?") || input.length() > 100) {
            salesStages.put(sessionId, nextStage);
        }
    }
    
    private Flux<LLMResponseFrame> streamResponse(String fullResponse, String sessionId) {
        // Split into "tokens" (words + punctuation)
        String[] tokens = fullResponse.split("(?<=\\s)|(?=\\p{Punct})|(?<=\\p{Punct})");
        
        return Flux.fromArray(tokens)
            .filter(t -> !t.isBlank())
            .index()
            .map(tuple -> {
                int index = tuple.getT1().intValue();
                String token = tuple.getT2();
                boolean isFirst = index == 0;
                boolean isLast = index == tokens.length - 1;
                
                return new LLMResponseFrame(
                    token + (index < tokens.length - 1 ? " " : ""),
                    isLast,
                    config.model(),
                    index,
                    tokens.length,
                    isFirst
                ).withSessionId(sessionId);
            })
            .delayElements(Duration.ofMillis(30 + new Random().nextInt(70))) // Realistic streaming delay
            .doOnComplete(() -> {
                conversationHistory.computeIfAbsent(sessionId, k -> new ArrayList<>())
                    .add(Message.assistant(fullResponse));
            });
    }
    
    @Override
    public void setSystemPrompt(String systemPrompt) {
        this.systemPrompt.set(systemPrompt);
        log.info("System prompt updated for LLM service");
    }
    
    @Override
    public String getSystemPrompt() {
        return systemPrompt.get();
    }
    
    @Override
    public Flux<Frame> handleSystemCommand(SystemFrame frame) {
        if (frame.getCommand() == SystemFrame.SystemCommand.CONFIG_UPDATE) {
            var payload = frame.getPayload();
            if (payload.containsKey("systemPrompt")) {
                setSystemPrompt((String) payload.get("systemPrompt"));
            }
        }
        return Flux.empty();
    }
    
    public void resetSession(String sessionId) {
        conversationHistory.remove(sessionId);
        salesStages.remove(sessionId);
    }
    
    enum SalesStage {
        HOOK, DISCOVERY, QUALIFICATION, VALUE_DEMO, CLOSE, OBJECTION_HANDLING
    }
}