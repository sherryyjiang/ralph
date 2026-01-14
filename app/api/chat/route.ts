import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { explorationGoals, getSubPathProbing } from "@/lib/llm/prompts";
import { getGracefulExitMessage } from "@/lib/llm/question-trees/index";
import { buildReflectionPrompt } from "@/lib/llm/prompts/layer3-reflection";
import type { ReflectionPathType } from "@/lib/llm/question-trees/types";
import type { Transaction, CheckInSession, Message, LLMResponse } from "@/lib/types";

// =============================================================================
// Configuration - Cerebras with OpenAI-compatible API
// =============================================================================

const MODEL_ID = process.env.NEXT_PUBLIC_LLM_MODEL || "zai-glm-4.6";

// Min/max probing exchanges before mode assignment
const MIN_PROBING_DEPTH = 2;

function getClient(): OpenAI {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    throw new Error("CEREBRAS_API_KEY environment variable is required");
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.cerebras.ai/v1",
  });
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

    // Layer 3 "I'm good for now" should exit immediately with canonical copy.
    if (session.currentLayer === 3 && session.reflectionPath === "done") {
      return NextResponse.json({
        message: getGracefulExitMessage(Boolean(session.mode)),
        exitGracefully: true,
      });
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

## WARM Framework (MUST FOLLOW)

### W - Warm Opening
ALWAYS start responses with warmth. Acknowledge before probing.
Good openers: "That makes sense...", "I hear you...", "Got it...", "Thanks for sharing that...", "Ah, interesting..."

### A - Acknowledge & Validate
Validate their experience BEFORE asking questions.
Validation phrases: "That's totally fair...", "Nothing wrong with that...", "That's a real thing...", "[X] is hard...", "I get it..."

### R - Reflect (Mirror Language)
Use the user's EXACT words back to them.
- If they say "stressed" → use "stressful", not "anxious"
- If they say "grabbed it" → use "grabbed", not "purchased"
- If they say "the deal was too good" → use "good deal", not "discount"

### M - Move Gently
Transition to questions smoothly with phrases like:
"And now...", "Looking back...", "Thinking about it now...", "I'm curious..."

## Response Rules (STRICT)

ALWAYS:
- Start with warmth (use W from WARM)
- Validate before probing (use A from WARM)
- Mirror their language (use R from WARM)
- Ask ONE question at a time
- Keep responses to 1-2 sentences max
- Be genuinely curious, not interrogating

NEVER (these will break the experience):
- Lecture or give advice: "You should...", "Consider...", "Have you thought about...", "It might be better if..."
- Judge spending: "That's a lot...", "That seems excessive...", "You really spent that much?"
- Be clinical: "Can you elaborate on...", "Describe the circumstances...", "Tell me more about the factors..."
- Over-explain: just ask the question directly, no preamble about why you're asking
- Force enthusiasm: "That's great! Amazing! 🎉" — use minimal emojis, genuine warmth only
- Make assumptions about how they feel

## Emotional Moments

When user shares something vulnerable:

REGRET: "Honestly I feel kind of bad about it"
→ Say: "That's real. What is it about this that's creating that feeling?"

DEFENSIVE: "Why does it matter? It's my money"
→ Say: "Totally fair — it is your money. I'm just here to help you think through it if you want to. No pressure either way."

MINIMIZING: "It's not a big deal"
→ Say: "Got it. And if it's not a big deal, that's fine! Is there anything about it that's been on your mind?"

REALIZATION: "Wow I didn't realize I was doing this so often"
→ Say: "Yeah, that can be surprising to see. How does that land for you?"

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

You are in the probing phase. Your CRITICAL task is to:
1. Use ONLY the REQUIRED PROBING QUESTIONS listed above - do NOT make up your own
2. Ask ONE question at a time from the numbered list
3. Look for mode indicators in user's responses
4. Watch for counter-profile signals (intentional behavior when expecting impulsive)

IMPORTANT: Your question MUST come from the "REQUIRED PROBING QUESTIONS" section.
If unsure which to use, start with question #1.

### Response Format:
- Start with warmth (validate what they shared)
- Then ask ONE question from the required list
- Keep to 1-2 sentences max
- Default: No JSON, no options - just your conversational message

### Counter-Profile Response (ONLY if detected):
If the user matches a **Sub-path Counter-Profile Pattern** from the Question Tree Context:
- If **Behavior = EXIT**: respond with JSON:
{ "message": "<use the Sub-path Counter-Profile Exit Message>", "exitGracefully": true }
- If **Behavior = REROUTE**: respond with JSON:
{ "message": "<use the Sub-path Counter-Profile Exit Message>", "rerouteToSubPath": "<use the Sub-path Counter-Profile Reroute Target>" }

In either case, do NOT ask another probing question in the same response.

### Questions You MUST NOT Ask (too generic):
❌ "What made you decide to buy this?"
❌ "Can you tell me more about that?"
❌ "What was it about this item that..."

Use the SPECIFIC numbered questions instead.`
    );
  }

  // Layer 3 reflection instructions
  if (session.currentLayer === 3) {
    const reflectionPath = (session.reflectionPath || "problem") as ReflectionPathType;
    
    // Get the reflection-specific prompt from the consolidated module
    const reflectionInstructions = buildReflectionPrompt(
      reflectionPath,
      session.mode,
      { merchant: transaction.merchant, amount: transaction.amount }
    );
    
    return (
      basePrompt +
      `

## Layer 3 Reflection Instructions

The user has been assigned mode: ${session.mode || "not assigned"}
Reflection path selected: ${reflectionPath}

CRITICAL: This is the user's FIRST message in this reflection path.
You MUST use the exact entry question specified below. DO NOT generate a generic response like "That's a great question to explore" or "What comes to mind?"

${reflectionInstructions}

**After 2-3 meaningful exchanges**, offer to close:
{ "message": "Your closing summary that reflects what you learned about their patterns", "exitGracefully": true }`
    );
  }

  return basePrompt;
}

// =============================================================================
// Non-streaming Response Handler (Cerebras/OpenAI format)
// =============================================================================

async function handleNonStreamingResponse(
  messages: Message[],
  systemPrompt: string
): Promise<NextResponse> {
  const client = getClient();

  // Convert messages to OpenAI format
  const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const response = await client.chat.completions.create({
    model: MODEL_ID,
    messages: openaiMessages,
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 500,
  });

  const text = response.choices[0]?.message?.content || "";
  const parsedResponse = parseResponse(text);

  return NextResponse.json(parsedResponse);
}

// =============================================================================
// Streaming Response Handler (Cerebras/OpenAI format)
// =============================================================================

async function handleStreamingResponse(
  messages: Message[],
  systemPrompt: string
): Promise<Response> {
  const client = getClient();

  // Convert messages to OpenAI format
  const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const stream = await client.chat.completions.create({
    model: MODEL_ID,
    messages: openaiMessages,
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 500,
    stream: true,
  });

  // Create a ReadableStream for SSE
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
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
          rerouteToSubPath: parsed.rerouteToSubPath,
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
  // NOTE: Probing hints ONLY exist at the subpath level, never at the path level
  const subPathProbing = subPath ? getSubPathProbing(path, subPath) : undefined;

  // Probing hints come ONLY from subpath - they don't exist at path level
  const probingHints = subPathProbing?.probingHints || [];
  const explorationGoalText = subPathProbing
    ? `${subPathProbing.explorationGoal} (Sub-path: ${subPath?.toUpperCase()})`
    : goal.goal;

  // Build probing questions section only if we have hints (from subpath)
  const probingSection = probingHints.length > 0 ? `
## REQUIRED PROBING QUESTIONS

You MUST use these exact questions or very close variations. Do NOT make up your own questions.

${probingHints.map((h, i) => `${i + 1}. "${h}"`).join("\n")}

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
` : "";

  // Build mode signals section from subpath probing
  const modeSignalsSection = subPathProbing?.modeSignals && Object.keys(subPathProbing.modeSignals).length > 0
    ? `**Mode Signals** (look for these patterns in the conversation to determine mode):
${Object.entries(subPathProbing.modeSignals).map(([mode, signals]) => 
  `- ${mode}: ${(signals as string[]).map(s => `"${s}"`).join(", ")}`
).join("\n")}`
    : "";

  let section = `
### Path: ${path.toUpperCase()}${subPathProbing ? ` → Sub-path: ${subPath?.toUpperCase()}` : ""}

**Exploration Goal**: ${explorationGoalText}
${probingSection}
${modeSignalsSection}

**Counter-Profile Patterns** (if detected, exit gracefully):
${
  goal.counterProfilePatterns.length > 0
    ? goal.counterProfilePatterns.map((p) => `- ${p}`).join("\n")
    : "- (No counter-profiles for this path)"
}`;

  // Add sub-path specific context if available
  if (subPathProbing) {
    section += `

**Target Modes**: ${subPathProbing.targetModes.join(", ")}

${subPathProbing.lightProbing ? "**Note**: This is a deliberate/intentional path - use LIGHT probing (1 exchange max, then exit gracefully)" : ""}
${subPathProbing.counterProfileExit ? `\n**Counter-Profile Exit Message**: ${subPathProbing.counterProfileExit}` : ""}`;
  }

  return section;
}
