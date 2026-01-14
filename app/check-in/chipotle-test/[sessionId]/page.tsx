"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";
import { getChipotleTestTransaction } from "@/lib/data/chipotle-test";
import {
  getChipotleWorthItQuestion,
  getChipotleFollowUpQuestion,
  getChipotleConclusionMessage,
  CHIPOTLE_EXIT_OPTIONS,
} from "@/lib/llm/question-trees/chipotle-test";
import type { QuickReplyOption } from "@/lib/types";

// Flow steps
type FlowStep = "worth_it" | "follow_up" | "conclusion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  options?: QuickReplyOption[];
}

export default function ChipotleTestCheckInPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = params.sessionId as string;
  const entryReason = searchParams.get("reason");

  const transaction = getChipotleTestTransaction();

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<FlowStep>("worth_it");
  const [wasWorthIt, setWasWorthIt] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasInitialized = useRef(false);

  // Initialize with first question
  useEffect(() => {
    if (messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;

      const worthItQ = getChipotleWorthItQuestion();
      const initialMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: worthItQ.content,
        timestamp: new Date(),
        options: worthItQ.options,
      };
      setMessages([initialMessage]);
    }
  }, [messages.length]);

  const addUserMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
  }, []);

  const addAssistantMessage = useCallback((content: string, options?: QuickReplyOption[]) => {
    const assistantMessage: Message = {
      id: `assistant_${Date.now()}`,
      role: "assistant",
      content,
      timestamp: new Date(),
      options,
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  const handleOptionSelect = useCallback(
    (value: string) => {
      const lastMessage = messages[messages.length - 1];
      const selectedOption = lastMessage?.options?.find((o) => o.value === value);
      const displayText = selectedOption?.label || value;

      addUserMessage(displayText);

      if (value === "close") {
        router.push("/");
        return;
      }

      if (currentStep === "worth_it") {
        const worthIt = value === "yes";
        setWasWorthIt(worthIt);
        setCurrentStep("follow_up");

        setTimeout(() => {
          const followUpQ = getChipotleFollowUpQuestion(worthIt);
          addAssistantMessage(followUpQ.content, followUpQ.options);
        }, 400);
      } else if (currentStep === "follow_up") {
        setCurrentStep("conclusion");

        setTimeout(() => {
          const conclusion = getChipotleConclusionMessage();
          addAssistantMessage(conclusion, CHIPOTLE_EXIT_OPTIONS);
        }, 400);
      }
    },
    [messages, currentStep, addUserMessage, addAssistantMessage, router]
  );

  // Handle free-form text input
  const handleSendMessage = useCallback(
    (content: string) => {
      addUserMessage(content);

      // For free-form input, acknowledge and continue to next step
      if (currentStep === "worth_it") {
        // Interpret as "yes" if positive sentiment, otherwise ask again
        const isPositive = /yes|yeah|yep|worth|good|great/i.test(content);
        setWasWorthIt(isPositive);
        setCurrentStep("follow_up");

        setTimeout(() => {
          const followUpQ = getChipotleFollowUpQuestion(isPositive);
          addAssistantMessage(followUpQ.content, followUpQ.options);
        }, 400);
      } else if (currentStep === "follow_up") {
        setCurrentStep("conclusion");

        setTimeout(() => {
          const conclusion = getChipotleConclusionMessage();
          addAssistantMessage(conclusion, CHIPOTLE_EXIT_OPTIONS);
        }, 400);
      } else {
        // At conclusion, just close
        setTimeout(() => {
          router.push("/");
        }, 400);
      }
    },
    [currentStep, addUserMessage, addAssistantMessage, router]
  );

  const handleClose = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="h-screen bg-[var(--peek-bg-primary)]">
      <header className="flex items-center justify-between border-b border-white/5 bg-[var(--peek-bg-card)] px-4 py-3">
        <button
          onClick={handleClose}
          className="rounded-lg p-2 text-[var(--peek-text-muted)] hover:bg-white/10"
        >
          ← Back
        </button>
        <h1 className="text-sm font-medium text-white">Chipotle Check-In</h1>
        <button
          onClick={handleClose}
          className="rounded-lg p-2 text-[var(--peek-text-muted)] hover:bg-white/10"
          aria-label="Close check-in"
        >
          ✕
        </button>
      </header>

      <div className="h-[calc(100vh-60px)]">
        <ChatContainer
          messages={messages}
          transaction={transaction}
          isLoading={isLoading}
          error={error}
          onSendMessage={handleSendMessage}
          onOptionSelect={handleOptionSelect}
          onRetry={() => setError(null)}
        />
      </div>
    </div>
  );
}
