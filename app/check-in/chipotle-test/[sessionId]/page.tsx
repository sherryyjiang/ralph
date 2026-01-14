"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";
import { getChipotleTestTransaction } from "@/lib/data/chipotle-test";
import {
  getChipotleWorthItQuestion,
  getChipotleFollowUpQuestion,
  buildChipotleConclusionPrompt,
  CHIPOTLE_EXIT_OPTIONS,
} from "@/lib/llm/question-trees/chipotle-test";
import type { QuickReplyOption } from "@/lib/types";

// Flow steps
type FlowStep = "worth_it" | "follow_up" | "conclusion";
type WorthAnswer = "yes" | "no" | "meh";

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
  const entryReason = searchParams.get("reason") || "unknown";

  const transaction = getChipotleTestTransaction();

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<FlowStep>("worth_it");
  const [worthAnswer, setWorthAnswer] = useState<WorthAnswer | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState<string | null>(null);
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

  // Call LLM for conclusion
  const fetchConclusion = useCallback(async (entry: string, worth: string, followUp: string) => {
    setIsLoading(true);
    try {
      const prompt = buildChipotleConclusionPrompt(entry, worth, followUp);

      const response = await fetch("/api/chipotle-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to get conclusion");
      }

      const data = await response.json();
      setIsLoading(false);
      return data.message;
    } catch (err) {
      setIsLoading(false);
      // Fallback message if LLM fails
      return "Thanks for sharing! Peek appreciates you taking the time to reflect. We'll continue to learn more about you and your patterns, especially around food. 🌯";
    }
  }, []);

  const handleOptionSelect = useCallback(
    async (value: string) => {
      const lastMessage = messages[messages.length - 1];
      const selectedOption = lastMessage?.options?.find((o) => o.value === value);
      const displayText = selectedOption?.label || value;

      addUserMessage(displayText);

      if (value === "close") {
        router.push("/");
        return;
      }

      if (currentStep === "worth_it") {
        const answer = value as WorthAnswer;
        setWorthAnswer(answer);
        setCurrentStep("follow_up");

        setTimeout(() => {
          const followUpQ = getChipotleFollowUpQuestion(answer);
          addAssistantMessage(followUpQ.content, followUpQ.options);
        }, 400);
      } else if (currentStep === "follow_up") {
        setFollowUpAnswer(value);
        setCurrentStep("conclusion");

        // Fetch LLM conclusion
        const conclusion = await fetchConclusion(entryReason, worthAnswer || "unknown", value);
        addAssistantMessage(conclusion, CHIPOTLE_EXIT_OPTIONS);
      }
    },
    [messages, currentStep, worthAnswer, entryReason, addUserMessage, addAssistantMessage, fetchConclusion, router]
  );

  // Handle free-form text input
  const handleSendMessage = useCallback(
    async (content: string) => {
      addUserMessage(content);

      if (currentStep === "worth_it") {
        // Interpret free-form as best guess
        let answer: WorthAnswer = "meh";
        if (/yes|yeah|yep|worth|good|great|definitely/i.test(content)) {
          answer = "yes";
        } else if (/no|nope|not worth|waste|regret/i.test(content)) {
          answer = "no";
        }
        setWorthAnswer(answer);
        setCurrentStep("follow_up");

        setTimeout(() => {
          const followUpQ = getChipotleFollowUpQuestion(answer);
          addAssistantMessage(followUpQ.content, followUpQ.options);
        }, 400);
      } else if (currentStep === "follow_up") {
        setFollowUpAnswer(content);
        setCurrentStep("conclusion");

        // Use the free-form text as the follow-up answer
        const conclusion = await fetchConclusion(entryReason, worthAnswer || "unknown", content);
        addAssistantMessage(conclusion, CHIPOTLE_EXIT_OPTIONS);
      } else {
        // At conclusion, just close
        router.push("/");
      }
    },
    [currentStep, worthAnswer, entryReason, addUserMessage, addAssistantMessage, fetchConclusion, router]
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
