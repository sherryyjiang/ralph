"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";
import { getTemuMonthlySpend, getTemuTestTransaction } from "@/lib/data/temu-test";
import {
  TEMU_ENTRY_QUESTION,
  TEMU_DIAGNOSIS_QUESTIONS,
  TEMU_EXIT_OPTIONS,
  TEMU_REFLECTION_QUESTIONS,
  getTemuCalibrationResult,
  buildTemuSummaryPrompt,
  buildTemuClosingPrompt,
  getReflectionOptions,
} from "@/lib/llm/question-trees/index";
import type { Message, QuickReplyOption } from "@/lib/types";

type FlowStep = "awareness" | "diagnosis" | "summary" | "reflection_choice" | "reflection_prompt" | "closing";

function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function TemuTestCheckInPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = params.sessionId as string;
  const initialGuess = searchParams.get("guess");

  const transaction = useMemo(() => getTemuTestTransaction(), []);
  const actualSpend = getTemuMonthlySpend();

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<FlowStep>("awareness");
  const [diagnosisIndex, setDiagnosisIndex] = useState(0);
  const [diagnosisAnswers, setDiagnosisAnswers] = useState<string[]>([]);
  const [guess, setGuess] = useState<number | null>(null);
  const [reflectionPath, setReflectionPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasInitialized = useRef(false);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `user_${Date.now()}`, role: "user", content, timestamp: new Date() },
    ]);
  }, []);

  const addAssistantMessage = useCallback((content: string, options?: QuickReplyOption[]) => {
    setMessages((prev) => [
      ...prev,
      { id: `assistant_${Date.now()}`, role: "assistant", content, timestamp: new Date(), options },
    ]);
  }, []);

  const fetchSummary = useCallback(async (answers: string[], guessValue: number) => {
    setIsLoading(true);
    try {
      const prompt = buildTemuSummaryPrompt({
        guess: guessValue,
        actual: actualSpend,
        diagnosisAnswers: answers,
      });

      const response = await fetch("/api/temu-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to get summary");
      }

      const data = await response.json();
      return data.message as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get summary");
      return "Thanks for sharing that — I can see a few patterns already. Want to explore any of these?";
    } finally {
      setIsLoading(false);
    }
  }, [actualSpend]);

  const fetchClosing = useCallback(async (path: string, answer: string) => {
    setIsLoading(true);
    try {
      const prompt = buildTemuClosingPrompt({
        reflectionPath: path,
        reflectionAnswer: answer,
        actual: actualSpend,
      });

      const response = await fetch("/api/temu-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to get closing");
      }

      const data = await response.json();
      return data.message as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get closing");
      return "Thanks for reflecting on this with me. If you want to revisit it later, I'm here.";
    } finally {
      setIsLoading(false);
    }
  }, [actualSpend]);

  const advanceDiagnosis = useCallback(
    async (answer: string) => {
      const updatedAnswers = [...diagnosisAnswers, answer];
      setDiagnosisAnswers(updatedAnswers);

      if (diagnosisIndex < TEMU_DIAGNOSIS_QUESTIONS.length - 1) {
        const nextIndex = diagnosisIndex + 1;
        setDiagnosisIndex(nextIndex);
        setTimeout(() => {
          const nextQ = TEMU_DIAGNOSIS_QUESTIONS[nextIndex];
          addAssistantMessage(nextQ.content, nextQ.options);
        }, 350);
        return;
      }

      const summary = await fetchSummary(updatedAnswers, guess || actualSpend);
      addAssistantMessage(summary);

      const reflectionOptions = getReflectionOptions();
      addAssistantMessage(reflectionOptions.content, reflectionOptions.options);
      setCurrentStep("reflection_choice");
    },
    [addAssistantMessage, diagnosisAnswers, diagnosisIndex, fetchSummary, guess, actualSpend]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      addUserMessage(content);

      if (currentStep === "awareness") {
        const guessValue = parseCurrencyInput(content);
        setGuess(guessValue);

        const calibration = getTemuCalibrationResult(guessValue, actualSpend);
        addAssistantMessage(calibration.message);

        setCurrentStep("diagnosis");
        setDiagnosisIndex(0);
        setTimeout(() => {
          const firstQ = TEMU_DIAGNOSIS_QUESTIONS[0];
          addAssistantMessage(firstQ.content, firstQ.options);
        }, 400);
        return;
      }

      if (currentStep === "diagnosis") {
        await advanceDiagnosis(content);
        return;
      }

      if (currentStep === "reflection_prompt" && reflectionPath) {
        const closing = await fetchClosing(reflectionPath, content);
        addAssistantMessage(closing, TEMU_EXIT_OPTIONS);
        setCurrentStep("closing");
        return;
      }

      if (currentStep === "closing") {
        router.push("/");
      }
    },
    [addAssistantMessage, addUserMessage, advanceDiagnosis, actualSpend, currentStep, fetchClosing, reflectionPath, router]
  );

  useEffect(() => {
    if (messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setMessages([
        {
          id: `assistant_${Date.now()}`,
          role: "assistant",
          content: TEMU_ENTRY_QUESTION,
          timestamp: new Date(),
        },
      ]);

      if (initialGuess) {
        setTimeout(() => {
          handleSendMessage(initialGuess);
        }, 200);
      }
    }
  }, [messages.length, initialGuess, handleSendMessage]);

  const handleOptionSelect = useCallback(
    async (value: string) => {
      const lastMessage = messages[messages.length - 1];
      const selectedOption = lastMessage?.options?.find((o) => o.value === value);
      const displayText = selectedOption?.label || value;

      addUserMessage(displayText);

      if (currentStep === "diagnosis") {
        await advanceDiagnosis(displayText);
        return;
      }

      if (currentStep === "reflection_choice") {
        if (value === "done") {
          addAssistantMessage("Got it — thanks for walking through this with me.", TEMU_EXIT_OPTIONS);
          setCurrentStep("closing");
          return;
        }

        setReflectionPath(value);
        const question = TEMU_REFLECTION_QUESTIONS[value];
        addAssistantMessage(question);
        setCurrentStep("reflection_prompt");
        return;
      }

      if (currentStep === "closing" || value === "close") {
        router.push("/");
      }
    },
    [addAssistantMessage, addUserMessage, advanceDiagnosis, currentStep, messages, router]
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
        <h1 className="text-sm font-medium text-white">Temu Check-In</h1>
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
