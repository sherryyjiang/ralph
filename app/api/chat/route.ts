import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildSystemPrompt, explorationGoals, getSubPathProbing } from "@/lib/llm/prompts";
import type { Transaction, CheckInSession, Message, LLMResponse } from "@/lib/types";

// =============================================================================
// Configuration
// =============================================================================

const MODEL_ID = process.env.NEXT_PUBLIC_LLM_MODEL || "gemini-2.5-flash";

// Min/max probing exchanges before mode assignment
const MIN_PROBING_DEPTH = 2;
const MAX_PROBING_DEPTH = 4;

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
// POST Handler (Non-streaming)
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatRequest;
    const { messages, transaction, session, stream, probingDepth = 0 } = body;

    // Validate required fields
    if (!messages || !transaction || !session) {
      return NextResponse.json(
        { error: "Missing required fields: messages, transaction, session" },
        { status: 400 }
      );
    }

    // Get question tree context for the current path
    const questionTreeSection = session.path 
      ? getQuestionTreeSection(session.path) 
      : undefined;

    // Build system prompt with probing depth for Layer 2
    const systemPrompt = buildSystemPrompt({
      transaction,
      session,
      questionTreeSection,
      probingDepth: session.currentLayer === 2 ? probingDepth : undefined,
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
      "Connection": "keep-alive",
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
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
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

function getQuestionTreeSection(path: string): string {
  const goal = explorationGoals[path];
  if (!goal) return "";

  return `
### Path: ${path.toUpperCase()}

**Exploration Goal**: ${goal.goal}

**Probing Hints** (use these to guide your questions):
${goal.probingHints.map((h) => `- ${h}`).join("\n")}

**Mode Indicators** (look for these patterns):
${goal.modeIndicators.map((m) => `- ${m}`).join("\n")}

**Counter-Profile Patterns** (if detected, exit gracefully):
${goal.counterProfilePatterns.length > 0 
    ? goal.counterProfilePatterns.map((p) => `- ${p}`).join("\n")
    : "- (No counter-profiles for this path)"}
`;
}
