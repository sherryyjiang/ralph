/**
 * Chat API Client
 * 
 * Client-side helper for calling the chat API route with streaming support.
 */

import type { Message, Transaction, CheckInSession } from "@/lib/types";

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
  rerouteToSubPath?: string;
}

/**
 * Send a chat message to the LLM API (non-streaming)
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to send message" }));
    throw new Error(error.error || "Failed to send message");
  }

  return response.json();
}

/**
 * Send a chat message with streaming response
 * Returns an async generator that yields chunks of text
 */
export async function* streamChatMessage(
  request: ChatRequest
): AsyncGenerator<{ type: "text" | "done" | "error"; content: string }> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to send message" }));
    yield { type: "error", content: error.error || "Failed to send message" };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield { type: "error", content: "No response body" };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        if (!line.startsWith("data: ")) continue;

        const data = line.slice(6); // Remove "data: " prefix

        if (data === "[DONE]") {
          yield { type: "done", content: "" };
          return;
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            yield { type: "error", content: parsed.error };
            return;
          }
          if (parsed.text) {
            yield { type: "text", content: parsed.text };
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Check if the API is configured and healthy
 */
export async function checkApiHealth(): Promise<{
  status: string;
  model: string;
  configured: boolean;
}> {
  const response = await fetch("/api/chat");
  if (!response.ok) {
    throw new Error("API health check failed");
  }
  return response.json();
}
