"use client";

import { useState, useCallback } from "react";
import type { Message, Transaction, CheckInSession, LLMResponse, QuickReplyOption } from "@/lib/types";

interface UseChatApiOptions {
  onStreamChunk?: (chunk: string) => void;
  onComplete?: (response: LLMResponse) => void;
  onError?: (error: string) => void;
}

export function useChatApi(options: UseChatApiOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");

  /**
   * Send a message and get a non-streaming response
   */
  const sendMessage = useCallback(async (
    messages: Message[],
    transaction: Transaction,
    session: CheckInSession
  ): Promise<LLMResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          transaction,
          session,
          stream: false,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get response");
      }

      const data = await response.json() as LLMResponse;
      options.onComplete?.(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  /**
   * Send a message and get a streaming response
   */
  const sendMessageStreaming = useCallback(async (
    messages: Message[],
    transaction: Transaction,
    session: CheckInSession
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setStreamingText("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          transaction,
          session,
          stream: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get response");
      }

      // Read the stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Parse SSE events
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingText(fullText);
                options.onStreamChunk?.(parsed.text);
              }
            } catch {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }

      // Parse the full response as LLMResponse
      const parsedResponse = parseStreamedResponse(fullText);
      options.onComplete?.(parsedResponse);
      
      return fullText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    isLoading,
    error,
    streamingText,
    sendMessage,
    sendMessageStreaming,
    clearError: () => setError(null),
  };
}

/**
 * Parse a streamed text response into LLMResponse format
 */
function parseStreamedResponse(text: string): LLMResponse {
  // Try to parse as JSON
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                      text.match(/\{[\s\S]*"message"[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      return {
        message: parsed.message || text,
        options: parsed.options as QuickReplyOption[] | undefined,
        assignedMode: parsed.assignedMode,
        shouldTransition: parsed.shouldTransition ?? false,
        exitGracefully: parsed.exitGracefully ?? false,
      };
    }
  } catch {
    // JSON parsing failed
  }

  return {
    message: text,
    shouldTransition: false,
    exitGracefully: false,
  };
}
