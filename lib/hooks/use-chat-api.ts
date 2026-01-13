/**
 * Chat API Hook
 * 
 * Handles communication with the /api/chat endpoint,
 * supporting both streaming and non-streaming responses.
 */

import { useState, useCallback, useRef } from "react";
import type { Message, Transaction, CheckInSession, QuickReplyOption } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

export interface ChatAPIResponse {
  message: string;
  options?: QuickReplyOption[];
  assignedMode?: string;
  shouldTransition?: boolean;
  exitGracefully?: boolean;
}

export interface UseChatAPIOptions {
  transaction: Transaction;
  session: CheckInSession;
  onStreamChunk?: (chunk: string) => void;
  onStreamComplete?: (fullMessage: string) => void;
  onError?: (error: string) => void;
}

export interface UseChatAPIReturn {
  sendMessage: (messages: Message[], stream?: boolean) => Promise<ChatAPIResponse | null>;
  isStreaming: boolean;
  streamedContent: string;
  error: string | null;
  abortStream: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useChatAPI(options: UseChatAPIOptions): UseChatAPIReturn {
  const { transaction, session, onStreamChunk, onStreamComplete, onError } = options;
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async (
    messages: Message[],
    stream = false
  ): Promise<ChatAPIResponse | null> => {
    setError(null);
    
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(m => ({
            ...m,
            timestamp: m.timestamp.toISOString(),
          })),
          transaction: {
            ...transaction,
            date: transaction.date.toISOString(),
          },
          session: {
            ...session,
            messages: session.messages.map(m => ({
              ...m,
              timestamp: m.timestamp.toISOString(),
            })),
            metadata: {
              ...session.metadata,
              startedAt: session.metadata.startedAt?.toISOString(),
              completedAt: session.metadata.completedAt?.toISOString(),
            },
          },
          stream,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }));
        const errorMessage = errorData.error || `HTTP ${response.status}`;
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      }

      // Handle streaming response
      if (stream && response.body) {
        setIsStreaming(true);
        setStreamedContent("");
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                
                if (data === "[DONE]") {
                  setIsStreaming(false);
                  onStreamComplete?.(fullContent);
                  return { message: fullContent };
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    fullContent += parsed.text;
                    setStreamedContent(fullContent);
                    onStreamChunk?.(parsed.text);
                  }
                  if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                } catch {
                  // Ignore JSON parse errors for partial data
                }
              }
            }
          }
        } finally {
          setIsStreaming(false);
        }

        return { message: fullContent };
      }

      // Handle non-streaming response
      const data: ChatAPIResponse = await response.json();
      return data;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          return null; // Request was aborted
        }
        const errorMessage = err.message || "Failed to send message";
        setError(errorMessage);
        onError?.(errorMessage);
      }
      return null;
    } finally {
      abortControllerRef.current = null;
    }
  }, [transaction, session, onStreamChunk, onStreamComplete, onError]);

  return {
    sendMessage,
    isStreaming,
    streamedContent,
    error,
    abortStream,
  };
}
