// LLM Client Wrapper for Peek Check-In Chat
// Uses Cerebras with OpenAI-compatible API
// Model switching via NEXT_PUBLIC_LLM_MODEL environment variable

import OpenAI from "openai";
import type { CheckInContext, LLMResponse, Message } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

// Model ID from environment variable with fallback
const MODEL_ID = process.env.NEXT_PUBLIC_LLM_MODEL || "zai-glm-4.6";

// Cerebras API base URL
const BASE_URL = "https://api.cerebras.ai/v1";

// Initialize client (will use CEREBRAS_API_KEY from environment)
function getClient(): OpenAI {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "CEREBRAS_API_KEY environment variable is required. Add it to .env.local"
    );
  }
  return new OpenAI({ 
    apiKey,
    baseURL: BASE_URL,
  });
}

// ═══════════════════════════════════════════════════════════════
// CHAT FUNCTION
// ═══════════════════════════════════════════════════════════════

export interface ChatOptions {
  messages: Message[];
  context: CheckInContext;
  systemPrompt: string;
}

export async function chat(options: ChatOptions): Promise<LLMResponse> {
  const { messages, systemPrompt } = options;
  const client = getClient();

  // Build conversation history for the model (OpenAI format)
  const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const response = await client.chat.completions.create({
      model: MODEL_ID,
      messages: openaiMessages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content || "";
    
    // Try to parse as JSON response
    return parseResponse(text);
  } catch (error) {
    console.error("LLM chat error:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// STREAMING CHAT FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function* streamChat(options: ChatOptions): AsyncGenerator<string> {
  const { messages, systemPrompt } = options;
  const client = getClient();

  // Build conversation history for the model (OpenAI format)
  const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const stream = await client.chat.completions.create({
      model: MODEL_ID,
      messages: openaiMessages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 500,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("LLM streaming error:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE PARSING
// ═══════════════════════════════════════════════════════════════

function parseResponse(text: string): LLMResponse {
  // First try to parse as JSON
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

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getCurrentModel(): string {
  return MODEL_ID;
}

export function isConfigured(): boolean {
  return !!process.env.CEREBRAS_API_KEY;
}
