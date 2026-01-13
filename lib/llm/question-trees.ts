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
// Sub-Path Specific Probing Goals (Layer 2)
// =============================================================================

export interface SubPathProbing {
  subPath: string;
  explorationGoal: string;
  probingHints: string[];
  targetModes: string[];
  modeSignals: Record<string, string[]>;
  counterProfileExit?: string;
  lightProbing?: boolean; // For deliberate paths that need less exploration
}

/**
 * Impulse sub-path probing details (Fixed Q2 responses for impulse path)
 */
export const impulseSubPathProbing: Record<string, SubPathProbing> = {
  price_felt_right: {
    subPath: "price_felt_right",
    explorationGoal: "Understand their internal price threshold around 'reasonable' to justify purchases",
    probingHints: [
      "What price did you get it for?",
      "What price would've made you pause?",
      "Do things under $X usually feel like a no-brainer for you?",
    ],
    targetModes: ["#intuitive-threshold-spender"],
    modeSignals: {
      "#intuitive-threshold-spender": [
        "saw it, wanted it, bought it",
        "the price felt right",
        "clear mental threshold around price",
        "low cognitive load purchases - don't think about it as much",
      ],
    },
  },
  treating_myself: {
    subPath: "treating_myself",
    explorationGoal: "What triggered the need for reward/treat? Is it tied to an event, emotion, or habit?",
    probingHints: [
      "What were you treating yourself for?",
      "Was it tied to something or more of a random mood?",
      "Do you just enjoy shopping as a fun activity?",
    ],
    targetModes: ["#reward-driven-spender", "#comfort-driven-spender", "#routine-treat-spender"],
    modeSignals: {
      "#reward-driven-spender": [
        "I hit my goal",
        "finished a hard week",
        "got a promotion",
        "I earned this",
      ],
      "#comfort-driven-spender": [
        "rough week",
        "felt down",
        "needed a pick-me-up",
        "retail therapy",
      ],
      "#routine-treat-spender": [
        "I always do this on Fridays",
        "it's just my thing",
        "no specific reason",
        "regular self-treating as habit",
      ],
    },
  },
  caught_eye: {
    subPath: "caught_eye",
    explorationGoal: "Where/how did they encounter it? Is this a pattern (scroll, in-store, etc)?",
    probingHints: [
      "Where did you see it?",
      "What caught your eye about it?",
      "Is this similar to things you already own?",
      "How many similar items do you have?",
      "Is trying new stuff kind of the fun part for you?",
    ],
    targetModes: ["#visual-impulse-driven", "#scroll-triggered", "#in-store-wanderer", "#aesthetic-driven", "#duplicate-collector"],
    modeSignals: {
      "#scroll-triggered": [
        "I was scrolling and saw it",
        "it came up in my feed",
        "saw it on Instagram/TikTok",
      ],
      "#in-store-wanderer": [
        "I was just walking by",
        "it was right there",
        "browsing in store",
      ],
      "#aesthetic-driven": [
        "it was so pretty",
        "I loved the packaging",
        "the color got me",
      ],
      "#duplicate-collector": [
        "I have like 5 of these already",
        "adding to my collection",
      ],
    },
  },
  trending: {
    subPath: "trending",
    explorationGoal: "How susceptible are they to trends, especially trend-following that leads to purchases that don't fit them?",
    probingHints: [
      "Where have you been seeing it?",
      "Do you feel like it's you or more of a trend buy?",
    ],
    targetModes: ["#trend-susceptibility-driven", "#social-media-influenced", "#friend-peer-influenced"],
    modeSignals: {
      "#social-media-influenced": [
        "I saw it on TikTok",
        "everyone's posting about it",
        "a creator I follow had it",
      ],
      "#friend-peer-influenced": [
        "my friend got one",
        "everyone at work has it",
        "someone recommended it",
      ],
    },
    counterProfileExit: "If user confirms 'it's me' when asked if it's them or a trend buy, exit gracefully - this is intentional",
  },
};

/**
 * Deliberate sub-path probing details (lighter probing since intentional)
 */
export const deliberateSubPathProbing: Record<string, SubPathProbing> = {
  afford_it: {
    subPath: "afford_it",
    explorationGoal: "Were they saving toward a goal or waiting for cash flow to clear?",
    probingHints: ["What changed that made it feel okay to buy?"],
    targetModes: ["#deliberate-budget-saver"],
    modeSignals: {
      "#deliberate-budget-saver": ["saved up for it", "budgeted for it", "waited until I could afford it"],
    },
    lightProbing: true,
  },
  right_price: {
    subPath: "right_price",
    explorationGoal: "Understand their deal-seeking patience—how do they track prices or find deals?",
    probingHints: ["What deal did you find?"],
    targetModes: ["#deliberate-deal-hunter"],
    modeSignals: {
      "#deliberate-deal-hunter": ["tracked the price", "waited for a sale", "used a price alert"],
    },
    lightProbing: true,
  },
  right_one: {
    subPath: "right_one",
    explorationGoal: "Understand their research/standards process—what made this the 'right' one?",
    probingHints: ["Where did you go for your research?", "Where did you end up finding it?"],
    targetModes: ["#deliberate-researcher"],
    modeSignals: {
      "#deliberate-researcher": ["did my research", "compared options", "read reviews"],
    },
    lightProbing: true,
  },
  still_wanted: {
    subPath: "still_wanted",
    explorationGoal: "Validate their intentional pause—how long did they sit with it? Did the desire persist?",
    probingHints: ["How long was it on your radar?"],
    targetModes: ["#deliberate-pause-tester"],
    modeSignals: {
      "#deliberate-pause-tester": ["sat on it for a while", "wanted to make sure", "waited to see if I still wanted it"],
    },
    lightProbing: true,
  },
  got_around: {
    subPath: "got_around",
    explorationGoal: "Understand what was creating the delay—friction, low priority, or just life?",
    probingHints: ["What finally made you do it?"],
    targetModes: ["#deliberate-low-priority"],
    modeSignals: {
      "#deliberate-low-priority": ["just got around to it", "finally had time", "was on my list for a while"],
    },
    lightProbing: true,
  },
};

