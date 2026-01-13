"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";
import { useCheckInSession, getCheckInTypeLabel } from "@/lib/hooks/use-check-in-session";
import { getTransactionById, getMonthlyFoodSpend, getMonthlyCoffeeCount } from "@/lib/data/synthetic-transactions";
import { 
  getFoodAwarenessCalibration, 
  getCoffeeFrequencyCalibration,
} from "@/lib/llm/question-trees";
import type { QuickReplyOption, TransactionCategory, ShoppingPath, ImpulseSubPath, DealSubPath } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════
// MODE LABEL MAPPING
// ═══════════════════════════════════════════════════════════════

const MODE_LABELS: Record<string, string> = {
  // Impulse modes
  "#comfort-driven-spender": "Comfort-Driven Spender",
  "#novelty-seeker": "Novelty Seeker",
  "#social-spender": "Social Spender",
  "#intuitive-threshold-spender": "Intuitive Threshold Spender",
  "#reward-driven-spender": "Reward-Driven Spender",
  "#routine-treat-spender": "Routine Treat Spender",
  "#visual-impulse-driven": "Visual Impulse Buyer",
  "#scroll-triggered": "Scroll-Triggered Buyer",
  "#in-store-wanderer": "In-Store Wanderer",
  "#aesthetic-driven": "Aesthetic-Driven Buyer",
  "#duplicate-collector": "Duplicate Collector",
  "#trend-susceptibility-driven": "Trend-Susceptible",
  "#social-media-influenced": "Social Media Influenced",
  "#friend-peer-influenced": "Friend/Peer Influenced",
  // Deal modes
  "#deal-hunter": "Deal Hunter",
  "#scarcity-susceptible": "Scarcity-Susceptible",
  "#scarcity-driven": "Scarcity-Driven",
  "#deal-driven": "Deal-Driven",
  "#threshold-spending-driven": "Threshold Spender",
  // Deliberate modes
  "#intentional-planner": "Intentional Planner",
  "#quality-seeker": "Quality Seeker",
  "#deliberate-budget-saver": "Deliberate Budget Saver",
  "#deliberate-deal-hunter": "Deliberate Deal Hunter",
  "#deliberate-researcher": "Deliberate Researcher",
  "#deliberate-pause-tester": "Deliberate Pause Tester",
  "#deliberate-low-priority": "Low Priority Buyer",
  // Gift modes
  "#generous-giver": "Generous Giver",
  "#obligation-driven": "Obligation-Driven Giver",
  "#gift-giver": "Gift Giver",
  // Maintenance modes
  "#organized-restocker": "Organized Restocker",
  "#just-in-case-buyer": "Just-In-Case Buyer",
  "#loyal-repurchaser": "Loyal Repurchaser",
  "#brand-switcher": "Brand Switcher",
  "#upgrader": "Upgrader",
  // Food modes
  "#autopilot-from-stress": "Stress-Driven Orderer",
  "#convenience-driven": "Convenience Orderer",
  "#lack-of-pre-planning": "Last-Minute Planner",
  "#intentional-treat": "Intentional Treat",
};

