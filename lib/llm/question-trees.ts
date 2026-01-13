/**
 * Question Tree Data Structures
 * 
 * Based on PEEK_QUESTION_TREES.md specification.
 * Contains fixed questions, options, and routing logic for each check-in type.
 */

import { QuickReplyOption } from "@/lib/types";

// =============================================================================
// Shopping Check-In Fixed Questions
// =============================================================================

export interface FixedQuestionResponse {
  content: string;
  options: QuickReplyOption[];
}

/**
 * Shopping Fixed Question 1: "What's the story behind this purchase?"
 */
export function getShoppingFixedQuestion1(
  transaction: { merchant: string; amount: number }
): FixedQuestionResponse {
  return {
    content: `Hey! I noticed you spent $${transaction.amount.toFixed(2)} at ${transaction.merchant}. When you bought this, were you...`,
    options: [
      {
        id: "impulse",
        label: "Saw it and bought it",
        emoji: "⚡",
        value: "impulse",
        color: "yellow", // Less intentional - needs probing
      },
      {
        id: "deliberate",
        label: "Been thinking about this",
        emoji: "🎯",
        value: "deliberate",
        color: "white",
      },
      {
        id: "deal",
        label: "Good deal made me go for it",
        emoji: "🏷️",
        value: "deal",
        color: "yellow", // Deal-driven - needs probing
      },
      {
        id: "gift",
        label: "Bought for someone else",
        emoji: "🎁",
        value: "gift",
        color: "white",
      },
      {
        id: "maintenance",
        label: "Restocking / replacing",
        emoji: "🔄",
        value: "maintenance",
        color: "white",
      },
    ],
  };
}

// =============================================================================
// Shopping Path Exploration Goals
// =============================================================================

export interface ExplorationGoal {
  path: string;
  goal: string;
  probingHints: string[];
  modeIndicators: Record<string, string[]>;
  counterProfilePatterns: string[];
}

export const shoppingExplorationGoals: Record<string, ExplorationGoal> = {
  impulse: {
    path: "impulse",
    goal: "Understand what emotional or environmental triggers led to the spontaneous purchase",
    probingHints: [
      "What were you doing right before you saw it?",
      "How were you feeling at that moment?",
      "Was there something specific that caught your attention?",
      "Had you been in that store/site for a different reason?",
    ],
    modeIndicators: {
      "#comfort-driven-spender": [
        "mentions stress, bad day, needing a treat",
        "uses words like 'deserve', 'reward myself'",
        "links purchase to emotional state",
      ],
      "#novelty-seeker": [
        "excited by new things, trends",
        "mentions fear of missing out",
        "drawn to unique or limited items",
      ],
      "#social-spender": [
        "influenced by friends, social media",
        "mentions what others have or like",
        "shopping as social activity",
      ],
    },
    counterProfilePatterns: [
      "Actually had this on my list for a while",
      "I specifically went there for this",
      "It's something I've been researching",
    ],
  },
  deliberate: {
    path: "deliberate",
    goal: "Validate the intentionality and explore satisfaction with the decision process",
    probingHints: [
      "How long were you considering this?",
      "Did you compare options?",
      "What made you finally decide to buy?",
    ],
    modeIndicators: {
      "#intentional-planner": [
        "researched options",
        "compared prices/features",
        "waited for the right time",
      ],
      "#quality-seeker": [
        "focused on durability, longevity",
        "willing to pay more for better",
        "mentions value over price",
      ],
    },
    counterProfilePatterns: [],
  },
  deal: {
    path: "deal",
    goal: "Distinguish between genuine value and deal-induced impulse buying",
    probingHints: [
      "Would you have bought this at full price?",
      "How did you find out about the deal?",
      "Do you have other similar items?",
    ],
    modeIndicators: {
      "#deal-hunter": [
        "actively seeks discounts",
        "feels validated by savings",
        "might buy more than needed for deals",
      ],
      "#scarcity-susceptible": [
        "responds to limited time/quantity",
        "fears missing out on deals",
        "urgency drives decision",
      ],
    },
    counterProfilePatterns: [
      "I was already planning to buy this",
      "I would have bought it anyway",
      "Just happened to be on sale",
    ],
  },
  gift: {
    path: "gift",
    goal: "Explore gift-giving patterns and any underlying motivations",
    probingHints: [
      "Is this for a special occasion?",
      "How did you decide on this gift?",
      "How does gift-giving make you feel?",
    ],
    modeIndicators: {
      "#generous-giver": [
        "enjoys making others happy",
        "thoughtful about gift selection",
        "might overspend on gifts",
      ],
      "#obligation-driven": [
        "feels pressure to give gifts",
        "mentions expectations",
        "gift-giving as social currency",
      ],
    },
    counterProfilePatterns: [],
  },
  maintenance: {
    path: "maintenance",
    goal: "Verify true necessity and explore restocking patterns",
    probingHints: [
      "Was the old one completely used up?",
      "Do you have a regular restocking schedule?",
      "Did you consider any alternatives?",
    ],
    modeIndicators: {
      "#organized-restockers": [
        "has system for tracking supplies",
        "buys before running out",
        "maintains inventory",
      ],
      "#just-in-case-buyer": [
        "buys extras 'just in case'",
        "might have unused duplicates",
        "anxiety about running out",
      ],
    },
    counterProfilePatterns: [],
  },
};

