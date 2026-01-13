"use client";

import { useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";
import { useCheckInSession, getCheckInTypeLabel } from "@/lib/hooks/use-check-in-session";
import { getTransactionById } from "@/lib/data/synthetic-transactions";
import { getFixedQuestion1Options } from "@/lib/llm/prompts";
import type { Transaction } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════
// CHECK-IN PAGE
// ═══════════════════════════════════════════════════════════════

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const sessionId = params.sessionId as string;
  const transactionId = searchParams.get("txn");

  // Get transaction from synthetic data
  const transaction = useMemo(() => {
    if (!transactionId) return null;
    return getTransactionById(transactionId);
  }, [transactionId]);

  // If no valid transaction, show error and redirect
  if (!transaction) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a0a2e]">
        <div className="text-center">
          <p className="text-lg text-white">Transaction not found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-lg bg-[#ff7b00] px-6 py-2 font-medium text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <CheckInFlow sessionId={sessionId} transaction={transaction} />;
}

// ═══════════════════════════════════════════════════════════════
// CHECK-IN FLOW COMPONENT
// ═══════════════════════════════════════════════════════════════

function CheckInFlow({
  sessionId,
  transaction,
}: {
  sessionId: string;
  transaction: Transaction;
}) {
  const router = useRouter();

  const {
    session,
    messages,
    isLoading,
    error,
    currentLayer,
    currentPath,
    status,
    startSession,
    addAssistantMessage,
    addUserMessage,
    setPath,
    setSubPath,
    setLayer,
    setLoading,
    setError,
    completeSession,
  } = useCheckInSession(sessionId, transaction);

  // Initialize the conversation when the component mounts
  useEffect(() => {
    if (status === "pending" && messages.length === 0) {
      initializeConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, messages.length]);

  function initializeConversation() {
    startSession();

    // Add welcome message
    const checkInLabel = getCheckInTypeLabel(transaction.category);
    addAssistantMessage(
      `Let's do a quick ${checkInLabel.toLowerCase()}! 👀`
    );

    // After a brief delay, ask the first fixed question
    setTimeout(() => {
      askFixedQuestion1();
    }, 800);
  }

  function askFixedQuestion1() {
    const options = getFixedQuestion1Options(transaction.category);
    
    if (transaction.category === "shopping") {
      addAssistantMessage(
        "When you bought this, were you...",
        options,
        true
      );
    } else if (transaction.category === "food") {
      // For food, we do awareness calibration first
      addAssistantMessage(
        `Take a quick guess: How much do you think you've spent on food delivery this month?`,
        [
          { id: "guess_100", label: "$100 or less", value: "100" },
          { id: "guess_200", label: "$100-200", value: "200" },
          { id: "guess_300", label: "$200-300", value: "300" },
          { id: "guess_400", label: "$300-400", value: "400" },
          { id: "guess_500", label: "$400+", value: "500" },
        ],
        true
      );
    } else if (transaction.category === "coffee") {
      // For coffee, we do frequency calibration
      addAssistantMessage(
        `How many times do you think you've bought coffee or treats this month?`,
        [
          { id: "guess_5", label: "5 or less", value: "5" },
          { id: "guess_10", label: "6-10 times", value: "10" },
          { id: "guess_15", label: "11-15 times", value: "15" },
          { id: "guess_20", label: "16-20 times", value: "20" },
          { id: "guess_25", label: "More than 20", value: "25" },
        ],
        true
      );
    }
  }

  async function handleSendMessage(content: string) {
    addUserMessage(content);
    setLoading(true);

    try {
      // TODO: Send to Gemini API for response
      // For now, simulate a response after a delay
      await simulateResponse(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
    } finally {
      setLoading(false);
    }
  }

  async function handleOptionSelect(value: string) {
    // Find the selected option label for display
    const lastMessage = messages[messages.length - 1];
    const selectedOption = lastMessage?.options?.find((o) => o.value === value);
    const displayText = selectedOption?.label || value;

    addUserMessage(displayText);

    // Handle the selection based on current state
    if (currentLayer === 1 && transaction.category === "shopping") {
      handleShoppingFixedQ1Response(value);
    } else {
      // Continue conversation with LLM
      setLoading(true);
      try {
        await simulateResponse(value);
      } finally {
        setLoading(false);
      }
    }
  }

  function handleShoppingFixedQ1Response(value: string) {
    // Route to appropriate path based on Fixed Q1 response
    switch (value) {
      case "impulse":
        setPath("impulse");
        setTimeout(() => {
          addAssistantMessage(
            "What made you go for it?",
            [
              { id: "price", label: "The price felt right", value: "price-felt-right", color: "yellow" },
              { id: "treat", label: "Treating myself", value: "treating-myself", color: "yellow" },
              { id: "eye", label: "Just caught my eye", value: "caught-my-eye", color: "yellow" },
              { id: "trend", label: "It's been trending lately", value: "trending", color: "yellow" },
              { id: "other", label: "Other", value: "other" },
            ],
            true
          );
        }, 500);
        break;

      case "deliberate":
        setPath("deliberate");
        setTimeout(() => {
          addAssistantMessage(
            "What were you waiting for?",
            [
              { id: "afford", label: "Waiting until I could afford it", value: "afford" },
              { id: "deal", label: "Waiting for the right price/deal", value: "deal" },
              { id: "right-one", label: "Waiting for the right one", value: "right-one" },
              { id: "wanted", label: "Letting it sit to see if I still wanted it", value: "wanted" },
              { id: "got-around", label: "Finally got around to it", value: "got-around" },
              { id: "other", label: "Other", value: "other" },
            ],
            true
          );
        }, 500);
        break;

      case "deal":
        setPath("deal");
        setTimeout(() => {
          addAssistantMessage(
            "Tell me more about the deal, discount or limited event?",
            [
              { id: "limited", label: "Limited edition or drop that is running out", value: "limited-edition", color: "yellow" },
              { id: "sale", label: "It was a good sale, deal or discount", value: "sale-discount", color: "yellow" },
              { id: "threshold", label: "Hit free shipping threshold or got a bonus/sample", value: "threshold-bonus", color: "yellow" },
              { id: "other", label: "Other", value: "other" },
            ],
            true
          );
        }, 500);
        break;

      case "gift":
        setPath("gift");
        setTimeout(() => {
          addAssistantMessage(
            "Who was it for? 🎁",
            undefined,
            false
          );
        }, 500);
        break;

      case "maintenance":
        setPath("maintenance");
        setTimeout(() => {
          addAssistantMessage(
            "Did you get the same thing or switched it up?",
            [
              { id: "same", label: "Same as always", value: "same" },
              { id: "switched", label: "Switched it up", value: "switched" },
              { id: "upgrade", label: "Upgraded", value: "upgrade" },
            ],
            true
          );
        }, 500);
        break;

      default:
        // Handle "other" or custom responses
        setLoading(true);
        simulateResponse(value).finally(() => setLoading(false));
    }
  }

  async function simulateResponse(userInput: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For now, provide a simple response based on layer
    if (currentLayer === 1) {
      // Move to Layer 2 probing
      setLayer(2);
      addAssistantMessage(
        "That's interesting! Tell me more about what was going through your mind when you decided to buy it."
      );
    } else if (currentLayer === 2) {
      // After some probing, move to Layer 3 reflection
      setLayer(3);
      addAssistantMessage(
        "Thanks for sharing! Now, what would you like to explore?",
        [
          { id: "problem", label: "Is this a problem?", value: "is-problem", emoji: "🤔" },
          { id: "feel", label: "How do I feel about this?", value: "how-feel", emoji: "💭" },
          { id: "good-use", label: "Is this a good use of money?", value: "good-use", emoji: "💰" },
          { id: "different", label: "I have a different question", value: "different", emoji: "❓" },
          { id: "done", label: "I'm good for now", value: "done", emoji: "✅" },
        ],
        false
      );
    } else {
      // Layer 3 - handle reflection or complete
      if (userInput === "done" || userInput === "I'm good for now") {
        completeSession();
        addAssistantMessage(
          "Great chat! Remember, understanding your spending patterns is the first step to feeling more in control. 💪"
        );
        
        // Redirect back to dashboard after a delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        addAssistantMessage(
          "That's a great question to explore. Understanding the 'why' behind our spending helps us make more intentional choices. What feels most true for you?"
        );
      }
    }
  }

  function handleBack() {
    router.push("/");
  }

  return (
    <div className="flex h-screen flex-col bg-[#1a0a2e]">
      {/* Back Button Header */}
      <header className="flex items-center gap-3 border-b border-white/5 bg-[#2d1b4e] px-4 py-3">
        <button
          onClick={handleBack}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          ←
        </button>
        <h1 className="font-medium text-white">
          {getCheckInTypeLabel(transaction.category)}
        </h1>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <ChatContainer
          messages={messages}
          transaction={transaction}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onOptionSelect={handleOptionSelect}
        />
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-20 left-4 right-4 rounded-lg bg-red-500/90 px-4 py-3 text-white">
          {error}
        </div>
      )}
    </div>
  );
}