function getModeLabel(mode: string): string | null {
  return MODE_LABELS[mode] || null;
}

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
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getInitialMessage(
  category: TransactionCategory, 
  merchantName: string,
  transaction: { merchant: string; amount: number }
): { content: string; options?: QuickReplyOption[] } {
  switch (category) {
    case "shopping":
      return {
        content: `Let's reflect on your ${merchantName} purchase! ${SHOPPING_FIXED_Q1.question}`,
        options: SHOPPING_FIXED_Q1.options,
      };
    case "food": {
      const actualMonthlySpend = getMonthlyFoodSpend();
      const calibration = getFoodAwarenessCalibration(transaction, actualMonthlySpend);
      return {
        content: calibration.content,
        options: calibration.options,
      };
    }
    case "coffee": {
      const actualMonthlyCount = getMonthlyCoffeeCount();
      const calibration = getCoffeeFrequencyCalibration(transaction, actualMonthlyCount);
      return {
        content: calibration.content,
        options: calibration.options,
      };
    }
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

  const transaction = useMemo(() => {
    if (!transactionId) return null;
    return getTransactionById(transactionId);
  }, [transactionId]);

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

// Layer 3 reflection options
const LAYER_3_REFLECTION_OPTIONS: QuickReplyOption[] = [
  { id: "problem", label: "Is this a problem?", emoji: "🤔", value: "problem", color: "white" },
  { id: "feel", label: "How do I feel about this?", emoji: "💭", value: "feel", color: "white" },
  { id: "worth", label: "Is this a good use of money?", emoji: "💰", value: "worth", color: "white" },
  { id: "done", label: "I'm good for now", emoji: "✅", value: "done", color: "white" },
];

function CheckInChat({ sessionId, transaction, onClose }: CheckInChatProps) {
  const {
    messages,
    isLoading,
    error,
    currentLayer,
    currentPath,
    currentMode,
    probingDepth,
    startSession,
    addAssistantMessage,
    addUserMessage,
    setPath,
    setSubPath,
    setMode,
    setLayer,
    setLoading,
    setError,
    setUserGuess,
    setActualAmount,
    setUserGuessCount,
    setActualCount,
    addTag,
    incrementProbingDepth,
    completeSession,
  } = useCheckInSession(sessionId, transaction);

  // Initialize session with first message
  useEffect(() => {
    if (messages.length === 0) {
      startSession();
      const initial = getInitialMessage(transaction.category, transaction.merchant, transaction);
      addAssistantMessage(initial.content, initial.options, true);
    }
  }, [messages.length, startSession, addAssistantMessage, transaction]);

  // Handle user option selection
  const handleOptionSelect = useCallback((value: string) => {
    const selectedOption = messages[messages.length - 1]?.options?.find(o => o.value === value);
    const displayText = selectedOption?.label || value;
    addUserMessage(displayText);

    if (transaction.category === "shopping") {
      if (currentLayer === 1 && !currentPath) {
        // Fixed Q1 response - set path, show Fixed Q2
        const path = value as ShoppingPath;
        setPath(path);
        const q2 = SHOPPING_FIXED_Q2[path];
        if (q2) {
          setTimeout(() => {
            addAssistantMessage(q2.question, q2.options, true);
          }, 500);
        }
      } else if (currentLayer === 1 && currentPath) {
        // Fixed Q2 response - transition to Layer 2 LLM probing
        const subPath = value as ImpulseSubPath | DealSubPath;
        setSubPath(subPath);
        setLayer(2);
        setLoading(true);

        // Call LLM for initial Layer 2 probing (depth = 0)
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
              subPath,
              messages,
              metadata: { tags: [], probingDepth: 0 },
            },
            probingDepth: 0,
          }),
        })
          .then(res => res.json())
          .then(data => {
            setLoading(false);
            addAssistantMessage(
              data.message || "Thanks for sharing! I'm curious—what was going on when you made this purchase?",
              data.options,
              false
            );
          })
          .catch(() => {
            setLoading(false);
            addAssistantMessage(
              "Thanks for sharing! I'm curious—what was going on when you made this purchase?",
              undefined,
              false
            );
          });
      }
    } else if (transaction.category === "food") {
      // Food Check-In: Awareness Calibration
      if (currentLayer === 1) {
        // User just made their guess - calculate and reveal actual
        const actualMonthlySpend = getMonthlyFoodSpend();
        
        // Parse the guess from the value (low = 40%, medium = 70%, high = 100%+)
        let userGuessAmount: number;
        switch (value) {
          case "low":
            userGuessAmount = Math.round(actualMonthlySpend * 0.4);
            break;
          case "medium":
            userGuessAmount = Math.round(actualMonthlySpend * 0.7);
            break;
          case "high":
          default:
            userGuessAmount = Math.round(actualMonthlySpend);
            break;
        }
        
        // Calculate the difference
        const difference = actualMonthlySpend - userGuessAmount;
        const percentDiff = Math.round((difference / userGuessAmount) * 100);
        
        // Transition to Layer 2 with reveal message and mode question
        setLayer(2);
        
        setTimeout(() => {
          let revealMessage: string;
          
          if (difference <= 0 || percentDiff < 10) {
            // User guessed accurately or overestimated
            revealMessage = `Nice awareness! You've actually spent $${actualMonthlySpend.toFixed(0)} on food delivery this month. You know your spending pretty well! 🎯\n\nWhen you think about ordering food, what usually drives the decision?`;
          } else if (percentDiff < 30) {
            // Slightly underestimated
            revealMessage = `Pretty close! You've actually spent $${actualMonthlySpend.toFixed(0)} on food delivery this month — about $${difference.toFixed(0)} more than you guessed. Not a huge gap!\n\nWhen you think about ordering food, what usually drives the decision?`;
          } else {
            // Significantly underestimated
            revealMessage = `Interesting! You've actually spent $${actualMonthlySpend.toFixed(0)} on food delivery this month — that's $${difference.toFixed(0)} more than you thought (${percentDiff}% higher). 📊\n\nNo judgment here — let's explore what's driving this. When you order food, what's usually going on?`;
          }
          
          // Food mode assignment options
          const modeOptions: QuickReplyOption[] = [
            { id: "stress", label: "Tired or stressed, don't want to cook", emoji: "😓", value: "stress", color: "yellow" as const },
            { id: "convenience", label: "Short on time, need something fast", emoji: "⏰", value: "convenience", color: "white" as const },
            { id: "planning", label: "Didn't plan meals, nothing in the fridge", emoji: "🤷", value: "planning", color: "white" as const },
            { id: "craving", label: "Craving something specific", emoji: "🍕", value: "craving", color: "white" as const },
            { id: "social", label: "Eating with others, easier to order", emoji: "👥", value: "social", color: "white" as const },
          ];
          
          addAssistantMessage(revealMessage, modeOptions, true);
        }, 800);
      } else if (currentLayer === 2) {
        // User selected their food mode - assign it and transition to Layer 3
        const foodMode = value as FoodMode;
        setMode(`#food-${foodMode}`);
        setLayer(3);
        
        // Generate mode-specific acknowledgment
        let acknowledgment: string;
        switch (foodMode) {
          case "stress":
            acknowledgment = "That makes sense — cooking when you're drained can feel like one thing too many. It sounds like food delivery has become a way to take care of yourself on tough days. 💆";
            break;
          case "convenience":
            acknowledgment = "Time is precious! When life gets busy, delivery can be a lifesaver. It's totally understandable to prioritize convenience.";
            break;
          case "planning":
            acknowledgment = "Meal planning is one of those things that sounds simple but isn't always easy to keep up with. You're definitely not alone in that!";
            break;
          default:
            acknowledgment = "Got it! That's helpful context for understanding your food delivery patterns.";
        }
        
        setTimeout(() => {
          addAssistantMessage(
            `${acknowledgment}\n\nWould you like to explore this further?`,
            LAYER_3_REFLECTION_OPTIONS,
            false
          );
        }, 500);
      }
    } else if (transaction.category === "coffee") {
      // Coffee Check-In: Frequency Calibration
      if (currentLayer === 1) {
        // User just made their guess - calculate and reveal actual
        const actualMonthlyCount = getMonthlyCoffeeCount();
        
        // Parse the guess from the value
        let userGuessCount: number;
        switch (value) {
          case "few":
            userGuessCount = Math.max(1, Math.round(actualMonthlyCount * 0.3));
            break;
          case "some":
            userGuessCount = Math.round(actualMonthlyCount * 0.7);
            break;
          case "many":
          default:
            userGuessCount = Math.round(actualMonthlyCount);
            break;
        }
        
        // Store guess and actual in session metadata
        setUserGuessCount(userGuessCount);
        setActualCount(actualMonthlyCount);
        
        // Calculate the difference
        const difference = actualMonthlyCount - userGuessCount;
        
        // Transition to Layer 2 with reveal message and motivation question
        setLayer(2);
        
        setTimeout(() => {
          let revealMessage: string;
          const modeOptions: QuickReplyOption[] = [
            { id: "routine", label: "It's just part of my routine", emoji: "🔄", value: "routine", color: "yellow" as const },
            { id: "pick_me_up", label: "I need the energy boost", emoji: "⚡", value: "pick_me_up", color: "yellow" as const },
            { id: "treat", label: "Treating myself, a little reward", emoji: "🎁", value: "treat", color: "yellow" as const },
            { id: "social", label: "Meeting someone or working there", emoji: "👥", value: "social", color: "white" as const },
            { id: "nearby", label: "Just happened to be nearby", emoji: "📍", value: "nearby", color: "white" as const },
          ];
          
          if (difference <= 0 || difference < 3) {
            // User guessed accurately
            revealMessage = `Good eye! You've grabbed coffee or treats ${actualMonthlyCount} times this month. You know your habits! ☕\n\nWhen you go for coffee or a treat, what's usually driving it?`;
          } else if (difference < 6) {
            // Slightly underestimated
            revealMessage = `Pretty close! You've actually grabbed coffee or treats ${actualMonthlyCount} times this month — about ${difference} more than you thought. Not a huge gap!\n\nWhen you go for coffee or a treat, what's usually driving it?`;
          } else {
            // Significantly underestimated
            revealMessage = `Interesting! You've grabbed coffee or treats ${actualMonthlyCount} times this month — that's ${difference} more visits than you thought. 📊\n\nNo judgment here — let's explore what's going on. What usually drives these visits?`;
          }
          
          addAssistantMessage(revealMessage, modeOptions, true);
        }, 800);
      }
    }
  }, [messages, addUserMessage, addAssistantMessage, transaction, sessionId, currentLayer, currentPath, setPath, setSubPath, setLayer, setLoading, setMode, setUserGuess, setActualAmount, setUserGuessCount, setActualCount]);

  // Handle free-form text input (Layer 2 probing and Layer 3 reflection)
  const handleSendMessage = useCallback(async (content: string) => {
    addUserMessage(content);
    setLoading(true);

    // Increment probing depth for Layer 2 exchanges
    const newProbingDepth = currentLayer === 2 ? probingDepth + 1 : probingDepth;
    if (currentLayer === 2) {
      incrementProbingDepth();
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { id: `user_${Date.now()}`, role: "user", content, timestamp: new Date() }],
          transaction,
          session: {
            id: sessionId,
            transactionId: transaction.id,
            type: transaction.category,
            status: "in_progress",
            currentLayer,
            path: currentPath,
            mode: currentMode,
            messages,
            metadata: { 
              tags: [],
              probingDepth: newProbingDepth,
            },
          },
          // Pass probing depth at top level for API route
          probingDepth: newProbingDepth,
        }),
      });

      const data = await response.json();
      setLoading(false);

      // Handle mode assignment from LLM response
      if (data.assignedMode && currentLayer === 2) {
        setMode(data.assignedMode);
      }

      // Handle graceful exit (counter-profile detected)
      if (data.exitGracefully) {
        addAssistantMessage(
          data.message,
          [{ id: "close", label: "Thanks for the chat!", emoji: "✨", value: "close", color: "white" }],
          false
        );
        return;
      }

      // Handle transition to Layer 3 after probing
      if (data.shouldTransition && currentLayer === 2) {
        // Store mode if provided
        if (data.assignedMode) {
          setMode(data.assignedMode);
        }
        setLayer(3);
        
        // Build transition message with mode label if available
        const modeLabel = data.assignedMode ? getModeLabel(data.assignedMode) : null;
        let transitionMessage = data.message || "I think I understand the pattern here.";
        
        if (modeLabel) {
          transitionMessage += `\n\nBased on what you've shared, it sounds like you might be a **${modeLabel}**. That's just a pattern I noticed — no judgment! Would you like to explore any of these?`;
        } else {
          transitionMessage += "\n\nWould you like to explore any of these?";
        }
        
        // Show transition message with Layer 3 options
        addAssistantMessage(
          transitionMessage,
          LAYER_3_REFLECTION_OPTIONS,
          false
        );
        return;
      }

      // For Layer 3 reflection responses
      if (currentLayer === 3) {
        addAssistantMessage(
          data.message,
          data.options || [{ id: "close", label: "Thanks for the reflection!", emoji: "✨", value: "close", color: "white" }],
          false
        );
        return;
      }

      // Continue probing in Layer 2 (mode not yet assigned, or more exploration needed)
      addAssistantMessage(data.message, data.options, false);

    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      
      // Fallback: transition to Layer 3 if in Layer 2
      if (currentLayer === 2) {
        addAssistantMessage(
          "Thanks for sharing! How would you like to explore this further?",
          LAYER_3_REFLECTION_OPTIONS,
          false
        );
        setLayer(3);
      } else {
        addAssistantMessage(
          "Great reflection! See you next time! 👋",
          [{ id: "close", label: "Close", emoji: "✨", value: "close", color: "white" }],
          false
        );
      }
    }
  }, [messages, transaction, sessionId, currentLayer, currentPath, currentMode, probingDepth, addUserMessage, addAssistantMessage, setLoading, setError, setLayer, setMode, incrementProbingDepth]);

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
        <div className="w-10" />
      </header>

      <div className="h-[calc(100vh-60px)]">
        <ChatContainer
          messages={messages}
          transaction={transaction}
          isLoading={isLoading}
          error={error}
          onSendMessage={handleSendMessage}
          onOptionSelect={handleOptionSelectWrapper}
          onRetry={() => setError(null)}
        />
      </div>
    </div>
  );
}
