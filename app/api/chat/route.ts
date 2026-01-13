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
  const basePrompt = `You are a friendly, empathetic financial coach helping users understand their spending patterns.
Your tone is warm but not judgmental - like a supportive friend who happens to be good with money.
Keep responses concise (2-3 sentences max).
Never lecture or moralize. Ask curious questions.
If the user seems defensive, validate their feelings first.

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
    return (
      basePrompt +
      `

## Layer 3 Reflection Instructions

The user has been assigned mode: ${session.mode}
Guide them through reflection based on their chosen path.
Be supportive and help them discover insights about their spending.

If they seem ready to close:
{ "message": "Your closing message", "exitGracefully": true }`
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

**Probing Hints** (use these to guide your questions):
${goal.probingHints.map((h) => `- ${h}`).join("\n")}

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

**Sub-path Probing Hints**:
${subPathProbing.probingHints.map((h) => `- ${h}`).join("\n")}

**Target Modes**: ${subPathProbing.targetModes.join(", ")}

${subPathProbing.lightProbing ? "**Note**: This is a deliberate/intentional path - use LIGHT probing (1-2 exchanges max)" : ""}
${subPathProbing.counterProfileExit ? `**Counter-profile Exit**: ${subPathProbing.counterProfileExit}` : ""}`;
  }

  return section;
}
