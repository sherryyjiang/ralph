import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { explorationGoals, getSubPathProbing } from "@/lib/llm/prompts";
import type { Transaction, CheckInSession, Message, LLMResponse } from "@/lib/types";

// =============================================================================
// Configuration
// =============================================================================

const MODEL_ID = process.env.NEXT_PUBLIC_LLM_MODEL || "gemini-2.5-flash";

// Min/max probing exchanges before mode assignment
const MIN_PROBING_DEPTH = 2;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY environment variable is required");
  }
  return new GoogleGenAI({ apiKey });
}

// =============================================================================
// Request/Response Types
// =============================================================================

interface ChatRequest {
  messages: Message[];
  transaction: Transaction;
  session: CheckInSession;
  stream?: boolean;
  probingDepth?: number; // 0-3, tracks Layer 2 probing exchanges
  requestModeAssignment?: boolean; // Trigger mode assignment
}

// =============================================================================
// POST Handler
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;
    const {
      messages,
      transaction,
      session,
      stream,
      probingDepth = 0,
      requestModeAssignment,
    } = body;

    // Validate required fields
    if (!messages || !transaction || !session) {
      return NextResponse.json(
        { error: "Missing required fields: messages, transaction, session" },
        { status: 400 }
      );
    }

    // Get question tree context for the current path
    const questionTreeSection = session.path
      ? getQuestionTreeSection(session.path, session.subPath)
      : undefined;

    // Determine if we should request mode assignment based on probing depth
    const shouldRequestModeAssignment =
      requestModeAssignment ||
      (session.currentLayer === 2 && probingDepth >= MIN_PROBING_DEPTH);

    // Build system prompt with probing depth and mode assignment context
    const systemPrompt = buildSystemPromptWithModeAssignment({
      transaction,
      session,
      questionTreeSection,
      probingDepth,
      requestModeAssignment: shouldRequestModeAssignment,
    });

    // Handle streaming vs non-streaming
    if (stream) {
      return handleStreamingResponse(messages, systemPrompt);
    } else {
      return handleNonStreamingResponse(messages, systemPrompt);
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// =============================================================================
// System Prompt Builder with Mode Assignment
// =============================================================================

interface BuildPromptParams {
  transaction: Transaction;
  session: CheckInSession;
  questionTreeSection?: string;
  probingDepth: number;
  requestModeAssignment: boolean;
}

function buildSystemPromptWithModeAssignment({
  transaction,
  session,
  questionTreeSection,
  probingDepth,
  requestModeAssignment,
}: BuildPromptParams): string {
  const basePrompt = `You are Peek — a warm, curious financial companion. Think: supportive friend who's good with money.

## Tone Guidelines (WARM Framework)

ALWAYS:
- Start with warmth: "That makes sense...", "I hear you...", "Got it..."
- Validate before probing: acknowledge their experience first
- Mirror their language: use their exact words back to them
- Ask ONE question at a time
- Keep responses to 1-2 sentences max

NEVER:
- Lecture or give advice: "You should...", "Consider...", "Have you thought about..."
- Judge: "That's a lot...", "That seems excessive..."
- Be clinical: "Can you elaborate on...", "Describe the circumstances..."
- Over-explain: just ask the question, no preamble needed
- Force enthusiasm: minimal emojis, genuine warmth only

When user shares something hard, validate first:
- "That's real..."
- "I hear you..."
- "That makes sense given..."

Then gently explore with ONE curious question.

## Current Context
- Transaction: $${transaction.amount.toFixed(2)} at ${transaction.merchant}
- Category: ${transaction.category}
- Check-in Layer: ${session.currentLayer}
- Path: ${session.path || "not yet determined"}
- Sub-path: ${session.subPath || "not yet determined"}
- Probing Depth: ${probingDepth}
${session.mode ? `- Assigned Mode: ${session.mode}` : ""}

${questionTreeSection ? `## Question Tree Context\n${questionTreeSection}` : ""}`;

  // Add mode assignment instructions if probing is complete
  if (requestModeAssignment && session.currentLayer === 2) {
    return (
      basePrompt +
      `

## MODE ASSIGNMENT REQUIRED

Based on the conversation so far, you must now:
1. Identify which spending mode best matches the user's behavior
2. Craft a warm, summarizing message that acknowledges what you learned
3. Transition to Layer 3 reflection

Available modes to assign:
- #intuitive-threshold-spender: Buys quickly when price feels right
- #reward-driven-spender: Treats purchases as earned rewards
- #comfort-driven-spender: Uses shopping for emotional comfort
- #routine-treat-spender: Regular self-treating as habit
- #scroll-triggered: Impulse from social media browsing
- #in-store-wanderer: Impulse from in-store browsing
- #aesthetic-driven: Drawn to visual appeal
- #duplicate-collector: Buys similar items repeatedly
- #social-media-influenced: Influenced by online content
- #friend-peer-influenced: Influenced by friends/peers
- #scarcity-driven: Responds to limited availability
- #deal-driven: Motivated by discounts
- #threshold-spending-driven: Adds items to hit thresholds
- #deliberate-budget-saver: Saves up for planned purchases
- #deliberate-deal-hunter: Waits for deals on planned items
- #deliberate-researcher: Researches before buying
- #deliberate-pause-tester: Waits to confirm desire
- #deliberate-low-priority: Gets to low-priority items eventually
- #loyal-repurchaser: Sticks with same products
- #brand-switcher: Tries new alternatives
- #upgrader: Upgrades to better versions
- #gift-giver: Thoughtful about gift purchases

RESPOND WITH JSON:
{
  "message": "Your warm, summarizing message that transitions to reflection",
  "assignedMode": "#mode-id",
  "shouldTransition": true
}

If the user shows COUNTER-PROFILE behavior (intentional when you expected impulsive), include:
{
  "message": "Your acknowledging message",
  "exitGracefully": true
}`
    );
  }

  // Regular Layer 2 probing instructions
  if (session.currentLayer === 2) {
    return (
      basePrompt +
      `

## Layer 2 Probing Instructions

You are in the probing phase. Your goal is to:
1. Ask ONE curious follow-up question based on the user's response
2. Look for mode indicators (patterns that suggest a spending mode)
3. Watch for counter-profile signals (behavior that contradicts the initial path)

Respond with ONLY your conversational message - no JSON, no options.
Keep it natural and empathetic. Don't label or diagnose the user.`
    );
  }

  // Layer 3 reflection instructions
  if (session.currentLayer === 3) {
    const reflectionPath = session.reflectionPath || "problem"; // Default to behavioral excavation
    
    // Mode-based entry questions for behavioral excavation
    const modeEntryQuestions: Record<string, string> = {
      "#intuitive-threshold-spender": "can you think of another time you bought something just because the price felt right?",
      "#reward-driven-spender": "can you think of another time you bought something to celebrate or reward yourself?",
      "#comfort-driven-spender": "can you think of another time you shopped because you were stressed or needed a pick-me-up?",
      "#routine-treat-spender": "can you think of another time you treated yourself as part of your regular routine?",
      "#scroll-triggered": "can you think of another time something caught your eye while scrolling and you went for it?",
      "#in-store-wanderer": "can you think of another time something caught your eye in a store and you went for it?",
      "#aesthetic-driven": "can you think of another time something visually appealing made you want to buy it?",
      "#duplicate-collector": "can you think of another time you bought something similar to things you already have?",
      "#social-media-influenced": "can you think of another time you bought something because you saw it on social media?",
      "#friend-peer-influenced": "can you think of another time you bought something because a friend had it?",
      "#scarcity-driven": "can you think of another time you bought something because it was running out or limited?",
      "#deal-driven": "can you think of another time a sale or deal made you go for something?",
      "#threshold-spending-driven": "can you think of another time you added stuff to hit free shipping or get a bonus?",
    };
    
    const entryQuestion = session.mode ? modeEntryQuestions[session.mode] : undefined;
    
    // Behavioral excavation probing hints
    const behavioralProbingHints = `
### Probing Question Hints (use progressively):
1. FREQUENCY: "does this feel like something that happens a lot, sometimes, or rarely?"
2. USAGE/OUTCOME: "what usually happens with the stuff that slides through — do you end up using it?"
3. COMFORT: "does that sit okay with you or is there something about it that bugs you?"
4. ROOT CAUSE (if it bugs them): "if it doesn't feel great, what do you think is behind that?"
5. BARRIERS (if pattern persists): "you said it bugs you but it keeps happening — what do you think gets in the way?"`;
    
    // Reflection path-specific instructions
    const reflectionInstructions: Record<string, string> = {
      problem: `## BEHAVIORAL EXCAVATION PATH ("Is this a problem?")

**Goal**: Surface how often autopilot behavior kicks in, and whether they're using what they buy or it's piling up.

${entryQuestion ? `**Mode-Based Entry Question** (use this to start):
"${entryQuestion}"` : ""}

${behavioralProbingHints}

**Guidelines**:
- Never tell them they have a problem — help them discover for themselves
- If they say it's fine, validate and don't push
- If they show concern, explore gently without judgment`,

      feel: `## EMOTIONAL REFLECTION PATH ("How do I feel about this?")

**Goal**: Surface gut reactions and help the user name their feelings about the spending.

**Entry**: "Looking at this purchase, how does that land for you?"

**Guidelines**:
- Validate whatever they're feeling first
- Explore the emotion BEHIND the purchase AND how they feel NOW
- If they seem neutral ("meh"), that's fine — don't push
- If they express concern, explore what specifically bothers them`,

      worth: `## COST COMPARISON PATH ("Is this a good use of money?")

**Goal**: Help evaluate value in THEIR terms, not abstract comparisons.

**Entry**: "What did you get out of this purchase?"

**Guidelines**:
- AVOID simple cost comparisons ("that's X cups of coffee") — patronizing
- Ask about value in THEIR terms: joy, utility, alignment with goals
- Explore opportunity cost gently: "is there something else you would have put this toward?"`,
    };
    
    return (
      basePrompt +
      `

## Layer 3 Reflection Instructions

The user has been assigned mode: ${session.mode || "not assigned"}
Reflection path: ${reflectionPath}

${reflectionInstructions[reflectionPath] || reflectionInstructions.problem}

**Closing**: After 2-3 meaningful exchanges, offer to close or continue:
{ "message": "Your closing summary", "exitGracefully": true }`
    );
  }

  return basePrompt;
}

// =============================================================================
// Non-streaming Response Handler
// =============================================================================

async function handleNonStreamingResponse(
  messages: Message[],
  systemPrompt: string
): Promise<NextResponse> {
  const client = getClient();

  // Convert messages to Gemini format
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await client.models.generateContent({
    model: MODEL_ID,
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 500,
    },
  });

  const text = response.text || "";
  const parsedResponse = parseResponse(text);

  return NextResponse.json(parsedResponse);
}