// =============================================================================
// Food Check-In Questions
// =============================================================================

export function getFoodAwarenessCalibration(
  transaction: { merchant: string; amount: number },
  actualMonthlySpend: number
): FixedQuestionResponse {
  return {
    content: `I see you ordered from ${transaction.merchant}. Before we dig in, how much do you think you've spent on food delivery this month?`,
    options: [
      {
        id: "low",
        label: `Around $${Math.round(actualMonthlySpend * 0.4)}`,
        emoji: "💵",
        value: "low",
        color: "white",
      },
      {
        id: "medium",
        label: `Around $${Math.round(actualMonthlySpend * 0.7)}`,
        emoji: "💵",
        value: "medium",
        color: "white",
      },
      {
        id: "high",
        label: `Around $${Math.round(actualMonthlySpend)}+`,
        emoji: "💵",
        value: "high",
        color: "white",
      },
    ],
  };
}

// =============================================================================
// Coffee/Treats Check-In Questions
// =============================================================================

export function getCoffeeFrequencyCalibration(
  transaction: { merchant: string },
  actualMonthlyCount: number
): FixedQuestionResponse {
  return {
    content: `☕ I noticed you stopped by ${transaction.merchant}. How many times do you think you've grabbed coffee/treats this month?`,
    options: [
      {
        id: "few",
        label: `${Math.max(1, Math.round(actualMonthlyCount * 0.3))} or fewer times`,
        emoji: "🔢",
        value: "few",
        color: "white",
      },
      {
        id: "some",
        label: `About ${Math.round(actualMonthlyCount * 0.6)}-${Math.round(actualMonthlyCount * 0.8)} times`,
        emoji: "🔢",
        value: "some",
        color: "white",
      },
      {
        id: "many",
        label: `More than ${Math.round(actualMonthlyCount * 0.9)} times`,
        emoji: "🔢",
        value: "many",
        color: "yellow",
      },
    ],
  };
}

// =============================================================================
// Layer 3: Reflection Options
// =============================================================================

export function getReflectionOptions(): FixedQuestionResponse {
  return {
    content: "Would you like to explore any of these?",
    options: [
      {
        id: "problem",
        label: "Is this a problem?",
        emoji: "🤔",
        value: "problem",
        color: "white",
      },
      {
        id: "feel",
        label: "How do I feel about this?",
        emoji: "💭",
        value: "feel",
        color: "white",
      },
      {
        id: "worth",
        label: "Is this a good use of money?",
        emoji: "💰",
        value: "worth",
        color: "white",
      },
      {
        id: "different",
        label: "I have a different question",
        emoji: "❓",
        value: "different",
        color: "white",
      },
      {
        id: "done",
        label: "I'm good for now",
        emoji: "✅",
        value: "done",
        color: "white",
      },
    ],
  };
}

// =============================================================================
// Mode Definitions
// =============================================================================

export interface ModeDefinition {
  id: string;
  name: string;
  description: string;
  indicators: string[];
  reflectionGuidance: string;
}

export const modeDefinitions: Record<string, ModeDefinition> = {
  "#comfort-driven-spender": {
    id: "#comfort-driven-spender",
    name: "Comfort-Driven Spender",
    description: "Uses shopping as emotional regulation or self-care",
    indicators: [
      "Purchases linked to stress or emotional state",
      'Uses words like "deserve", "treat myself"',
      "Shopping improves mood",
    ],
    reflectionGuidance:
      "Explore alternative ways to meet emotional needs. Consider if purchases bring lasting satisfaction.",
  },
  "#novelty-seeker": {
    id: "#novelty-seeker",
    name: "Novelty Seeker",
    description: "Drawn to new, trendy, or unique items",
    indicators: [
      "Excited by new releases or trends",
      "Fear of missing out on limited items",
      "Quick to adopt new products",
    ],
    reflectionGuidance:
      "Consider whether the excitement comes from the item itself or the newness. How do past 'new' purchases feel now?",
  },
  "#deal-hunter": {
    id: "#deal-hunter",
    name: "Deal Hunter",
    description: "Motivated by discounts and perceived savings",
    indicators: [
      "Actively seeks deals and discounts",
      "Feels validated by savings",
      "May buy unneeded items if on sale",
    ],
    reflectionGuidance:
      "Calculate true savings by considering if you would have bought at full price. Quality of deals vs quantity.",
  },
};
