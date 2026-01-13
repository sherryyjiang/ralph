// LLM Client Wrapper for Peek Check-In Chat
// Allows model switching via NEXT_PUBLIC_LLM_MODEL environment variable

import { GoogleGenAI, type GenerateContentResult } from "@google/genai";
import type { CheckInContext, LLMResponse, Message } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

// Model ID from environment variable with fallback
const MODEL_ID = process.env.NEXT_PUBLIC_LLM_MODEL || "gemini-2.5-flash";

// Initialize client (will use GOOGLE_API_KEY from environment)
function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_API_KEY environment variable is required. Add it to .env.local"
    );
  }
  return new GoogleGenAI({ apiKey });
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

  // Build conversation history for the model
  const conversationHistory = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const response: GenerateContentResult = await client.models.generateContent({
      model: MODEL_ID,
      contents: conversationHistory,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 500,
      },
    });

    const text = response.text || "";
    
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

  const conversationHistory = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const stream = await client.models.generateContentStream({
      model: MODEL_ID,
      contents: conversationHistory,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 500,
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
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
  return !!process.env.GOOGLE_API_KEY;
}
