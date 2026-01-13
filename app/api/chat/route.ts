import { NextRequest, NextResponse } from "next/server";
import { chat, streamChat } from "@/lib/llm/client";
import { getSystemPrompt } from "@/lib/llm/prompts";
import { shoppingExplorationGoals } from "@/lib/llm/question-trees";
import type { Message, Transaction, CheckInSession } from "@/lib/types";

// =============================================================================
// Request/Response Types
// =============================================================================

interface ChatRequest {
  messages: Message[];
  transaction: Transaction;
  session: CheckInSession;
  stream?: boolean;
}

interface ChatResponse {
  message: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
    emoji?: string;
    color?: "yellow" | "white";
  }>;
  assignedMode?: string;
  shouldTransition?: boolean;
  exitGracefully?: boolean;
}

// =============================================================================
// API Route Handler
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;
    const { messages, transaction, session, stream = false } = body;

    // Validate required fields
    if (!messages || !transaction || !session) {
      return NextResponse.json(
        { error: "Missing required fields: messages, transaction, session" },
        { status: 400 }
      );
    }

    // Get exploration goal for current path
    const pathGoal = session.path ? shoppingExplorationGoals[session.path] : null;
    
    // Build question tree section for context
    const questionTreeSection = pathGoal
      ? `### ${session.path?.toUpperCase()} Path
**Goal:** ${pathGoal.goal}

**Probing Hints:**
${pathGoal.probingHints.map((h: string) => `- ${h}`).join("\n")}

**Mode Indicators:**
${Object.entries(pathGoal.modeIndicators)
  .map(([mode, indicators]) => `- ${mode}: ${(indicators as string[]).join(", ")}`)
  .join("\n")}

**Counter-Profile Patterns (graceful exit if detected):**
${pathGoal.counterProfilePatterns.map((p: string) => `- ${p}`).join("\n")}`
      : "";

    // Build system prompt
    const systemPrompt = getSystemPrompt(transaction.category, session.path);

    // Handle streaming response
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const chatMessages = messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }));

            const generator = streamChat({
              messages: chatMessages,
              context: {
                transaction: { ...transaction, date: new Date(transaction.date) },
                session: { ...session, messages: chatMessages },
                userResponses: chatMessages
                  .filter((m) => m.role === "user")
                  .map((m) => m.content),
              },
              systemPrompt,
            });

            for await (const chunk of generator) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Streaming failed";
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
            controller.close();
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

    // Non-streaming response
    const chatMessages = messages.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));

    const response = await chat({
      messages: chatMessages,
      context: {
        transaction: { ...transaction, date: new Date(transaction.date) },
        session: { ...session, messages: chatMessages },
        userResponses: chatMessages
          .filter((m) => m.role === "user")
          .map((m) => m.content),
      },
      systemPrompt,
    });

    const result: ChatResponse = {
      message: response.message,
      options: response.options,
      assignedMode: response.assignedMode,
      shouldTransition: response.shouldTransition,
      exitGracefully: response.exitGracefully,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat API error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("GOOGLE_API_KEY")) {
        return NextResponse.json(
          { error: "API key not configured. Please set GOOGLE_API_KEY in .env.local" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

// =============================================================================
// Health Check
// =============================================================================

export async function GET() {
  return NextResponse.json({
    status: "ok",
    model: process.env.NEXT_PUBLIC_LLM_MODEL || "gemini-2.5-flash",
    configured: !!process.env.GOOGLE_API_KEY,
  });
}