/**
 * Deal sub-path probing details
 */
export const dealSubPathProbing: Record<string, SubPathProbing> = {
  limited_edition: {
    subPath: "limited_edition",
    explorationGoal: "Susceptibility to FOMO—do they buy because something is special, or does 'running out' create urgency that overrides judgment?",
    probingHints: [
      "Tell me more about the limited edition event or drop",
      "Would you have bought it if it wasn't running out?",
      "First one or adding to the collection?",
      "What would've happened if you missed it?",
    ],
    targetModes: ["#scarcity-driven"],
    modeSignals: {
      "#scarcity-driven": [
        "didn't want to miss it",
        "it's limited edition",
        "they were running out",
        "FOMO",
      ],
    },
  },
  sale_discount: {
    subPath: "sale_discount",
    explorationGoal: "Do they buy things they already wanted at a better price, or does the deal itself create the want?",
    probingHints: [
      "Were you already looking for this before the sale?",
      "Would you have bought it at full price?",
    ],
    targetModes: ["#deal-driven"],
    modeSignals: {
      "#deal-driven": [
        "couldn't pass up the deal",
        "it was such a good price",
        "I love a good sale",
      ],
    },
    counterProfileExit: "If they confirm they would have bought at full price, exit gracefully - this is intentional deal-hunting",
  },
  free_shipping: {
    subPath: "free_shipping",
    explorationGoal: "Did they add items just to hit the threshold, or were they already buying enough?",
    probingHints: [
      "What else was in your cart?",
      "Did you add anything extra to hit the threshold?",
    ],
    targetModes: ["#threshold-spending-driven"],
    modeSignals: {
      "#threshold-spending-driven": [
        "added something to get free shipping",
        "wanted the bonus",
        "hit the threshold",
      ],
    },
    counterProfileExit: "If they were already over the threshold, exit gracefully - this is fine",
  },
};

/**
 * Gift sub-path probing (light probing)
 */
export const giftSubPathProbing: Record<string, SubPathProbing> = {
  family: {
    subPath: "family",
    explorationGoal: "Light exploration of gift-giving patterns",
    probingHints: ["Special occasion or just because?", "How did you know they'd like it?"],
    targetModes: ["#gift-giver"],
    modeSignals: {
      "#planned-gift": ["knew what I wanted to get", "planned it out"],
      "#spontaneous-gift": ["saw it and thought of them", "it just felt right"],
    },
    lightProbing: true,
  },
  friend: {
    subPath: "friend",
    explorationGoal: "Light exploration of gift-giving patterns",
    probingHints: ["Special occasion or just because?"],
    targetModes: ["#gift-giver"],
    modeSignals: {},
    lightProbing: true,
  },
  partner: {
    subPath: "partner",
    explorationGoal: "Light exploration of gift-giving patterns",
    probingHints: ["Special occasion or just because?"],
    targetModes: ["#gift-giver"],
    modeSignals: {},
    lightProbing: true,
  },
  coworker: {
    subPath: "coworker",
    explorationGoal: "Light exploration of gift-giving patterns",
    probingHints: ["Special occasion or just because?"],
    targetModes: ["#gift-giver"],
    modeSignals: {},
    lightProbing: true,
  },
};

/**
 * Maintenance sub-path probing (light probing)
 */
export const maintenanceSubPathProbing: Record<string, SubPathProbing> = {
  same_thing: {
    subPath: "same_thing",
    explorationGoal: "Validate loyalty to the product",
    probingHints: ["How long have you been using that?"],
    targetModes: ["#loyal-repurchaser"],
    modeSignals: {
      "#loyal-repurchaser": ["it works", "always buy the same", "stick with what I know"],
    },
    lightProbing: true,
  },
  switched_up: {
    subPath: "switched_up",
    explorationGoal: "Understand what prompted the switch",
    probingHints: ["What made you switch?"],
    targetModes: ["#brand-switcher"],
    modeSignals: {
      "#brand-switcher": ["wanted to try something new", "heard good things about this one"],
    },
    lightProbing: true,
  },
  upgraded: {
    subPath: "upgraded",
    explorationGoal: "Understand the upgrade motivation",
    probingHints: ["What made you want to upgrade?"],
    targetModes: ["#upgrader"],
    modeSignals: {
      "#upgrader": ["wanted something better", "old one wasn't cutting it"],
    },
    lightProbing: true,
  },
};

/**
 * Get probing details for a given path and sub-path
 */
export function getSubPathProbing(path: string, subPath: string): SubPathProbing | undefined {
  switch (path) {
    case "impulse":
      return impulseSubPathProbing[subPath];
    case "deliberate":
      return deliberateSubPathProbing[subPath];
    case "deal":
      return dealSubPathProbing[subPath];
    case "gift":
      return giftSubPathProbing[subPath];
    case "maintenance":
      return maintenanceSubPathProbing[subPath];
    default:
      return undefined;
  }
}

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