// =============================================================================
// Streaming Response Handler
// =============================================================================

async function handleStreamingResponse(
  messages: Message[],
  systemPrompt: string
): Promise<Response> {
  const client = getClient();

  // Convert messages to Gemini format
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const stream = await client.models.generateContentStream({
    model: MODEL_ID,
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 500,
    },
  });

  // Create a ReadableStream for SSE
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text || "";
          if (text) {
            // Send as SSE data event
            const data = `data: ${JSON.stringify({ text })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        }
        // Send done event
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// =============================================================================
// Response Parsing
// =============================================================================

function parseResponse(text: string): LLMResponse {
  // Try to parse as JSON
  try {
    // Look for JSON in the response (might be wrapped in markdown code blocks)
    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) ||
      text.match(/\{[\s\S]*"message"[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      return {
        message: parsed.message || text,
        options: parsed.options,
        assignedMode: parsed.assignedMode,
        shouldTransition: parsed.shouldTransition ?? false,
        exitGracefully: parsed.exitGracefully ?? false,
      };
    }
  } catch {
    // JSON parsing failed, return as plain text
  }

  // If not valid JSON, treat entire response as message
  return {
    message: text,
    shouldTransition: false,
    exitGracefully: false,
  };
}

// =============================================================================
// Question Tree Section Builder
// =============================================================================

function getQuestionTreeSection(path: string, subPath?: string): string {
  const goal = explorationGoals[path];
  if (!goal) return "";

  // Get sub-path specific probing if available
  const subPathProbing = subPath ? getSubPathProbing(path, subPath) : undefined;

  let section = `
### Path: ${path.toUpperCase()}

**Exploration Goal**: ${goal.goal}

## REQUIRED PROBING QUESTIONS

You MUST use these exact questions or very close variations. Do NOT make up your own questions.

${goal.probingHints.map((h, i) => `${i + 1}. "${h}"`).join("\n")}

### How to use these:
- Start with question #1 if the user just answered Fixed Q2
- If user's response naturally leads to another question, use that one
- Ask ONE question at a time
- After asking 2-3 questions from this list, transition to mode assignment

## QUESTIONS TO AVOID (TOO GENERIC)

❌ "What made you decide to buy this?"
❌ "Can you tell me more about that?"
❌ "What was it about this item that..."
❌ "How did that make you feel?"
❌ "Could you elaborate on that?"
❌ "What factors did you consider?"

These are too vague. Use the SPECIFIC numbered questions above instead.

**Mode Indicators** (look for these patterns):
${goal.modeIndicators.map((m) => `- ${m}`).join("\n")}

**Counter-Profile Patterns** (if detected, exit gracefully):
${
  goal.counterProfilePatterns.length > 0
    ? goal.counterProfilePatterns.map((p) => `- ${p}`).join("\n")
    : "- (No counter-profiles for this path)"
}`;

  // Add sub-path specific context if available
  if (subPathProbing) {
    section += `

### Sub-path: ${subPath?.toUpperCase()}

**Specific Exploration Goal**: ${subPathProbing.explorationGoal}

**Sub-path REQUIRED Probing Questions**:
${subPathProbing.probingHints.map((h, i) => `${i + 1}. "${h}"`).join("\n")}

**Target Modes**: ${subPathProbing.targetModes.join(", ")}

${subPathProbing.lightProbing ? "**Note**: This is a deliberate/intentional path - use LIGHT probing (1 exchange max, then exit gracefully)" : ""}
${subPathProbing.counterProfileExit ? `**Counter-profile Exit**: ${subPathProbing.counterProfileExit}` : ""}`;
  }

  return section;
}
