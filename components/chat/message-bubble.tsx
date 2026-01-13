"use client";

import { Message } from "@/lib/types";
import { QuickReply } from "./quick-reply";

interface MessageBubbleProps {
  message: Message;
  onOptionSelect?: (value: string) => void;
  isLatest?: boolean;
}

export function MessageBubble({ message, onOptionSelect, isLatest }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const isStreaming = message.isStreaming;

  return (
    <div
      className={`flex ${isAssistant ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isAssistant
            ? "bg-[var(--peek-bg-card)] text-white rounded-bl-md"
            : "bg-[var(--peek-accent-orange)] text-white rounded-br-md"
        }`}
      >
        {/* Message content with streaming cursor */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-0.5 bg-[var(--peek-accent-orange)] animate-pulse" />
          )}
        </p>

        {/* Show loading dots if streaming and no content yet */}
        {isStreaming && !message.content && (
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--peek-text-muted)] [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--peek-text-muted)] [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--peek-text-muted)] [animation-delay:300ms]" />
          </div>
        )}

        {/* Quick reply options (only for assistant messages with options, not while streaming) */}
        {isAssistant && !isStreaming && message.options && message.options.length > 0 && isLatest && (
          <div className="mt-4 space-y-2">
            {message.options.map((option) => (
              <QuickReply
                key={option.id}
                option={option}
                onSelect={onOptionSelect}
              />
            ))}
          </div>
        )}

        {/* Timestamp (hide while streaming) */}
        {!isStreaming && (
          <div
            className={`mt-1.5 text-xs ${
              isAssistant ? "text-[var(--peek-text-muted)]" : "text-white/70"
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
