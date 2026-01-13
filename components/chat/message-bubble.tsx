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
        {/* Message content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Quick reply options (only for assistant messages with options) */}
        {isAssistant && message.options && message.options.length > 0 && isLatest && (
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

        {/* Timestamp */}
        <div
          className={`mt-1.5 text-xs ${
            isAssistant ? "text-[var(--peek-text-muted)]" : "text-white/70"
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
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
