/**
 * Question Tree Data Structures
 * 
 * Based on PEEK_QUESTION_TREES.md specification.
 * Contains fixed questions, options, and routing logic for each check-in type.
 */

import { QuickReplyOption } from "@/lib/types";
import type { ShoppingPath } from "@/lib/types";

// =============================================================================
// Shopping Check-In Fixed Questions
// =============================================================================

export interface FixedQuestionResponse {
  content: string;
  options: QuickReplyOption[];
}

/**
 * Shopping Fixed Question 2 question text mapping (by Q1 path).
 *
 * Spec source: docs/question-trees/shopping-check-in.md
 */
export const SHOPPING_Q2_QUESTIONS: Record<ShoppingPath, string> = {
  impulse: "What made you go for it?",
  deliberate: "What were you waiting for?",
  deal: "Tell me more about the deal, discount or limited event?",
  gift: "Who was it for?",
  maintenance: "Did you get the same thing or switched it up?",
};

export function getShoppingFixedQuestion2Text(path: string): string | null {
  if (path in SHOPPING_Q2_QUESTIONS) {
    return SHOPPING_Q2_QUESTIONS[path as keyof typeof SHOPPING_Q2_QUESTIONS];
  }
  return null;
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
      {
        id: "other",
        label: "Other/Custom",
        emoji: "📝",
        value: "other",
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
      // Exploration TAGS (not modes): these are categorization labels for *why* they bought,
      // not the behavioral modes assigned after probing completes.
      "#price-sensitivity-driven": [
        "mentions the price felt right / good value / a steal",
        "references a personal 'under $X' threshold or mental price ceiling",
        "talks about comparing price vs what it normally costs",
      ],
      "#self-reward-driven": [
        "frames it as a treat / reward / 'I deserved it'",
        "connects the purchase to celebrating, a hard week, or needing a pick-me-up",
        "uses language like 'earned it' or 'finally letting myself'",
      ],
      "#visual-impulse-driven": [
        "says it 'caught my eye' / 'looked cute' / 'so pretty'",
        "mentions scrolling, seeing it in a feed, or walking past it in-store",
        "describes being drawn in by aesthetics (color, packaging, vibe)",
      ],
      "#trend-susceptibility-driven": [
        "mentions it was trending / everyone has it / hype",
        "references TikTok/Instagram/YouTube or an influencer/creator",
        "mentions friends/peers having it or recommending it",
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
    // Exploration TAGS (not modes): categorize what kind of intentionality is present.
    modeIndicators: {
      "#deliberate-purchase": [
        "describes planning, waiting, or intentionally deciding over time",
        "mentions comparing options, reading reviews, or doing research",
        "frames it as a considered decision rather than a spur-of-the-moment buy",
      ],
      "#value-standards-driven": [
        "mentions durability, quality, or 'the right one' standards",
        "talks about long-term value (cost-per-use, investment piece)",
        "emphasizes fit with needs/style rather than urgency or hype",
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
    // Exploration TAGS (not modes): categorize what kind of deal/urgency is driving the purchase.
    modeIndicators: {
      "#scarcity-driven": [
        "mentions limited drop, running out, urgency, or FOMO",
        "describes pressure to buy now because availability might disappear",
      ],
      "#deal-driven": [
        "focuses on discount amount, sale, or feeling good about savings",
        "mentions waiting for a sale or tracking price drops",
      ],
      "#threshold-spending-driven": [
        "mentions free shipping thresholds, bonuses, samples, or add-ons to qualify",
        "describes adding extra items just to unlock a perk",
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
    // Gift path is generally intentional; keep path-level indicators empty.
    modeIndicators: {},
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
    // Maintenance path is generally necessity; keep path-level indicators empty.
    modeIndicators: {},
    counterProfilePatterns: [],
  },
};

// =============================================================================
// Sub-Path Specific Probing Goals (Layer 2)
// =============================================================================

export interface SubPathProbing {
  subPath: string;
  /**
   * Exploration tag inferred from the Fixed Q2 selection.
   * NOTE: Tags (e.g. #visual-impulse-driven) are NOT modes.
   */
  explorationTag?: string;
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
    explorationTag: "#price-sensitivity-driven",
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
    explorationTag: "#self-reward-driven",
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
    explorationTag: "#visual-impulse-driven",
    explorationGoal: "Where/how did they encounter it? Is this a pattern (scroll, in-store, etc)?",
    probingHints: [
      "Where did you see it?",
      "What caught your eye about it?",
      "Is this similar to things you already own?",
      "How many similar items do you have?",
      "Is trying new stuff kind of the fun part for you?",
    ],
    // Modes are flat: do NOT include exploration tags like #visual-impulse-driven
    targetModes: ["#scroll-triggered", "#in-store-wanderer", "#aesthetic-driven", "#duplicate-collector"],
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
    explorationTag: "#trend-susceptibility-driven",
    explorationGoal: "How susceptible are they to trends, especially trend-following that leads to purchases that don't fit them?",
    probingHints: [
      "Where have you been seeing it?",
      "Do you feel like it's you or more of a trend buy?",
    ],
    // Modes are flat: do NOT include exploration tags like #trend-susceptibility-driven
    targetModes: ["#social-media-influenced", "#friend-peer-influenced"],
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
  other: {
    subPath: "other",
    explorationGoal: "Open-ended: understand what actually drove the impulse purchase when none of the fixed options fit",
    probingHints: [
      "What was the thing that made you want it right then?",
      "Was it more about the price, your mood, or how it looked?",
      "If you hadn't bought it today, what do you think would've happened?",
    ],
    targetModes: [
      "#intuitive-threshold-spender",
      "#reward-driven-spender",
      "#comfort-driven-spender",
      "#routine-treat-spender",
      "#scroll-triggered",
      "#in-store-wanderer",
      "#aesthetic-driven",
      "#duplicate-collector",
      "#exploration-hobbyist",
      "#social-media-influenced",
      "#friend-peer-influenced",
    ],
    modeSignals: {},
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
    probingHints: [
      "Where did you go for your research?",
      "Where did you end up finding it?",
      "How long did you spend looking?",
    ],
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

/**
 * Food awareness calibration - Layer 1
 * User guesses their spending, we compare to actual
 */
export function getFoodAwarenessCalibration(
  transaction: { merchant: string; amount: number },
  actualMonthlySpend: number
): FixedQuestionResponse {
  return {
    content: `I see you ordered from ${transaction.merchant}. Before we dig in, how much do you think you've spent on food delivery this month?`,
    options: [
      {
        id: "guess_low",
        label: `Around $${Math.round(actualMonthlySpend * 0.4)}`,
        emoji: "💵",
        value: String(Math.round(actualMonthlySpend * 0.4)),
        color: "white",
      },
      {
        id: "guess_medium",
        label: `Around $${Math.round(actualMonthlySpend * 0.7)}`,
        emoji: "💵",
        value: String(Math.round(actualMonthlySpend * 0.7)),
        color: "white",
      },
      {
        id: "guess_high",
        label: `Around $${Math.round(actualMonthlySpend)}`,
        emoji: "💵",
        value: String(Math.round(actualMonthlySpend)),
        color: "white",
      },
      {
        id: "guess_higher",
        label: `$${Math.round(actualMonthlySpend * 1.2)}+`,
        emoji: "💵",
        value: String(Math.round(actualMonthlySpend * 1.2)),
        color: "white",
      },
    ],
  };
}

/**
 * Get the calibration result message based on guess vs actual
 */
export interface CalibrationResult {
  isClose: boolean;
  percentDiff: number;
  absoluteDiff: number;
  actualAmount: number;
  message: string;
  showBreakdown: boolean;
}

export function getFoodCalibrationResult(
  guessedAmount: number,
  actualAmount: number
): CalibrationResult {
  const diff = actualAmount - guessedAmount;
  const percentDiff = Math.abs(diff / actualAmount) * 100;
  const absoluteDiff = Math.abs(diff);
  const isClose = percentDiff <= 20 || absoluteDiff < 75;

  if (isClose) {
    return {
      isClose: true,
      percentDiff,
      absoluteDiff,
      actualAmount,
      message: `Nice awareness! You've spent $${actualAmount.toFixed(0)} on food delivery this month. You were pretty close! 🎯`,
      showBreakdown: false,
    };
  } else {
    const direction = diff > 0 ? "more" : "less";
    return {
      isClose: false,
      percentDiff,
      absoluteDiff,
      actualAmount,
      message: `Actually, you've spent $${actualAmount.toFixed(0)} this month — about $${absoluteDiff.toFixed(0)} ${direction} than you guessed. Would you like to see what's behind this amount?`,
      showBreakdown: true,
    };
  }
}

/**
 * "How do you feel about this number?" - after calibration reveal
 */
export function getFoodFeelingQuestion(): FixedQuestionResponse {
  return {
    content: "How do you feel about this number?",
    options: [
      {
        id: "ok_with_it",
        label: "I'm ok with it",
        emoji: "👍",
        value: "ok_with_it",
        color: "white",
      },
      {
        id: "not_great",
        label: "Not great, honestly",
        emoji: "😕",
        value: "not_great",
        color: "yellow",
      },
    ],
  };
}

/**
 * Food motivation question - Layer 2 (direct mode assignment)
 */
export type FoodMode = 
  | "#autopilot-from-stress"
  | "#convenience-driven"
  | "#lack-of-pre-planning"
  | "#intentional-treat"
  | "#social-eating";

export function getFoodMotivationQuestion(): FixedQuestionResponse {
  return {
    content: "When you think about why you order food, what feels most true?",
    options: [
      {
        id: "drained",
        label: "I'm usually too drained to cook",
        emoji: "😩",
        value: "drained",
        color: "yellow",
      },
      {
        id: "easier",
        label: "It's just easier to order",
        emoji: "📱",
        value: "easier",
        color: "white",
      },
      {
        id: "no_plan",
        label: "I keep meaning to cook but never plan",
        emoji: "📋",
        value: "no_plan",
        color: "yellow",
      },
      {
        id: "wanted_meal",
        label: "I actually wanted that specific meal",
        emoji: "🍜",
        value: "wanted_meal",
        color: "white",
      },
      {
        id: "too_busy",
        label: "I'm too busy to plan",
        emoji: "⏰",
        value: "too_busy",
        color: "yellow",
      },
    ],
  };
}

/**
 * Map food motivation response to mode
 */
export function getFoodModeFromMotivation(motivation: string): string | null {
  const modeMap: Record<string, string> = {
    // Original keys from question tree
    drained: "#autopilot-from-stress",
    easier: "#convenience-driven",
    no_plan: "#lack-of-pre-planning",
    wanted_meal: "#intentional-treat", // Counter-profile
    too_busy: "#lack-of-pre-planning",
    // Alternative keys used in check-in UI
    stress: "#autopilot-from-stress",
    convenience: "#convenience-driven",
    planning: "#lack-of-pre-planning",
    craving: "#intentional-treat",
    social: "#social-eating",
  };
  return modeMap[motivation] || null;
}

/**
 * Food mode exploration goals - for Layer 2 probing
 */
export interface FoodModeExploration {
  mode: FoodMode;
  explorationGoal: string;
  probingHints: string[];
  keySignals: string[];
  isCounterProfile?: boolean;
  exitResponses?: string[];
}

export const foodModeExplorations: Record<string, FoodModeExploration> = {
  "#autopilot-from-stress": {
    mode: "#autopilot-from-stress",
    explorationGoal: "Understand what's driving the stress/drain. Is it work, life circumstances, or something more chronic?",
    probingHints: [
      "What's usually going on when you feel that way?",
      "Is it more of a work thing or just life in general?",
      "Does it tend to happen on certain days?",
    ],
    keySignals: [
      "when I'm stressed I just order",
      "busy week so I didn't cook",
      "I don't have the energy",
    ],
  },
  "#convenience-driven": {
    mode: "#convenience-driven",
    explorationGoal: "Understand if this is a lifestyle choice or friction avoidance. Do they enjoy cooking but find ordering easier?",
    probingHints: [
      "Do you cook at all, or is ordering kind of the default?",
      "Is it more about not wanting to deal with cleanup, or the whole thing?",
      "Do you have go-to orders or do you mix it up?",
    ],
    keySignals: [
      "it's just easier",
      "it shows up at my door",
      "I don't have to do anything",
    ],
  },
  "#lack-of-pre-planning": {
    mode: "#lack-of-pre-planning",
    explorationGoal: "Understand where the planning breaks down. Is it grocery shopping? Meal prep? Time management?",
    probingHints: [
      "What usually gets in the way of planning?",
      "Do you end up ordering because there's nothing in the fridge, or because you ran out of time?",
      "Have you tried meal prepping or is that not your thing?",
    ],
    keySignals: [
      "got home late",
      "forgot to bring lunch",
      "didn't have time to prep",
      "there was nothing in the fridge",
    ],
  },
  "#intentional-treat": {
    mode: "#intentional-treat",
    explorationGoal: "Validate that this was intentional. Light probing only — if confirmed, exit gracefully.",
    probingHints: [
      "Nice — what did you get?",
      "Was it a planned treat or more of a craving?",
    ],
    keySignals: [
      "I was craving it",
      "planned treat",
      "wanted that specific thing",
    ],
    isCounterProfile: true,
    exitResponses: [
      "Sounds like you knew what you wanted — enjoy!",
      "Nothing wrong with treating yourself intentionally.",
    ],
  },
};

/**
 * Food economic evaluation - Layer 3
 * Mode-specific benefit framing
 */
export function getFoodEconomicEvaluation(mode: FoodMode, monthlySpend: number): FixedQuestionResponse {
  const benefitMap: Record<FoodMode, string> = {
    "#autopilot-from-stress": "relief from cooking when you're drained",
    "#convenience-driven": "the ease and convenience",
    "#lack-of-pre-planning": "not having to plan",
    "#intentional-treat": "enjoying the meals you really wanted",
    "#social-eating": "the social experience of sharing meals",
  };

  const benefit = benefitMap[mode] || "convenience";

  return {
    content: `Is ${benefit} worth the $${monthlySpend.toFixed(0)} you're spending?`,
    options: [
      {
        id: "worth_it",
        label: "Yeah, it's worth it to me",
        emoji: "✅",
        value: "worth_it",
        color: "white",
      },
      {
        id: "not_worth",
        label: "Honestly, probably not",
        emoji: "🤔",
        value: "not_worth",
        color: "yellow",
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
        value: String(Math.max(1, Math.round(actualMonthlyCount * 0.3))),
        color: "white",
      },
      {
        id: "some",
        label: `About ${Math.round(actualMonthlyCount * 0.6)}-${Math.round(actualMonthlyCount * 0.8)} times`,
        emoji: "🔢",
        value: String(Math.round(actualMonthlyCount * 0.7)),
        color: "white",
      },
      {
        id: "many",
        label: `More than ${Math.round(actualMonthlyCount * 0.9)} times`,
        emoji: "🔢",
        value: String(Math.round(actualMonthlyCount)),
        color: "yellow",
      },
    ],
  };
}

/**
 * Get the calibration result message for coffee based on guess vs actual
 */
export interface CoffeeCalibrationResult {
  isClose: boolean;
  percentDiff: number;
  absoluteDiff: number;
  message: string;
  actualCount: number;
  totalSpend: number;
}

export function getCoffeeCalibrationResult(
  guessedCount: number,
  actualCount: number,
  totalSpend: number
): CoffeeCalibrationResult {
  const diff = actualCount - guessedCount;
  const percentDiff = actualCount > 0 ? Math.abs(diff / actualCount) * 100 : 0;
  const isClose = percentDiff <= 20 || Math.abs(diff) <= 2;

  if (isClose) {
    return {
      isClose: true,
      percentDiff,
      absoluteDiff: Math.abs(diff),
      message: `Pretty close! You made **${actualCount} purchases** this month, totaling **$${totalSpend.toFixed(0)}**. Nice awareness! 🎯`,
      actualCount,
      totalSpend,
    };
  } else {
    const direction = diff > 0 ? "more" : "fewer";
    return {
      isClose: false,
      percentDiff,
      absoluteDiff: Math.abs(diff),
      message: `Actually, you made **${actualCount} purchases** this month — that's ${Math.abs(diff)} ${direction} than you guessed, totaling **$${totalSpend.toFixed(0)}**. 📊`,
      actualCount,
      totalSpend,
    };
  }
}

/**
 * "How do you feel about that number?" - after calibration reveal
 */
export function getCoffeeFeelingQuestion(): FixedQuestionResponse {
  return {
    content: "How do you feel about that number?",
    options: [
      {
        id: "ok_with_it",
        label: "I'm ok with it",
        emoji: "👍",
        value: "ok_with_it",
        color: "white",
      },
      {
        id: "could_be_better",
        label: "Feel like it could be better",
        emoji: "🤔",
        value: "could_be_better",
        color: "yellow",
      },
    ],
  };
}

// =============================================================================
// Coffee/Treats Layer 2: Mode Assignment (Fixed Questions)
// =============================================================================

export type CoffeeMode =
  | "#autopilot-routine"
  | "#environment-triggered"
  | "#emotional-coping"
  | "#productivity-justification"
  | "#intentional-ritual"         // Counter-profile
  | "#productive-coffee-drinker"  // Counter-profile
  | "#social-ritual";             // Social ritual

export type CoffeeMotivation = "routine" | "nearby" | "pick_me_up" | "focus";

/**
 * Coffee motivation question: "What's the main reason you buy these?"
 */
export function getCoffeeMotivationQuestion(): FixedQuestionResponse {
  return {
    content: "What's the main reason you buy these?",
    options: [
      {
        id: "routine",
        label: "It's become a routine",
        emoji: "🔁",
        value: "routine",
        color: "white",
      },
      {
        id: "nearby",
        label: "When I happen to be nearby",
        emoji: "📍",
        value: "nearby",
        color: "white",
      },
      {
        id: "pick_me_up",
        label: "When I need a pick-me-up or break",
        emoji: "☕",
        value: "pick_me_up",
        color: "yellow",
      },
      {
        id: "focus",
        label: "Helps me focus or get things done",
        emoji: "🎯",
        value: "focus",
        color: "white",
      },
    ],
  };
}

/**
 * Coffee Fixed Q2 for each motivation path
 */
export function getCoffeeFixedQ2(motivation: CoffeeMotivation, weeklyAverage: number): FixedQuestionResponse {
  switch (motivation) {
    case "routine":
      return {
        content: `You've averaged about ${weeklyAverage} times a week — was that intentional or did it just kind of happen?`,
        options: [
          {
            id: "just_happened",
            label: "Just sort of happened",
            emoji: "🤷",
            value: "just_happened",
            color: "yellow",
          },
          {
            id: "intentional",
            label: "Yeah, intentional",
            emoji: "✅",
            value: "intentional",
            color: "white",
          },
        ],
      };
    
    case "nearby":
      return {
        content: "Where does this usually happen?",
        options: [
          {
            id: "near_work",
            label: "Near work / on commute",
            emoji: "🏢",
            value: "near_work",
            color: "white",
          },
          {
            id: "near_home",
            label: "Near home",
            emoji: "🏠",
            value: "near_home",
            color: "white",
          },
          {
            id: "out_and_about",
            label: "When I'm out doing other things",
            emoji: "🚶",
            value: "out_and_about",
            color: "white",
          },
        ],
      };
    
    case "pick_me_up":
      return {
        content: "What's usually going on?",
        options: [
          {
            id: "work_heavy",
            label: "Work felt like a lot",
            emoji: "💼",
            value: "work_heavy",
            color: "yellow",
          },
          {
            id: "bored_stuck",
            label: "Bored or stuck, needed change of scenery",
            emoji: "😐",
            value: "bored_stuck",
            color: "yellow",
          },
          {
            id: "stressed_anxious",
            label: "Stressed or anxious",
            emoji: "😰",
            value: "stressed_anxious",
            color: "yellow",
          },
          {
            id: "step_away",
            label: "Just needed to step away",
            emoji: "🚪",
            value: "step_away",
            color: "white",
          },
        ],
      };
    
    case "focus":
      return {
        content: "You said it helps you focus — does it?",
        options: [
          {
            id: "real_difference",
            label: "Yeah, I notice a real difference",
            emoji: "✨",
            value: "real_difference",
            color: "white",
          },
          {
            id: "half_time",
            label: "Half the time",
            emoji: "🤔",
            value: "half_time",
            color: "yellow",
          },
          {
            id: "hard_to_say",
            label: "Think so? Hard to say",
            emoji: "❓",
            value: "hard_to_say",
            color: "yellow",
          },
          {
            id: "probably_not",
            label: "Honestly, probably not",
            emoji: "😅",
            value: "probably_not",
            color: "yellow",
          },
          {
            id: "ritual",
            label: "It's more about the ritual",
            emoji: "☕",
            value: "ritual",
            color: "white",
          },
        ],
      };
  }
}

/**
 * Map coffee Q2 responses to modes
 */
export interface CoffeeModeAssignment {
  mode: CoffeeMode;
  isCounterProfile: boolean;
  exitMessage?: string;
}

export function getCoffeeModeFromQ2Response(
  motivation: CoffeeMotivation,
  q2Response: string
): CoffeeModeAssignment {
  switch (motivation) {
    case "routine":
      if (q2Response === "intentional") {
        return {
          mode: "#intentional-ritual",
          isCounterProfile: true,
          exitMessage: "Sounds like you've got it dialed in! Nothing wrong with an intentional daily ritual. ☕✨",
        };
      }
      return { mode: "#autopilot-routine", isCounterProfile: false };
    
    case "nearby":
      // All responses lead to #environment-triggered
      return { mode: "#environment-triggered", isCounterProfile: false };
    
    case "pick_me_up":
      // All responses lead to #emotional-coping
      return { mode: "#emotional-coping", isCounterProfile: false };
    
    case "focus":
      if (q2Response === "real_difference") {
        return {
          mode: "#productive-coffee-drinker",
          isCounterProfile: true,
          exitMessage: "Sounds like it's working for you! If coffee genuinely helps your productivity, that's a worthwhile investment. ☕💪",
        };
      }
      return { mode: "#productivity-justification", isCounterProfile: false };
  }
}

// =============================================================================
// Coffee/Treats Mode Definitions and Exploration
// =============================================================================

export interface CoffeeModeExploration {
  mode: CoffeeMode;
  name: string;
  description: string;
  keySignals: string[];
  reflectionGuidance: string;
  isCounterProfile?: boolean;
}

export const coffeeModeExplorations: Record<CoffeeMode, CoffeeModeExploration> = {
  "#autopilot-routine": {
    mode: "#autopilot-routine",
    name: "Autopilot Routine",
    description: "Habit formed without conscious decision—it just accumulated over time",
    keySignals: [
      "just sort of happened",
      "didn't realize",
      "not sure when it started",
    ],
    reflectionGuidance: "The habit snuck up on you. Consider if this routine is serving you or running on autopilot.",
  },
  "#environment-triggered": {
    mode: "#environment-triggered",
    name: "Environment Triggered",
    description: "Purchases driven by physical proximity—environment makes the decision",
    keySignals: [
      "near work / on commute",
      "it's right there",
      "I walk past it",
    ],
    reflectionGuidance: "Your environment is making spending decisions for you. Consider if you can change the path or the pattern.",
  },
  "#emotional-coping": {
    mode: "#emotional-coping",
    name: "Emotional Coping",
    description: "Coffee/treat is response to emotional states (stress, anxiety, boredom)",
    keySignals: [
      "stressed or anxious",
      "needed a break",
      "rough day",
      "bored, stuck",
    ],
    reflectionGuidance: "You're using coffee runs to manage emotions. Consider if there are other ways to get the relief you're looking for.",
  },
  "#productivity-justification": {
    mode: "#productivity-justification",
    name: "Productivity Justification",
    description: "Claims productivity benefits, though outcome may or may not be real",
    keySignals: [
      "half the time",
      "think so? hard to say",
      "maybe it's placebo",
    ],
    reflectionGuidance: "The productivity claim might be more hope than reality. Consider testing whether you actually work better with or without it.",
  },
  "#intentional-ritual": {
    mode: "#intentional-ritual",
    name: "Intentional Ritual",
    description: "Consciously chose to have this as a regular treat",
    keySignals: [
      "intentional",
      "I like having this",
      "planned treat",
    ],
    reflectionGuidance: "You've made a conscious choice—that's the key difference. Enjoy it!",
    isCounterProfile: true,
  },
  "#productive-coffee-drinker": {
    mode: "#productive-coffee-drinker",
    name: "Productive Coffee Drinker",
    description: "Actually gets productive work done with coffee",
    keySignals: [
      "real difference",
      "actually works better",
      "measurable productivity",
    ],
    reflectionGuidance: "If it genuinely helps, it's a tool—not a habit. Keep monitoring the tradeoff.",
    isCounterProfile: true,
  },
  "#social-ritual": {
    mode: "#social-ritual",
    name: "Social Ritual",
    description: "Coffee runs are about social connection and shared time",
    keySignals: [
      "meeting someone",
      "catch up with",
      "social",
      "with friends",
    ],
    reflectionGuidance: "The coffee is secondary to the connection. Consider if the social benefit justifies the spend.",
  },
};

/**
 * Get mode-specific economic evaluation for coffee
 */
export function getCoffeeEconomicEvaluation(mode: CoffeeMode, monthlySpend: number, monthlyCount: number): FixedQuestionResponse {
  const perVisit = monthlyCount > 0 ? monthlySpend / monthlyCount : 0;
  
  const benefitMap: Record<CoffeeMode, string> = {
    "#autopilot-routine": "the daily ritual you didn't consciously choose",
    "#environment-triggered": "the convenience of grabbing something nearby",
    "#emotional-coping": "the mood boost and break from stress",
    "#productivity-justification": "the productivity you think you're getting",
    "#intentional-ritual": "your intentional daily treat",
    "#productive-coffee-drinker": "the real productivity boost",
    "#social-ritual": "the social connection and shared moments",
  };

  const benefit = benefitMap[mode] || "coffee and treats";

  return {
    content: `At $${perVisit.toFixed(0)} per visit, ${monthlyCount} times a month, that's $${monthlySpend.toFixed(0)}/month. Is ${benefit} worth it to you?`,
    options: [
      {
        id: "worth_it",
        label: "Yeah, it's worth it to me",
        emoji: "✅",
        value: "worth_it",
        color: "white",
      },
      {
        id: "not_worth",
        label: "Honestly, probably not",
        emoji: "🤔",
        value: "not_worth",
        color: "yellow",
      },
      {
        id: "mixed",
        label: "Some of it is, some isn't",
        emoji: "⚖️",
        value: "mixed",
        color: "white",
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
// Sub-Path Exploration Goals (for Layer 2 probing)
// =============================================================================

export interface SubPathExplorationGoal {
  subPath: string;
  mode: string;
  explorationGoal: string;
  probingHints: string[];
  keySignals: string[];
  possibleModes?: string[];  // For paths that branch to multiple modes
  lightProbing?: boolean;     // For deliberate paths: skip deep probing, exit gracefully
  counterProfileExit?: string; // Graceful exit message for deliberate/intentional behavior
}

/**
 * Impulse sub-path exploration goals - based on PEEK_QUESTION_TREES.md
 */
export const impulseSubPathGoals: Record<string, SubPathExplorationGoal> = {
  price_felt_right: {
    subPath: "price_felt_right",
    mode: "#intuitive-threshold-spender",
    explorationGoal: "Understand their internal price threshold around 'reasonable' to justify purchases",
    probingHints: [
      "What price did you get it for?",
      "What price would've made you pause?",
      "Do things under $X usually feel like a no-brainer for you?",
    ],
    keySignals: [
      "saw it, wanted it, bought it",
      "the price felt right",
      "Clear mental threshold around price",
      "Low cognitive load purchases - 'don't think about it as much'",
    ],
  },
  treating_myself: {
    subPath: "treating_myself",
    mode: "", // Determined by probing
    explorationGoal: "What triggered the need for reward/treat? Is it tied to an event, emotion, or habit?",
    probingHints: [
      "What were you treating yourself for?",
      "Was it tied to something or more of a random mood?",
      "Do you just enjoy shopping as a fun activity?",
    ],
    keySignals: [],
    possibleModes: [
      "#reward-driven-spender",   // Celebrating wins/accomplishments
      "#comfort-driven-spender",  // Retail therapy (stress, sadness, boredom)
      "#routine-treat-spender",   // Habitual treating (no specific trigger)
    ],
  },
  caught_eye: {
    subPath: "caught_eye",
    // Mode is determined by probing; #visual-impulse-driven is an exploration tag, not a mode.
    mode: "",
    explorationGoal: "Where/how did they encounter it? Is this a pattern (scroll, in-store, etc)?",
    probingHints: [
      "Where did you see it?",
      "What caught your eye about it?",
      "Is this similar to things you already own?",
      "How many similar items do you have?",
      "Is trying new stuff kind of the fun part for you?",
    ],
    keySignals: [
      "I was scrolling and saw it",
      "it came up in my feed",
      "I was just walking by",
      "it was so pretty",
      "I loved the packaging",
    ],
    possibleModes: [
      "#scroll-triggered",
      "#in-store-wanderer",
      "#aesthetic-driven",
      "#duplicate-collector",
      "#exploration-hobbyist",
    ],
  },
  trending: {
    subPath: "trending",
    // Mode is determined by probing; #trend-susceptibility-driven is an exploration tag, not a mode.
    mode: "",
    explorationGoal: "How susceptible are they to trends, especially trend-following that leads to purchases that don't fit them",
    probingHints: [
      "Where have you been seeing it?",
      "Do you feel like it's you or more of a trend buy?",
    ],
    keySignals: [
      "I saw it on TikTok",
      "everyone's posting about it",
      "a creator I follow had it",
      "my friend got one",
      "everyone at work has it",
    ],
    possibleModes: ["#social-media-influenced", "#friend-peer-influenced"],
  },
  other: {
    subPath: "other",
    // Open-ended branch: mode is determined by probing.
    mode: "",
    explorationGoal: "Open-ended: understand what actually drove the impulse purchase when none of the fixed options fit",
    probingHints: [
      "What was the thing that made you want it right then?",
      "Was it more about the price, your mood, or how it looked?",
      "If you hadn't bought it today, what do you think would've happened?",
    ],
    keySignals: [],
    possibleModes: [
      "#intuitive-threshold-spender",
      "#reward-driven-spender",
      "#comfort-driven-spender",
      "#routine-treat-spender",
      "#scroll-triggered",
      "#in-store-wanderer",
      "#aesthetic-driven",
      "#duplicate-collector",
      "#exploration-hobbyist",
      "#social-media-influenced",
      "#friend-peer-influenced",
    ],
  },
};

/**
 * Deal sub-path exploration goals - based on PEEK_QUESTION_TREES.md
 */
export const dealSubPathGoals: Record<string, SubPathExplorationGoal> = {
  limited_edition: {
    subPath: "limited_edition",
    mode: "#scarcity-driven",
    explorationGoal: "Susceptibility to FOMO - do they buy because something is special, or does 'running out' create urgency that overrides their judgment?",
    probingHints: [
      "Tell me more about the limited edition event or drop",
      "Would you have bought it if it wasn't running out?",
      "First one or adding to the collection?",
      "What would've happened if you missed it?",
    ],
    keySignals: [
      "it was selling out",
      "limited drop",
      "only a few left",
      "had to grab it before it was gone",
    ],
  },
  sale_discount: {
    subPath: "sale_discount",
    mode: "#deal-driven",
    explorationGoal: "Do they buy things they already wanted at a better price, or does the deal itself create the want?",
    probingHints: [
      "Tell me more about the sale, deal or discount",
      "What amount made it feel like the deal was worth it?",
      "Were you already looking for this or the deal caught your eye?",
      "Would you have bought it at full price?",
    ],
    keySignals: [
      "it was such a good deal",
      "X% off",
      "couldn't pass up the savings",
    ],
  },
  free_shipping: {
    subPath: "free_shipping",
    mode: "#threshold-spending-driven",
    explorationGoal: "Understand if they bought more than they needed to hit a threshold or get a bonus - did the 'free' thing cost them more than they realize?",
    probingHints: [
      "Was this online or in-store?",
      "Did you add any items to the cart that you didn't originally intend to buy? What were they?",
      "Would you have bought just the original item without the bonus?",
      "Was it worth what you added?",
    ],
    keySignals: [
      "hit the free shipping threshold",
      "added something to get the bonus",
      "got a free sample",
    ],
  },
};

/**
 * Deliberate sub-path exploration goals (light probing)
 */
export const deliberateSubPathGoals: Record<string, SubPathExplorationGoal> = {
  afford_it: {
    subPath: "afford_it",
    mode: "#deliberate-budget-saver",
    explorationGoal: "Were they saving toward a goal or waiting for cash flow to clear?",
    probingHints: [
      "What changed that made it feel okay to buy?",
    ],
    keySignals: ["saved up for it", "waited until I had the money"],
    lightProbing: true,
    counterProfileExit: "That's really thoughtful — waiting until the timing was right financially shows solid awareness of your budget.",
  },
  right_price: {
    subPath: "right_price",
    mode: "#deliberate-deal-hunter",
    explorationGoal: "Understand their deal-seeking patience - how do they track prices or find deals?",
    probingHints: [
      "What deal did you find?",
    ],
    keySignals: ["waited for a sale", "price tracking"],
    lightProbing: true,
    counterProfileExit: "Nice! Being patient for the right deal takes discipline. That kind of intentional waiting usually pays off.",
  },
  right_one: {
    subPath: "right_one",
    mode: "#deliberate-researcher",
    explorationGoal: "Understand their research/standards process - what made this the 'right' one?",
    probingHints: [
      "Where did you go for your research?",
      "Where did you end up finding it?",
      "How long did you spend looking?",
    ],
    keySignals: ["researched options", "read reviews", "compared features"],
    lightProbing: true,
    counterProfileExit: "It sounds like you really put thought into this — doing your research and finding exactly what works for you. That's a great way to shop!",
  },
  still_wanted: {
    subPath: "still_wanted",
    mode: "#deliberate-pause-tester",
    explorationGoal: "Validate their intentional pause - how long did they sit with it? Did the desire persist?",
    probingHints: [
      "How long was it on your radar?",
    ],
    keySignals: ["gave it time", "let the excitement pass", "still wanted it"],
    lightProbing: true,
    counterProfileExit: "That's a smart approach — giving yourself time to make sure it wasn't just a passing want. The fact that you still wanted it says something!",
  },
  got_around: {
    subPath: "got_around",
    mode: "#deliberate-low-priority",
    explorationGoal: "Understand what was creating the delay - friction, low priority, or just life?",
    probingHints: [
      "What finally made you do it?",
    ],
    keySignals: ["kept putting it off", "finally had time"],
    lightProbing: true,
    counterProfileExit: "Got it — sometimes things just take a while to bubble up the priority list. At least it's done now!",
  },
  other: {
    subPath: "other",
    // Open-ended branch: mode is determined by probing.
    mode: "",
    explorationGoal: "Open-ended: understand what they were waiting on when none of the fixed reasons fit",
    probingHints: [
      "What was the main thing you were waiting on?",
      "What changed that made it feel like the right time to buy?",
      "Was it more about budget, finding the right option, or just having the bandwidth?",
    ],
    keySignals: [],
    possibleModes: [
      "#deliberate-budget-saver",
      "#deliberate-deal-hunter",
      "#deliberate-researcher",
      "#deliberate-pause-tester",
      "#deliberate-low-priority",
    ],
    lightProbing: true,
  },
};

/**
 * Get exploration goal for a specific sub-path
 */
export function getSubPathExplorationGoal(path: string, subPath: string): SubPathExplorationGoal | undefined {
  if (path === "impulse") {
    return impulseSubPathGoals[subPath];
  } else if (path === "deal") {
    return dealSubPathGoals[subPath];
  } else if (path === "deliberate") {
    return deliberateSubPathGoals[subPath];
  }
  return undefined;
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
  "#intuitive-threshold-spender": {
    id: "#intuitive-threshold-spender",
    name: "Intuitive Threshold Spender",
    description: "Buys on impulse but has invisible price ceilings that act as automatic guardrails",
    indicators: [
      "saw it, wanted it, bought it",
      "the price felt right",
      "Clear mental threshold around price",
    ],
    reflectionGuidance: "Explore what your internal price thresholds are. Are they serving you well?",
  },
  "#reward-driven-spender": {
    id: "#reward-driven-spender",
    name: "Reward-Driven Spender",
    description: "Buys to celebrate wins or accomplishments - 'I earned this'",
    indicators: [
      "I hit my goal",
      "finished a hard week",
      "got a promotion",
    ],
    reflectionGuidance: "You work hard and deserve to celebrate. Consider if there are other ways to reward yourself too.",
  },
  "#comfort-driven-spender": {
    id: "#comfort-driven-spender",
    name: "Comfort-Driven Spender",
    description: "Buys to soothe stress, sadness, boredom - retail therapy",
    indicators: [
      "rough week",
      "felt down",
      "needed a pick-me-up",
    ],
    reflectionGuidance: "Explore alternative ways to meet emotional needs. Consider if purchases bring lasting satisfaction.",
  },
  "#routine-treat-spender": {
    id: "#routine-treat-spender",
    name: "Routine Treat Spender",
    description: "Regular self-treating as habit - not tied to specific trigger",
    indicators: [
      "I always do this on Fridays",
      "it's just my thing",
      "no specific reason",
    ],
    reflectionGuidance: "Consider if this routine is serving you well or if it's running on autopilot.",
  },
  "#visual-impulse-driven": {
    id: "#visual-impulse-driven",
    name: "Visual Impulse Driven",
    description: "Gets caught by things visually - either online or in physical stores",
    indicators: [
      "I was scrolling and saw it",
      "it was so pretty",
      "I loved the packaging",
    ],
    reflectionGuidance: "You have a good eye! Consider adding a cooling-off period for visual finds.",
  },
  "#trend-susceptibility-driven": {
    id: "#trend-susceptibility-driven",
    name: "Trend Susceptibility Driven",
    description: "Buys things because they're popular or trending",
    indicators: [
      "saw it on TikTok",
      "everyone's posting about it",
      "a creator I follow had it",
    ],
    reflectionGuidance: "Consider if the item fits YOUR style and life, not just the trend.",
  },
  "#scarcity-driven": {
    id: "#scarcity-driven",
    name: "Scarcity Driven",
    description: "Susceptible to FOMO and limited availability",
    indicators: [
      "limited edition",
      "selling out",
      "had to grab it before it was gone",
    ],
    reflectionGuidance: "Ask yourself: what would've actually happened if you missed it?",
  },
  "#deal-driven": {
    id: "#deal-driven",
    name: "Deal Driven",
    description: "Motivated by discounts and perceived savings",
    indicators: [
      "such a good deal",
      "couldn't pass up the savings",
    ],
    reflectionGuidance: "Calculate true savings by considering if you would have bought at full price.",
  },
  "#threshold-spending-driven": {
    id: "#threshold-spending-driven",
    name: "Threshold Spending Driven",
    description: "Adds items to hit shipping thresholds or get bonuses",
    indicators: [
      "free shipping threshold",
      "got a bonus",
    ],
    reflectionGuidance: "Consider if the 'free' thing actually cost you more than you realize.",
  },
  // Deliberate path modes (intentional - need light probing only)
  "#deliberate-budget-saver": {
    id: "#deliberate-budget-saver",
    name: "Deliberate Budget Saver",
    description: "Waited until they could afford it - intentional financial planning",
    indicators: [
      "saved up for it",
      "waited until I had the money",
      "budgeted for it",
    ],
    reflectionGuidance: "Great financial discipline! You planned for this purchase.",
  },
  "#deliberate-deal-hunter": {
    id: "#deliberate-deal-hunter",
    name: "Deliberate Deal Hunter",
    description: "Patiently tracked prices and waited for the right deal",
    indicators: [
      "waited for a sale",
      "tracked the price",
      "used a price alert",
    ],
    reflectionGuidance: "Smart shopping - you maximized value by being patient.",
  },
  "#deliberate-researcher": {
    id: "#deliberate-researcher",
    name: "Deliberate Researcher",
    description: "Did thorough research to find the right product",
    indicators: [
      "researched options",
      "read reviews",
      "compared features",
    ],
    reflectionGuidance: "Thoughtful approach - you made an informed decision.",
  },
  "#deliberate-pause-tester": {
    id: "#deliberate-pause-tester",
    name: "Deliberate Pause Tester",
    description: "Let the purchase sit to see if they still wanted it",
    indicators: [
      "gave it time",
      "let the excitement pass",
      "still wanted it",
    ],
    reflectionGuidance: "Great self-awareness - testing your desire before buying.",
  },
  "#deliberate-low-priority": {
    id: "#deliberate-low-priority",
    name: "Deliberate Low Priority",
    description: "Finally got around to a purchase that was on the back burner",
    indicators: [
      "kept putting it off",
      "finally had time",
      "was on my list for a while",
    ],
    reflectionGuidance: "Sometimes things just take a while to bubble up - that's okay.",
  },
};

// ═══════════════════════════════════════════════════════════════
// Helper Functions for Tests
// ═══════════════════════════════════════════════════════════════

/**
 * Map coffee motivation to mode (simple mapping for tests)
 */
export function getCoffeeModeFromMotivation(motivation: string): CoffeeMode | null {
  const modeMap: Record<string, CoffeeMode> = {
    routine: "#autopilot-routine",
    nearby: "#environment-triggered",
    pick_me_up: "#emotional-coping",
    focus: "#productivity-justification",
    treat: "#intentional-ritual",
    social: "#intentional-ritual", // Social coffee is intentional
  };
  return modeMap[motivation] || null;
}

/**
 * Get Fixed Question 2 options for a given category and path
 */
export function getFixedQuestion2Options(
  category: string,
  path: string
): QuickReplyOption[] | null {
  if (category === "shopping") {
    switch (path) {
      case "impulse":
        return Object.keys(impulseSubPathProbing).map((key) => ({
          id: key,
          label: key.replace(/_/g, " "),
          value: key,
          color: "yellow" as const,
        }));
      case "deliberate":
        return Object.keys(deliberateSubPathProbing).map((key) => ({
          id: key,
          label: key.replace(/_/g, " "),
          value: key,
          color: "white" as const,
        }));
      case "deal":
        return Object.keys(dealSubPathProbing).map((key) => ({
          id: key,
          label: key.replace(/_/g, " "),
          value: key,
          color: "yellow" as const,
        }));
      case "gift":
        return [
          { id: "family", label: "Family member", value: "family", color: "white" as const },
          { id: "friend", label: "Friend", value: "friend", color: "white" as const },
          { id: "partner", label: "Partner", value: "partner", color: "white" as const },
          { id: "coworker", label: "Coworker", value: "coworker", color: "white" as const },
        ];
      case "maintenance":
        return [
          { id: "same_thing", label: "Got the same thing", value: "same_thing", color: "white" as const },
          { id: "switched_up", label: "Switched it up", value: "switched_up", color: "white" as const },
          { id: "upgraded", label: "Upgraded", value: "upgraded", color: "white" as const },
        ];
      default:
        return null;
    }
  }
  return null;
}
