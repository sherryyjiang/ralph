"use client";

import { useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";
import { useCheckInSession, getCheckInTypeLabel } from "@/lib/hooks/use-check-in-session";
import { getTransactionById, getMonthlyFoodSpend, getMonthlyCoffeeCount, getMonthlyCoffeeSpend, getFoodCategoryStats, getCoffeeCategoryStats } from "@/lib/data/synthetic-transactions";
import { 
  getFoodAwarenessCalibration, 
  getCoffeeFrequencyCalibration,
  getCoffeeCalibrationResult,
  getCoffeeFeelingQuestion,
  getCoffeeMotivationQuestion,
  getCoffeeFixedQ2,
  getCoffeeModeFromQ2Response,
  coffeeModeExplorations,
  getCoffeeEconomicEvaluation,
  getSubPathProbing,
  getShoppingFixedQuestion2Text,
  type CoffeeMotivation,
} from "@/lib/llm/question-trees";
import type { QuickReplyOption, TransactionCategory, ShoppingPath, ImpulseSubPath, DealSubPath, CheckInMode } from "@/lib/types";

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
  // Coffee modes
  "#autopilot-routine": "Autopilot Routine",
  "#environment-triggered": "Environment Triggered",
  "#emotional-coping": "Emotional Coping",
  "#productivity-justification": "Productivity Justification",
  "#intentional-ritual": "Intentional Ritual",
  "#productive-coffee-drinker": "Productive Coffee Drinker",
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
      { id: "other", label: "Other/Custom", emoji: "📝", value: "other", color: "white" },
    ],
  },
  deal: {
    question: "Tell me more about the deal, discount or limited event?",
    options: [
      { id: "limited_edition", label: "Limited edition or drop that is running out", emoji: "⚡", value: "limited_edition", color: "yellow" },
      { id: "sale_discount", label: "It was a good sale, deal or discount", emoji: "💸", value: "sale_discount", color: "yellow" },
      { id: "free_shipping", label: "Hit free shipping threshold or got a bonus/sample with purchase", emoji: "📦", value: "free_shipping", color: "yellow" },
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
  const category = searchParams.get("category") as "food" | "coffee" | null;
  const path = searchParams.get("path") as ShoppingPath | null;
  const guess = searchParams.get("guess"); // Food: dollar amount
  const guessCount = searchParams.get("guessCount"); // Coffee: count

  // For shopping, get transaction by ID
  // For food/coffee categories, create a synthetic transaction for the session
  const transaction = useMemo(() => {
    if (transactionId) {
      return getTransactionById(transactionId);
    }
    // For category check-ins (food/coffee), create a category transaction
    if (category === "food") {
      const actualSpend = getMonthlyFoodSpend();
      return {
        id: `category_food_${sessionId}`,
        merchant: "Food Delivery",
        amount: actualSpend,
        category: "food" as const,
        date: new Date(),
        isFirstTime: false,
      };
    }
    if (category === "coffee") {
      const actualSpend = getMonthlyCoffeeSpend();
      return {
        id: `category_coffee_${sessionId}`,
        merchant: "Coffee & Treats",
        amount: actualSpend,
        category: "coffee" as const,
        date: new Date(),
        isFirstTime: false,
      };
    }
    return null;
  }, [transactionId, category, sessionId]);

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
      initialPath={path}
      initialGuess={guess ? parseInt(guess, 10) : undefined}
      initialGuessCount={guessCount ? parseInt(guessCount, 10) : undefined}
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
  initialPath?: ShoppingPath | null;
  initialGuess?: number; // Food: dollar amount from URL
  initialGuessCount?: number; // Coffee: count from URL
}

// Layer 3 reflection options
const LAYER_3_REFLECTION_OPTIONS: QuickReplyOption[] = [
  { id: "problem", label: "Is this a problem?", emoji: "🤔", value: "problem", color: "white" },
  { id: "feel", label: "How do I feel about this?", emoji: "💭", value: "feel", color: "white" },
  { id: "worth", label: "Is this a good use of money?", emoji: "💰", value: "worth", color: "white" },
  { id: "done", label: "I'm good for now", emoji: "✅", value: "done", color: "white" },
];

// Graceful exit messages for deliberate paths (per GRACEFUL_EXIT_PATTERNS.md)
const DELIBERATE_EXIT_MESSAGES: Record<string, { message: string; mode: CheckInMode }> = {
  afford_it: {
    message: "That's really thoughtful — waiting until the timing was right financially shows solid awareness of your budget.\n\nI'm saving this as one of your spending patterns in Magnets. 🧲\n\nIs there anything else about this purchase you'd like to explore?",
    mode: "#deliberate-budget-saver",
  },
  right_price: {
    message: "Nice! Being patient for the right deal takes discipline. That kind of intentional waiting usually pays off.\n\nI'm noting this pattern in your Magnets. 🧲\n\nAnything else on your mind about this purchase?",
    mode: "#deliberate-deal-hunter",
  },
  right_one: {
    message: "It sounds like you really put thought into this — doing your research and finding exactly what works for you. That's a great way to shop!\n\nSaving this to your Magnets. 🧲\n\nIs there anything else you'd like to explore about this purchase?",
    mode: "#deliberate-researcher",
  },
  still_wanted: {
    message: "That's a smart approach — giving yourself time to make sure it wasn't just a passing want. The fact that you still wanted it says something!\n\nI'm adding this to your Magnets. 🧲\n\nAnything else you're curious about?",
    mode: "#deliberate-pause-tester",
  },
  got_around: {
    message: "Got it — sometimes things just take a while to bubble up the priority list. At least it's done now!\n\nNoting this in your Magnets. 🧲\n\nAnything else about this purchase?",
    mode: "#deliberate-low-priority",
  },
};

// Graceful exit messages for gift path
const GIFT_EXIT_MESSAGES: Record<string, { message: string; mode: CheckInMode }> = {
  family: {
    message: "That's thoughtful! Gift-giving for family is one of those spending categories that's hard to evaluate on dollars alone.\n\nI'm saving this as a gift purchase in your Magnets. 🧲\n\nIs there anything about your gift-giving patterns you'd like to explore?",
    mode: "#gift-giver",
  },
  friend: {
    message: "That's thoughtful! Gift-giving for friends is one of those spending categories that's hard to evaluate on dollars alone.\n\nI'm saving this as a gift purchase in your Magnets. 🧲\n\nIs there anything about your gift-giving patterns you'd like to explore?",
    mode: "#gift-giver",
  },
  partner: {
    message: "That's thoughtful! Gift-giving for your partner is one of those spending categories that's hard to evaluate on dollars alone.\n\nI'm saving this as a gift purchase in your Magnets. 🧲\n\nIs there anything about your gift-giving patterns you'd like to explore?",
    mode: "#gift-giver",
  },
  coworker: {
    message: "That's thoughtful! Gift-giving for coworkers is one of those spending categories that's hard to evaluate on dollars alone.\n\nI'm saving this as a gift purchase in your Magnets. 🧲\n\nIs there anything about your gift-giving patterns you'd like to explore?",
    mode: "#gift-giver",
  },
};

// Graceful exit messages for maintenance path
const MAINTENANCE_EXIT_MESSAGES: Record<string, { message: string; mode: CheckInMode }> = {
  same_thing: {
    message: "Makes sense — we all need to replace things eventually! This is the kind of spending that's easy to overlook but adds up.\n\nLogging this in your Magnets. 🧲\n\nAnything else about this purchase?",
    mode: "#loyal-repurchaser",
  },
  switched_up: {
    message: "Gotcha — trying something new when restocking! Sounds like you're open to alternatives.\n\nLogging this in your Magnets. 🧲\n\nAnything else about this purchase?",
    mode: "#brand-switcher",
  },
  upgraded: {
    message: "Nice — upgrading when it's time to replace! Sounds like you see value in getting something better.\n\nLogging this in your Magnets. 🧲\n\nAnything else about this purchase?",
    mode: "#upgrader",
  },
};

// Exit options for graceful exits (freeform + done)
const GRACEFUL_EXIT_OPTIONS: QuickReplyOption[] = [
  { id: "done", label: "I'm good for now", emoji: "✓", value: "done", color: "white" },
];

function CheckInChat({ sessionId, transaction, onClose, initialPath, initialGuess, initialGuessCount }: CheckInChatProps) {
  const {
    session,
    messages,
    isLoading,
    error,
    currentLayer,
    currentPath,
    currentMode,
    probingDepth,
    calibrationPhase,
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
    setCalibrationPhase,
    completeSession,
  } = useCheckInSession(sessionId, transaction);
  
  // Track if we've initialized with URL params
  const hasInitialized = useRef(false);

  // Initialize session with first message
  useEffect(() => {
    if (messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      startSession();
      
      // Handle different entry points based on URL params
      
      // SHOPPING: If path provided from home card, skip Fixed Q1 and show Fixed Q2
      if (transaction.category === "shopping" && initialPath) {
        setPath(initialPath);
        const q2 = SHOPPING_FIXED_Q2[initialPath];
        const q2Question = getShoppingFixedQuestion2Text(initialPath);
        if (q2 && q2Question) {
          addAssistantMessage(
            `Let's reflect on your ${transaction.merchant} purchase! ${q2Question}`,
            q2.options,
            true
          );
        }
        return;
      }
      
      // FOOD: If guess provided from home card, show calibration result + feeling question
      if (transaction.category === "food" && initialGuess !== undefined) {
        const actualMonthlySpend = getMonthlyFoodSpend();
        
        // Store guess and actual
        setUserGuess(initialGuess);
        setActualAmount(actualMonthlySpend);
        
        // Calculate difference
        const difference = actualMonthlySpend - initialGuess;
        const percentDiff = initialGuess > 0 ? Math.round((difference / initialGuess) * 100) : 0;
        const isWayOff = percentDiff > 20 && difference > 75;
        
        // Store blindspot tag if way off
        if (isWayOff) {
          addTag("#awareness-gap");
        }
        
        // Build calibration result message
        let resultMessage: string;
        if (difference <= 0 || percentDiff < 10) {
          resultMessage = `Nice awareness! You've actually spent $${actualMonthlySpend.toFixed(0)} on food delivery this month. You know your spending pretty well! 🎯`;
        } else if (percentDiff < 20) {
          resultMessage = `Pretty close! You've actually spent $${actualMonthlySpend.toFixed(0)} on food delivery this month — about $${difference.toFixed(0)} more than you guessed.`;
        } else {
          resultMessage = `Interesting! You've actually spent $${actualMonthlySpend.toFixed(0)} on food delivery this month — that's $${difference.toFixed(0)} more than you thought (${percentDiff}% higher). 📊`;
        }
        
        // Feeling question options
        const feelingOptions: QuickReplyOption[] = [
          { id: "ok_with_it", label: "I'm okay with it", emoji: "👍", value: "ok_with_it", color: "white" as const },
          { id: "could_be_better", label: "Feel like it could be better", emoji: "🤔", value: "could_be_better", color: "yellow" as const },
        ];
        
        // Set calibration phase to awaiting_feeling (guess already done)
        setCalibrationPhase("feeling_asked");
        setLayer(2); // Move to Layer 2 since calibration question is done
        
        addAssistantMessage(
          `${resultMessage}\n\nHow do you feel about that number?`,
          feelingOptions,
          true
        );
        return;
      }
      
      // COFFEE: If guessCount provided from home card, show calibration result + feeling question
      if (transaction.category === "coffee" && initialGuessCount !== undefined) {
        const actualMonthlyCount = getMonthlyCoffeeCount();
        const actualMonthlySpend = getMonthlyCoffeeSpend();
        
        // Store guess and actual
        setUserGuessCount(initialGuessCount);
        setActualCount(actualMonthlyCount);
        setActualAmount(actualMonthlySpend);
        
        // Get calibration result message
        const calibration = getCoffeeCalibrationResult(initialGuessCount, actualMonthlyCount, actualMonthlySpend);
        const feelingQ = getCoffeeFeelingQuestion();
        
        // Store blindspot tag if way off (per spec: breakdown only offered if way off)
        if (!calibration.isClose) {
          addTag("#awareness-gap");
        }
        
        // Set calibration phase to awaiting_feeling (guess already done)
        setCalibrationPhase("feeling_asked");
        setLayer(2); // Move to Layer 2 since calibration question is done
        
        addAssistantMessage(
          `${calibration.message}\n\n${feelingQ.content}`,
          feelingQ.options,
          true
        );
        return;
      }
      
      // Default: Show standard initial message (asks guess question)
      const initial = getInitialMessage(transaction.category, transaction.merchant, transaction);
      addAssistantMessage(initial.content, initial.options, true);
    }
  }, [messages.length, startSession, addAssistantMessage, transaction, initialPath, initialGuess, initialGuessCount, setPath, setUserGuess, setActualAmount, setUserGuessCount, setActualCount, addTag, setCalibrationPhase, setLayer]);

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
        const q2Question = getShoppingFixedQuestion2Text(path);
        if (q2 && q2Question) {
          setTimeout(() => {
            addAssistantMessage(q2Question, q2.options, true);
          }, 500);
        }
      } else if (currentLayer === 1 && currentPath) {
        // Fixed Q2 response - check if graceful exit or LLM probing
        const subPath = value as ImpulseSubPath | DealSubPath;
        setSubPath(subPath);
        
        // Check for graceful exit paths (using module-level constants)
        if (currentPath === "deliberate" && DELIBERATE_EXIT_MESSAGES[value]) {
          const exit = DELIBERATE_EXIT_MESSAGES[value];
          setMode(exit.mode);
          addTag(exit.mode);
          setTimeout(() => {
            addAssistantMessage(
              exit.message,
              GRACEFUL_EXIT_OPTIONS,
              false
            );
          }, 500);
          return;
        }
        
        if (currentPath === "gift" && GIFT_EXIT_MESSAGES[value]) {
          const exit = GIFT_EXIT_MESSAGES[value];
          setMode(exit.mode);
          addTag(exit.mode);
          setTimeout(() => {
            addAssistantMessage(
              exit.message,
              GRACEFUL_EXIT_OPTIONS,
              false
            );
          }, 500);
          return;
        }
        
        if (currentPath === "maintenance" && MAINTENANCE_EXIT_MESSAGES[value]) {
          const exit = MAINTENANCE_EXIT_MESSAGES[value];
          setMode(exit.mode);
          addTag(exit.mode);
          setTimeout(() => {
            addAssistantMessage(
              exit.message,
              GRACEFUL_EXIT_OPTIONS,
              false
            );
          }, 500);
          return;
        }
        
        // For impulse and deal paths, continue with Layer 2 probing
        // Use the FIRST probing hint directly from question tree (no LLM needed)
        setLayer(2);
        
        // Get the sub-path probing details
        const probingDetails = getSubPathProbing(currentPath, subPath);
        
        if (probingDetails && probingDetails.probingHints.length > 0) {
          // Use the first probing hint with a warm opener
          const firstProbingQuestion = probingDetails.probingHints[0];
          setTimeout(() => {
            addAssistantMessage(
              `Got it! ${firstProbingQuestion}`,
              undefined,
              false
            );
          }, 500);
        } else {
          // Fallback if no probing hints found (shouldn't happen)
          setTimeout(() => {
            addAssistantMessage(
              "Got it! Tell me more about what was going on when you made this purchase.",
              undefined,
              false
            );
          }, 500);
        }
      }
    } else if (transaction.category === "food") {
      // Food Check-In: Full flow per PEEK_QUESTION_TREES.md spec
      const actualMonthlySpend = getMonthlyFoodSpend();
      
      if (currentLayer === 1) {
        // User just made their guess - calculate and reveal actual
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
        
        // Store guess and actual in session metadata
        setUserGuess(userGuessAmount);
        setActualAmount(actualMonthlySpend);
        
        // Calculate the difference
        const difference = actualMonthlySpend - userGuessAmount;
        const percentDiff = userGuessAmount > 0 ? Math.round((difference / userGuessAmount) * 100) : 0;
        const isWayOff = percentDiff > 20 && difference > 75;
        
        // Store blindspot tag if way off
        if (isWayOff) {
          addTag("#awareness-gap");
        }
        
        setTimeout(() => {
          let revealMessage: string;
          
          if (difference <= 0 || percentDiff < 10) {
            // User guessed accurately or overestimated
            revealMessage = `Nice awareness! You've actually spent $${actualMonthlySpend.toFixed(0)} on food delivery this month. You know your spending pretty well! 🎯`;
          } else if (percentDiff < 20) {
            // Close
            revealMessage = `Pretty close! You've actually spent $${actualMonthlySpend.toFixed(0)} on food delivery this month — about $${difference.toFixed(0)} more than you guessed.`;
          } else {
            // Way off
            revealMessage = `Interesting! You've actually spent $${actualMonthlySpend.toFixed(0)} on food delivery this month — that's $${difference.toFixed(0)} more than you thought (${percentDiff}% higher). 📊`;
          }
          
          // Ask "How do you feel about this number?" per spec
          revealMessage += "\n\nHow do you feel about that number?";
          
          // Feeling response options (consistent with URL flow)
          const feelingOptions: QuickReplyOption[] = [
            { id: "ok_with_it", label: "I'm okay with it", emoji: "👍", value: "ok_with_it", color: "white" as const },
            { id: "could_be_better", label: "Feel like it could be better", emoji: "🤔", value: "could_be_better", color: "yellow" as const },
          ];
          
          // Set calibration phase - moving to Layer 2 for feeling response
          setCalibrationPhase("feeling_asked");
          setLayer(2);
          
          addAssistantMessage(revealMessage, feelingOptions, true);
        }, 800);
      } else if (currentLayer === 2) {
        // Handle calibration feeling response and Layer 2 flow
        if (value === "ok_with_it") {
          // User is fine with their spending - light reflection and exit
          setCalibrationPhase("complete");
          setTimeout(() => {
            addAssistantMessage(
              "Got it — sounds like it's working for you! We can always revisit if anything changes. 🙌",
              [{ id: "done", label: "Thanks for the check-in!", emoji: "✨", value: "done", color: "white" as const }],
              false
            );
          }, 500);
        } else if (value === "could_be_better") {
          // User wants to explore - check if they were "way off" to offer breakdown
          // Per AWARENESS_CALIBRATION_FLOW.md: only offer breakdown if WAY OFF (>20% AND $75+ difference)
          const userGuess = session.metadata.userGuess || 0;
          const actualAmount = session.metadata.actualAmount || actualMonthlySpend;
          const difference = actualAmount - userGuess;
          const percentDiff = userGuess > 0 ? Math.round((difference / userGuess) * 100) : 0;
          const isWayOff = percentDiff > 20 && difference > 75;
          
          if (isWayOff) {
            // Guess was way off - offer breakdown first
            setCalibrationPhase("breakdown_offered");
            setTimeout(() => {
              const breakdownOptions: QuickReplyOption[] = [
                { id: "show_breakdown", label: "Yes, show me", emoji: "📊", value: "show_breakdown", color: "white" as const },
                { id: "skip_breakdown", label: "No, I'd rather move on", emoji: "➡️", value: "skip_breakdown", color: "white" as const },
              ];
              
              addAssistantMessage(
                "Would you like to see what's behind this amount?",
                breakdownOptions,
                true
              );
            }, 500);
          } else {
            // Not way off - go straight to Layer 2 motivation question
            setCalibrationPhase("layer_2_ready");
            setTimeout(() => {
              const modeOptions: QuickReplyOption[] = [
                { id: "autopilot_stress", label: "I'm usually too drained to cook", emoji: "😓", value: "autopilot_stress", color: "yellow" as const },
                { id: "convenience", label: "It's just easier to order", emoji: "📱", value: "convenience", color: "white" as const },
                { id: "no_planning", label: "I keep meaning to cook but never plan", emoji: "🤷", value: "no_planning", color: "white" as const },
                { id: "too_busy", label: "I'm too busy to plan", emoji: "⏰", value: "too_busy", color: "white" as const },
                { id: "intentional_treat", label: "I actually wanted that specific meal", emoji: "🍕", value: "intentional_treat", color: "white" as const },
              ];
              
              addAssistantMessage(
                "When you think about why you order food, what feels most true?",
                modeOptions,
                true
              );
            }, 500);
          }
        } else if (value === "show_breakdown") {
          // User wants to see breakdown
          setCalibrationPhase("breakdown_shown");
          const foodStats = getFoodCategoryStats();
          
          // Build breakdown message
          let breakdownMessage = "Here's the breakdown:\n\n📊 By Merchant:\n";
          foodStats.topMerchants.forEach((m: { name: string; count: number; spend: number }) => {
            breakdownMessage += `• ${m.name}: ${m.count} orders ($${m.spend.toFixed(0)})\n`;
          });
          
          breakdownMessage += "\n📅 By Day:\n";
          foodStats.topDays.slice(0, 3).forEach((d: { day: string; count: number }) => {
            breakdownMessage += `• ${d.day}: ${d.count} orders\n`;
          });
          
          breakdownMessage += "\nDoes that land how you expected?";
          
          const breakdownReactionOptions: QuickReplyOption[] = [
            { id: "breakdown_expected", label: "Yeah, that tracks", emoji: "👍", value: "breakdown_expected", color: "white" as const },
            { id: "breakdown_surprised", label: "Some of that surprises me", emoji: "😮", value: "breakdown_surprised", color: "yellow" as const },
          ];
          
          setTimeout(() => {
            addAssistantMessage(breakdownMessage, breakdownReactionOptions, true);
          }, 500);
        } else if (value === "skip_breakdown" || value === "breakdown_expected" || value === "breakdown_surprised") {
          // After breakdown (or skipped) - transition to Layer 2 motivation question
          setCalibrationPhase("layer_2_ready");
          setTimeout(() => {
            const modeOptions: QuickReplyOption[] = [
              { id: "autopilot_stress", label: "I'm usually too drained to cook", emoji: "😓", value: "autopilot_stress", color: "yellow" as const },
              { id: "convenience", label: "It's just easier to order", emoji: "📱", value: "convenience", color: "white" as const },
              { id: "no_planning", label: "I keep meaning to cook but never plan", emoji: "🤷", value: "no_planning", color: "white" as const },
              { id: "too_busy", label: "I'm too busy to plan", emoji: "⏰", value: "too_busy", color: "white" as const },
              { id: "intentional_treat", label: "I actually wanted that specific meal", emoji: "🍕", value: "intentional_treat", color: "white" as const },
            ];
            
            addAssistantMessage(
              "When you think about why you order food, what feels most true?",
              modeOptions,
              true
            );
          }, 500);
        } else if (value === "intentional_treat") {
          // Counter-profile: Intentional treat - graceful exit
          setMode("#intentional-treat");
          setTimeout(() => {
            addAssistantMessage(
              "Nice — sounds like you knew what you wanted! Nothing wrong with treating yourself intentionally. Enjoy! 🍕",
              [{ id: "done", label: "Thanks!", emoji: "✨", value: "done", color: "white" as const }],
              false
            );
          }, 500);
        } else {
          // User selected a mode - map to proper mode ID and transition to Layer 3
          let modeId: CheckInMode;
          let modeLabel: string;
          let benefitWord: string;
          
          switch (value) {
            case "autopilot_stress":
              modeId = "#autopilot-from-stress";
              modeLabel = "Stress-Driven Orderer";
              benefitWord = "relief";
              break;
            case "convenience":
              modeId = "#convenience-driven";
              modeLabel = "Convenience Orderer";
              benefitWord = "ease";
              break;
            case "no_planning":
            case "too_busy":
              modeId = "#lack-of-pre-planning";
              modeLabel = "Last-Minute Planner";
              benefitWord = "not having to plan";
              break;
            default:
              modeId = "#convenience-driven";
              modeLabel = "Convenience Orderer";
              benefitWord = "convenience";
          }
          
          setMode(modeId);
          setLayer(3);
          
          // Layer 3: Economic Evaluation - "Is the benefit worth the cost?"
          setTimeout(() => {
            const worthOptions: QuickReplyOption[] = [
              { id: "worth_yes", label: "Yeah, I think so", emoji: "👍", value: "worth_yes", color: "white" as const },
              { id: "worth_no", label: "Probably not", emoji: "🤔", value: "worth_no", color: "yellow" as const },
            ];
            
            addAssistantMessage(
              `That makes sense — I noticed a **${modeLabel}** pattern. No judgment here!\n\nHere's a question to sit with: Is the ${benefitWord} worth the $${actualMonthlySpend.toFixed(0)} you spent this month?`,
              worthOptions,
              true
            );
          }, 500);
        }
      } else if (currentLayer === 3) {
        // Layer 3: Handle economic evaluation response
        if (value === "worth_yes") {
          // User says it's worth it - exit gracefully
          setTimeout(() => {
            addAssistantMessage(
              "Got it — sounds like it's working for you. We can always revisit if anything changes! 🙌",
              [{ id: "done", label: "Close", emoji: "✕", value: "done", color: "white" as const }],
              false
            );
          }, 500);
        } else if (value === "worth_no") {
          // User says not worth it - explore change
          setTimeout(() => {
            const changeOptions: QuickReplyOption[] = [
              { id: "barrier", label: "What gets in the way of changing", emoji: "🚧", value: "barrier", color: "white" as const },
              { id: "redirect", label: "Where I'd rather that money go", emoji: "💸", value: "redirect", color: "white" as const },
              { id: "one_thing", label: "One thing I could try", emoji: "💡", value: "one_thing", color: "white" as const },
              { id: "not_now", label: "Not ready to think about it", emoji: "⏸️", value: "not_now", color: "white" as const },
            ];
            
            addAssistantMessage(
              "That's honest — and it's a good place to start. Would you like to explore what might help?",
              changeOptions,
              true
            );
          }, 500);
        } else if (value === "not_now") {
          // User not ready - respect boundary
          setTimeout(() => {
            addAssistantMessage(
              "Totally fair. Sometimes just noticing is enough for now. I'm here whenever you want to explore more. 💚",
              [{ id: "done", label: "Thanks!", emoji: "✨", value: "done", color: "white" as const }],
              false
            );
          }, 500);
        } else {
          // User wants to explore barriers/alternatives - use LLM
          setLoading(true);
          let explorationPrompt: string;
          
          switch (value) {
            case "barrier":
              explorationPrompt = "barrier exploration - what gets in the way of cooking more";
              break;
            case "redirect":
              explorationPrompt = "opportunity cost - where they'd rather the money go";
              break;
            case "one_thing":
              explorationPrompt = "change enablement - one small thing they could try";
              break;
            default:
              explorationPrompt = "general reflection on food spending";
          }
          
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
                currentLayer: 3,
                mode: currentMode,
                messages,
                metadata: { 
                  tags: [],
                  userGuess: actualMonthlySpend * 0.7, // approximate
                  actualAmount: actualMonthlySpend,
                },
              },
              foodReflectionType: explorationPrompt,
            }),
          })
            .then(res => res.json())
            .then(data => {
              setLoading(false);
              addAssistantMessage(
                data.message || "That's a great thing to explore. What feels like the biggest barrier for you?",
                [{ id: "done", label: "Close", emoji: "✕", value: "done", color: "white" as const }],
                false
              );
            })
            .catch(() => {
              setLoading(false);
              addAssistantMessage(
                "Thanks for sharing that. Every bit of awareness helps! 💚",
                [{ id: "done", label: "Close", emoji: "✕", value: "done", color: "white" as const }],
                false
              );
            });
          return; // Don't fall through to other handlers
        }
      }
    } else if (transaction.category === "coffee") {
      // Coffee Check-In: Frequency Calibration (Layer 1)
      if (currentLayer === 1) {
        // User just made their guess - calculate and reveal actual
        const actualMonthlyCount = getMonthlyCoffeeCount();
        const actualMonthlySpend = getMonthlyCoffeeSpend();
        
        // Parse the guess from the value (value is now the numeric guess)
        const userGuessCount = parseInt(value, 10) || Math.round(actualMonthlyCount * 0.5);
        
        // Store guess and actual in session metadata
        setUserGuessCount(userGuessCount);
        setActualCount(actualMonthlyCount);
        setActualAmount(actualMonthlySpend);
        
        // Get calibration result
        const calibration = getCoffeeCalibrationResult(userGuessCount, actualMonthlyCount, actualMonthlySpend);
        
        // Set calibration phase and transition to Layer 2
        setCalibrationPhase("feeling_asked");
        setLayer(2);
        
        // Transition to feeling question
        setTimeout(() => {
          const feelingQ = getCoffeeFeelingQuestion();
          addAssistantMessage(
            `${calibration.message}\n\n${feelingQ.content}`,
            feelingQ.options,
            true
          );
        }, 800);
        
      } else if (currentLayer === 2) {
        // Handle Layer 2 flow based on coffee check-in phase
        const coffeeMotivations = ["routine", "nearby", "pick_me_up", "focus"];
        const coffeeQ2Responses = [
          "just_happened", "intentional", // routine path
          "near_work", "near_home", "out_and_about", // nearby path
          "work_heavy", "bored_stuck", "stressed_anxious", "step_away", // pick_me_up path
          "real_difference", "half_time", "hard_to_say", "probably_not", "ritual", // focus path
        ];
        
        if (value === "ok_with_it") {
          // User is fine with their spending - light reflection and exit
          setCalibrationPhase("complete");
          setTimeout(() => {
            addAssistantMessage(
              "Got it — sounds like it's working for you! We can always revisit if anything changes. ☕✨",
              [{ id: "done", label: "Thanks for the check-in!", emoji: "✨", value: "done", color: "white" as const }],
              false
            );
          }, 500);
          
        } else if (value === "could_be_better") {
          // User wants to explore - check if they were "way off" to offer breakdown
          // Per spec: only offer breakdown if way off (stored as #awareness-gap tag)
          const isWayOff = session.metadata.tags.includes("#awareness-gap");
          
          if (isWayOff) {
            // Guess was way off - offer breakdown first
            setCalibrationPhase("breakdown_offered");
            setTimeout(() => {
              const breakdownOptions: QuickReplyOption[] = [
                { id: "show_coffee_breakdown", label: "Yes, show me", emoji: "📊", value: "show_coffee_breakdown", color: "white" as const },
                { id: "skip_coffee_breakdown", label: "No, I'd rather move on", emoji: "➡️", value: "skip_coffee_breakdown", color: "white" as const },
              ];
              
              addAssistantMessage(
                "Would you like to see what's behind these purchases?",
                breakdownOptions,
                true
              );
            }, 500);
          } else {
            // Not way off - skip breakdown and go straight to motivation question
            setCalibrationPhase("layer_2_ready");
            setTimeout(() => {
              const motivationQ = getCoffeeMotivationQuestion();
              addAssistantMessage(motivationQ.content, motivationQ.options, true);
            }, 500);
          }
          
        } else if (value === "show_coffee_breakdown") {
          // User wants to see coffee breakdown
          setCalibrationPhase("breakdown_shown");
          const coffeeStats = getCoffeeCategoryStats();
          
          // Build breakdown message
          let breakdownMessage = "Here's the breakdown:\n\n📊 By Merchant:\n";
          coffeeStats.topMerchants.forEach((m: { name: string; count: number; spend: number }) => {
            breakdownMessage += `• ${m.name}: ${m.count} purchases ($${m.spend.toFixed(0)})\n`;
          });
          
          breakdownMessage += "\n📅 By Day:\n";
          coffeeStats.topDays.slice(0, 3).forEach((d: { day: string; count: number }) => {
            breakdownMessage += `• ${d.day}: ${d.count} purchases\n`;
          });
          
          breakdownMessage += "\nDoes that land how you expected?";
          
          const breakdownReactionOptions: QuickReplyOption[] = [
            { id: "coffee_breakdown_expected", label: "Yeah, that tracks", emoji: "👍", value: "coffee_breakdown_expected", color: "white" as const },
            { id: "coffee_breakdown_surprised", label: "Some of that surprises me", emoji: "😮", value: "coffee_breakdown_surprised", color: "yellow" as const },
          ];
          
          setTimeout(() => {
            addAssistantMessage(breakdownMessage, breakdownReactionOptions, true);
          }, 500);
          
        } else if (value === "skip_coffee_breakdown" || value === "coffee_breakdown_expected" || value === "coffee_breakdown_surprised") {
          // After breakdown (or skipped) - transition to motivation question
          setCalibrationPhase("layer_2_ready");
          setTimeout(() => {
            const motivationQ = getCoffeeMotivationQuestion();
            addAssistantMessage(motivationQ.content, motivationQ.options, true);
          }, 500);
          
        } else if (coffeeMotivations.includes(value)) {
          // User selected a motivation - show Fixed Q2 for that path
          const motivation = value as CoffeeMotivation;
          // Store motivation as path for tracking
          setPath(motivation as unknown as ShoppingPath);
          
          // Calculate weekly average for routine path
          const actualMonthlyCount = getMonthlyCoffeeCount();
          const weeklyAverage = Math.round(actualMonthlyCount / 4);
          
          setTimeout(() => {
            const q2 = getCoffeeFixedQ2(motivation, weeklyAverage);
            addAssistantMessage(q2.content, q2.options, true);
          }, 500);
          
        } else if (coffeeQ2Responses.includes(value)) {
          // User answered Fixed Q2 - assign mode
          const motivation = (currentPath as unknown as CoffeeMotivation) || "routine";
          const modeAssignment = getCoffeeModeFromQ2Response(motivation as CoffeeMotivation, value);
          
          setMode(modeAssignment.mode);
          
          if (modeAssignment.isCounterProfile && modeAssignment.exitMessage) {
            // Counter-profile: graceful exit
            setTimeout(() => {
              addAssistantMessage(
                modeAssignment.exitMessage!,
                [{ id: "done", label: "Thanks!", emoji: "✨", value: "done", color: "white" as const }],
                false
              );
            }, 500);
          } else {
            // Regular mode - transition to Layer 3 with reflection options
            setLayer(3);
            const modeInfo = coffeeModeExplorations[modeAssignment.mode];
            const modeLabel = getModeLabel(modeAssignment.mode);
            
            setTimeout(() => {
              const actualMonthlyCount = getMonthlyCoffeeCount();
              const actualMonthlySpend = getMonthlyCoffeeSpend();
              const economicQ = getCoffeeEconomicEvaluation(modeAssignment.mode, actualMonthlySpend, actualMonthlyCount);
              
              let transitionMessage = `I think I see the pattern here.`;
              if (modeLabel) {
                transitionMessage = `Based on what you've shared, it sounds like you might be in **${modeLabel}** mode — ${modeInfo.description.toLowerCase()}.`;
              }
              transitionMessage += `\n\n${economicQ.content}`;
              
              addAssistantMessage(transitionMessage, economicQ.options, true);
            }, 500);
          }
        }
        
      } else if (currentLayer === 3) {
        // Handle Layer 3 economic evaluation responses
        if (value === "worth_it") {
          setTimeout(() => {
            addAssistantMessage(
              "Fair enough! If it's bringing you value, that's what matters. Just keep checking in with yourself from time to time. ☕",
              LAYER_3_REFLECTION_OPTIONS,
              false
            );
          }, 500);
        } else if (value === "not_worth") {
          setTimeout(() => {
            addAssistantMessage(
              "That's an honest reflection. Sometimes just noticing the pattern is the first step. Would you like to explore what might help?",
              LAYER_3_REFLECTION_OPTIONS,
              false
            );
          }, 500);
        } else if (value === "mixed") {
          setTimeout(() => {
            addAssistantMessage(
              "That makes sense — some purchases feel more intentional than others. Maybe it's about being more selective about when you go?",
              LAYER_3_REFLECTION_OPTIONS,
              false
            );
          }, 500);
        }
      }
    }
    
    // Layer 3: Handle reflection path selection
    if (currentLayer === 3 && ["problem", "feel", "worth", "different"].includes(value)) {
      setLoading(true);
      
      // Call API with reflection context
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
            currentLayer: 3,
            path: currentPath,
            mode: currentMode,
            reflectionPath: value, // Store reflection path choice
            messages,
            metadata: { tags: [] },
          },
        }),
      })
        .then(res => res.json())
        .then(data => {
          setLoading(false);
          addAssistantMessage(
            data.message || "That's a great question to explore. What comes to mind when you think about it?",
            data.options || [{ id: "close", label: "Close", emoji: "✕", value: "close", color: "white" }],
            false
          );
        })
        .catch(() => {
          setLoading(false);
          // Fallback reflection response based on selection
          let fallbackMessage: string;
          switch (value) {
            case "problem":
              fallbackMessage = "Let's explore this together. When you think about this pattern, does it feel like something you want to change, or is it working for you right now?";
              break;
            case "feel":
              fallbackMessage = "That's a good place to start. How does this spending pattern make you feel when you think about it?";
              break;
            case "worth":
              fallbackMessage = "When you think about what this money could have gone toward instead, what comes to mind?";
              break;
            default:
              fallbackMessage = "What's on your mind? I'm here to explore whatever feels relevant to you.";
          }
          addAssistantMessage(
            fallbackMessage,
            [{ id: "close", label: "Close", emoji: "✕", value: "close", color: "white" }],
            false
          );
        });
    }
  }, [messages, addUserMessage, addAssistantMessage, transaction, sessionId, currentLayer, currentPath, currentMode, calibrationPhase, setPath, setSubPath, setLayer, setLoading, setMode, setUserGuess, setActualAmount, setUserGuessCount, setActualCount, setCalibrationPhase, addTag, session]);

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
          data.options || [{ id: "close", label: "Close", emoji: "✕", value: "close", color: "white" }],
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
        <button
          onClick={() => {
            completeSession();
            onClose();
          }}
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
          onOptionSelect={handleOptionSelectWrapper}
          onRetry={() => setError(null)}
        />
      </div>
    </div>
  );
}
