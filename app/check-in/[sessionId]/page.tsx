"use client";

import { useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";
import { useCheckInSession, getCheckInTypeLabel } from "@/lib/hooks/use-check-in-session";
import { useChatAPI } from "@/lib/hooks/use-chat-api";
import { getTransactionById } from "@/lib/data/synthetic-transactions";
import type { QuickReplyOption, TransactionCategory, ShoppingPath, ImpulseSubPath, DealSubPath } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════
// FIXED QUESTIONS - Shopping Check-In (Layer 1)
// ═══════════════════════════════════════════════════════════════

const SHOPPING_FIXED_Q1 = {
  question: "When you bought this, were you...",
  options: [
    { id: "impulse", label: "Saw it and bought it in the moment", emoji: "⚡", value: "impulse", color: "yellow" as const },
    { id: "deliberate", label: "Been thinking about this for a while", emoji: "🤔", value: "deliberate", color: "white" as const },
    { id: "deal", label: "A good deal/discount or limited drop made me go for it", emoji: "🏷️", value: "deal", color: "yellow" as const },
    { id: "gift", label: "Bought it for someone else", emoji: "🎁", value: "gift", color: "white" as const },
    { id: "maintenance", label: "Restocking or replacing", emoji: "🔄", value: "maintenance", color: "white" as const },
  ],
};

const SHOPPING_FIXED_Q2: Record<ShoppingPath, { question: string; options: QuickReplyOption[] }> = {
  impulse: {
    question: "What made you go for it?",
    options: [
      { id: "price_felt_right", label: "The price felt right", emoji: "💰", value: "price_felt_right", color: "yellow" },
      { id: "treating_myself", label: "Treating myself", emoji: "🎁", value: "treating_myself", color: "yellow" },
      { id: "caught_eye", label: "Just caught my eye", emoji: "👀", value: "caught_eye", color: "yellow" },
      { id: "trending", label: "It's been trending lately", emoji: "📈", value: "trending", color: "yellow" },
    ],
  },
  deliberate: {
    question: "What were you waiting for?",
    options: [
      { id: "afford_it", label: "Waiting until I could afford it", emoji: "💳", value: "afford_it", color: "white" },
      { id: "right_price", label: "Waiting for the right price/deal", emoji: "🏷️", value: "right_price", color: "white" },
      { id: "right_one", label: "Waiting for the right one", emoji: "✨", value: "right_one", color: "white" },
      { id: "still_wanted", label: "Letting it sit to see if I still wanted it", emoji: "⏳", value: "still_wanted", color: "white" },
      { id: "got_around", label: "Finally got around to it", emoji: "✅", value: "got_around", color: "white" },
    ],
  },
  deal: {
    question: "Tell me more about the deal, discount, or event?",
    options: [
      { id: "limited_edition", label: "Limited edition or drop running out", emoji: "⚡", value: "limited_edition", color: "yellow" },
      { id: "sale_discount", label: "Good sale, deal, or discount", emoji: "💸", value: "sale_discount", color: "yellow" },
      { id: "free_shipping", label: "Hit free shipping threshold or bonus", emoji: "📦", value: "free_shipping", color: "yellow" },
    ],
  },
  gift: {
    question: "Who was it for?",
    options: [
      { id: "family", label: "Family member", emoji: "👨‍👩‍👧", value: "family", color: "white" },
      { id: "friend", label: "Friend", emoji: "👋", value: "friend", color: "white" },
      { id: "partner", label: "Partner", emoji: "💕", value: "partner", color: "white" },
      { id: "coworker", label: "Coworker", emoji: "💼", value: "coworker", color: "white" },
    ],
  },
  maintenance: {
    question: "Did you get the same thing or switch it up?",
    options: [
      { id: "same_thing", label: "Got the same thing", emoji: "🔁", value: "same_thing", color: "white" },
      { id: "switched_up", label: "Switched it up", emoji: "🔄", value: "switched_up", color: "white" },
      { id: "upgraded", label: "Upgraded", emoji: "⬆️", value: "upgraded", color: "white" },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// FIXED QUESTIONS - Food Check-In (Layer 1)
// ═══════════════════════════════════════════════════════════════

const FOOD_INTRO = {
  question: "Let's check in on your food spending. How much do you think you've spent on food delivery this month?",
  isGuessPrompt: true,
};

// ═══════════════════════════════════════════════════════════════
// FIXED QUESTIONS - Coffee/Treats Check-In (Layer 1)
// ═══════════════════════════════════════════════════════════════

const COFFEE_INTRO = {
  question: "Quick check-in! How many coffee or treat runs do you think you've made this month?",
  isGuessPrompt: true,
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getInitialMessage(category: TransactionCategory, merchantName: string): { content: string; options?: QuickReplyOption[] } {
  switch (category) {
    case "shopping":
      return {
        content: `Let's reflect on your ${merchantName} purchase! ${SHOPPING_FIXED_Q1.question}`,
        options: SHOPPING_FIXED_Q1.options,
      };
    case "food":
      return {
        content: FOOD_INTRO.question,
      };
    case "coffee":
      return {
        content: COFFEE_INTRO.question,
      };
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CheckInPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const sessionId = params.sessionId as string;
  const transactionId = searchParams.get("txn");

  // Find the transaction
  const transaction = useMemo(() => {
    if (!transactionId) return null;
    return getTransactionById(transactionId);
  }, [transactionId]);

  // Handle missing transaction
  if (!transaction) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--peek-bg-primary)]">
        <div className="text-center">
          <p className="text-xl text-white">Transaction not found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-lg bg-[var(--peek-accent-orange)] px-6 py-2 text-white"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <CheckInChat
      sessionId={sessionId}
      transaction={transaction}
      onClose={() => router.push("/")}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// CHECK-IN CHAT COMPONENT
// ═══════════════════════════════════════════════════════════════

interface CheckInChatProps {
  sessionId: string;
  transaction: NonNullable<ReturnType<typeof getTransactionById>>;
  onClose: () => void;
}

function CheckInChat({ sessionId, transaction, onClose }: CheckInChatProps) {
  const {
    session,
    messages,
    isLoading,
    error,
    currentLayer,
    currentPath,
    startSession,
    addAssistantMessage,
    addUserMessage,
    startStreamingMessage,
    appendStreamingContent,
    finishStreamingMessage,
    setPath,
    setSubPath,
    setLayer,
    setLoading,
    setError,
    completeSession,
  } = useCheckInSession(sessionId, transaction);

  // Track if we're currently streaming to prevent multiple calls
  const isStreamingRef = useRef(false);

  // Initialize chat API with streaming callbacks
  const { sendMessage, abortStream } = useChatAPI({
    transaction,
    session,
    onStreamChunk: useCallback((chunk: string) => {
      appendStreamingContent(chunk);
    }, [appendStreamingContent]),
    onStreamComplete: useCallback((fullMessage: string) => {
      // Parse the response to see if it contains options or mode
      isStreamingRef.current = false;
      try {
        // Try to parse JSON from the response
        const jsonMatch = fullMessage.match(/```json\s*([\s\S]*?)\s*```/) ||
                          fullMessage.match(/\{[\s\S]*"message"[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const parsed = JSON.parse(jsonStr);
          finishStreamingMessage(parsed.options);
          return;
        }
      } catch {
        // Not JSON, that's okay
      }
      finishStreamingMessage();
    }, [finishStreamingMessage]),
    onError: useCallback((errorMsg: string) => {
      isStreamingRef.current = false;
      setError(errorMsg);
      setLoading(false);
    }, [setError, setLoading]),
  });

  // Initialize session with first message
  useEffect(() => {
    if (messages.length === 0) {
      startSession();
      const initial = getInitialMessage(transaction.category, transaction.merchant);
      addAssistantMessage(initial.content, initial.options, true);
    }
  }, [messages.length, startSession, addAssistantMessage, transaction.category, transaction.merchant]);

  // Handle user option selection
  const handleOptionSelect = useCallback((value: string) => {
    // Add user's response as message
    const selectedOption = messages[messages.length - 1]?.options?.find(o => o.value === value);
    const displayText = selectedOption?.label || value;
    addUserMessage(displayText);

    // Handle shopping flow based on current state
    if (transaction.category === "shopping") {
      if (currentLayer === 1 && !currentPath) {
        // First fixed question response - set the path
        const path = value as ShoppingPath;
        setPath(path);
        
        // Show Fixed Question 2
        const q2 = SHOPPING_FIXED_Q2[path];
        if (q2) {
          setTimeout(() => {
            addAssistantMessage(q2.question, q2.options, true);
          }, 500);
        }
      } else if (currentLayer === 1 && currentPath) {
        // Second fixed question response - set sub-path and transition to Layer 2
        const subPath = value as ImpulseSubPath | DealSubPath;
        setSubPath(subPath);
        setLayer(2);
        
        // Call LLM API for Layer 2 probing
        setLoading(true);
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { id: `user_${Date.now()}`, role: "user", content: displayText, timestamp: new Date() }],
            transaction,
            session: {
              id: sessionId,
              transactionId: transaction.id,
              type: transaction.category,
              status: "in_progress",
              currentLayer: 2,
              path: currentPath,
              subPath: subPath,
              messages: messages,
              metadata: { tags: [] },
            },
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setLoading(false);
            addAssistantMessage(
              data.message || "Thanks for sharing! I'm curious to understand more about what was going on when you made this purchase. Can you tell me a bit about the context—what were you doing, how were you feeling?",
              data.options,
              false
            );
          })
          .catch(() => {
            setLoading(false);
            addAssistantMessage(
              "Thanks for sharing! I'm curious to understand more about what was going on when you made this purchase. Can you tell me a bit about the context—what were you doing, how were you feeling?",
              undefined,
              false
            );
          });
      }
    }
    
    // Food and Coffee flows will be implemented in later phases
    if (transaction.category === "food" || transaction.category === "coffee") {
      setTimeout(() => {
        addAssistantMessage(
          "Thanks! This check-in type will be fully implemented in a future phase. For now, let me share a quick reflection: being aware of your spending patterns is the first step to making intentional choices.",
          [{ id: "done", label: "Got it, thanks!", emoji: "👍", value: "done", color: "white" }],
          false
        );
      }, 500);
    }
  }, [messages, addUserMessage, addAssistantMessage, transaction.category, currentLayer, currentPath, setPath, setSubPath, setLayer]);

  // Handle free-form text input
  const handleSendMessage = useCallback(async (content: string) => {
    addUserMessage(content);
    setLoading(true);

    try {
      // Call the chat API with streaming
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          transaction,
          session: {
            id: sessionId,
            transactionId: transaction.id,
            type: transaction.category,
            status: "in_progress",
            currentLayer,
            path: currentPath,
            messages,
            metadata: { tags: [] },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setLoading(false);

      // Handle the response
      if (data.shouldTransition && currentLayer === 2) {
        // Transition to Layer 3 reflection
        setLayer(3);
      }

      if (data.exitGracefully) {
        // Graceful exit
        addAssistantMessage(
          data.message,
          [{ id: "close", label: "Thanks for the chat!", emoji: "✨", value: "close", color: "white" }],
          false
        );
        return;
      }

      // Parse options if they exist
      const options = data.options?.map((opt: { id: string; label: string; value: string; emoji?: string; color?: "yellow" | "white" }) => ({
        id: opt.id,
        label: opt.label,
        value: opt.value,
        emoji: opt.emoji,
        color: opt.color || "white",
      }));

      addAssistantMessage(data.message, options, false);

    } catch (error) {
      setLoading(false);
      console.error("Chat API error:", error);
      
      // Fallback response
      if (currentLayer === 2) {
        addAssistantMessage(
          "Thanks for sharing that! Understanding these patterns is the first step to making choices that align with your values. How would you like to explore this further?",
          [
            { id: "problem", label: "Is this a problem?", emoji: "🤔", value: "problem", color: "white" },
            { id: "feel", label: "How do I feel about this?", emoji: "💭", value: "feel", color: "white" },
            { id: "done", label: "I'm good for now", emoji: "✅", value: "done", color: "white" },
          ],
          false
        );
        setLayer(3);
      } else if (currentLayer === 3) {
        addAssistantMessage(
          "Great reflection! Remember, the goal isn't to judge yourself, but to understand your patterns so you can make more intentional choices. See you next time! 👋",
          [{ id: "close", label: "Close", emoji: "✨", value: "close", color: "white" }],
          false
        );
      }
    }
  }, [messages, transaction, sessionId, currentLayer, currentPath, addUserMessage, addAssistantMessage, setLoading, setLayer]);

  // Handle special actions
  const handleOptionSelectWrapper = useCallback((value: string) => {
    if (value === "close" || value === "done") {
      completeSession();
      onClose();
      return;
    }
    handleOptionSelect(value);
  }, [handleOptionSelect, completeSession, onClose]);

  return (
    <div className="h-screen bg-[var(--peek-bg-primary)]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/5 bg-[var(--peek-bg-card)] px-4 py-3">
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-[var(--peek-text-muted)] hover:bg-white/10"
        >
          ← Back
        </button>
        <h1 className="text-sm font-medium text-white">
          {getCheckInTypeLabel(transaction.category)}
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Chat */}
      <div className="h-[calc(100vh-60px)]">
        <ChatContainer
          messages={messages}
          transaction={transaction}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onOptionSelect={handleOptionSelectWrapper}
        />
      </div>
    </div>
  );
}
