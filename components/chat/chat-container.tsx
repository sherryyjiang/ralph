"use client";

import { useRef, useEffect } from "react";
import type { Message, Transaction } from "@/lib/types";
import { MessageBubble } from "./message-bubble";
import { CustomInput } from "./custom-input";

interface ChatContainerProps {
  messages: Message[];
  transaction: Transaction;
  isLoading?: boolean;
  error?: string | null;
  onSendMessage: (content: string) => void;
  onOptionSelect: (value: string) => void;
  onRetry?: () => void;
}

export function ChatContainer({
  messages,
  transaction,
  isLoading,
  error,
  onSendMessage,
  onOptionSelect,
  onRetry,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col bg-[var(--peek-bg-primary)]">
      {/* Transaction Context Header */}
      <TransactionHeader transaction={transaction} />

      {/* Messages Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
            onOptionSelect={onOptionSelect}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && <LoadingIndicator />}

        {/* Error display */}
        {error && <ErrorDisplay error={error} onRetry={onRetry} />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/5 p-4">
        <CustomInput
          onSend={onSendMessage}
          disabled={isLoading}
          placeholder="Or type your own response..."
        />
      </div>
    </div>
  );
}

// Transaction header showing context
function TransactionHeader({ transaction }: { transaction: Transaction }) {
  const categoryEmoji = {
    shopping: "🛍️",
    food: "🍔",
    coffee: "☕",
  };

  return (
    <div className="border-b border-white/5 bg-[var(--peek-bg-card)] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--peek-bg-primary)] text-xl">
          {categoryEmoji[transaction.category]}
        </div>
        <div className="flex-1">
          <p className="font-medium text-white">{transaction.merchant}</p>
          <p className="text-sm text-[var(--peek-text-muted)]">
            {formatCurrency(transaction.amount)} · {formatDate(transaction.date)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading dots animation
function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md bg-[var(--peek-bg-card)] px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--peek-text-muted)] [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--peek-text-muted)] [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--peek-text-muted)] [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// Error display component
function ErrorDisplay({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md bg-red-900/30 border border-red-500/30 px-4 py-3 max-w-[85%]">
        <p className="text-sm text-red-300">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

// Error display with retry button
function ErrorDisplay({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-red-900/50 border border-red-500/30 px-4 py-3">
        <div className="flex items-start gap-2">
          <span className="text-red-400 text-lg">⚠️</span>
          <div className="flex-1">
            <p className="text-sm text-red-200">
              Something went wrong: {error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm text-red-300 hover:text-red-100 underline underline-offset-2"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}
