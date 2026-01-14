/**
 * Shopping Check-In Question Trees - handles shopping check-in flow
 */

import type { QuickReplyOption, ShoppingPath } from "@/lib/types";
import { FixedQuestionResponse, ExplorationGoal, SubPathProbing, SubPathExplorationGoal } from "./types";

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

export function getShoppingFixedQuestion1(
  transaction: { merchant: string; amount: number }
): FixedQuestionResponse {
  return {
    content: "Hey! I noticed you spent $" + transaction.amount.toFixed(2) + " at " + transaction.merchant + ". When you bought this, were you...",
    options: [
      { id: "impulse", label: "Saw it and bought it", emoji: "lightning", value: "impulse", color: "yellow" },
      { id: "deliberate", label: "Been thinking about this", emoji: "target", value: "deliberate", color: "white" },
      { id: "deal", label: "Good deal made me go for it", emoji: "tag", value: "deal", color: "yellow" },
      { id: "gift", label: "Bought for someone else", emoji: "gift", value: "gift", color: "white" },
      { id: "maintenance", label: "Restocking / replacing", emoji: "refresh", value: "maintenance", color: "white" },
      { id: "other", label: "Other/Custom", emoji: "memo", value: "other", color: "white" },
    ],
  };
}

export const shoppingExplorationGoals: Record<string, ExplorationGoal> = {
  impulse: {
    path: "impulse",
    goal: "Understand what emotional or environmental triggers led to the spontaneous purchase",
    // NOTE: probingHints are defined at the subpath level (impulseSubPathProbing)
    modeIndicators: {
      "#price-sensitivity-driven": ["mentions the price felt right"],
      "#self-reward-driven": ["frames it as a treat or reward"],
      "#visual-impulse-driven": ["says it caught my eye"],
      "#trend-susceptibility-driven": ["mentions it was trending"],
    },
    counterProfilePatterns: ["Actually had this on my list for a while"],
  },
  deliberate: {
    path: "deliberate",
    goal: "Validate the intentionality and explore satisfaction with the decision process",
    // NOTE: probingHints are defined at the subpath level (deliberateSubPathProbing)
    // Exploration TAGS (not modes): categorize intentional purchase drivers.
    modeIndicators: {
      "#deliberate-purchase": [
        "describes planning, waiting, or intentionally deciding over time",
        "mentions comparing options, reading reviews, or doing research",
      ],
      "#value-standards-driven": [
        "mentions durability, quality, or having standards for the 'right one'",
        "talks about long-term value (cost-per-use, investment piece)",
      ],
    },
    counterProfilePatterns: [],
  },
  deal: {
    path: "deal",
    goal: "Distinguish between genuine value and deal-induced impulse buying",
    // NOTE: probingHints are defined at the subpath level (dealSubPathProbing)
    modeIndicators: {
      "#scarcity-driven": ["mentions limited drop"],
      "#deal-driven": ["focuses on discount amount"],
      "#threshold-spending-driven": ["mentions free shipping thresholds"],
    },
    counterProfilePatterns: ["I was already planning to buy this", "I would have bought it anyway"],
  },
  gift: {
    path: "gift",
    goal: "Explore gift-giving patterns",
    // NOTE: probingHints are defined at the subpath level (giftSubPathProbing)
    modeIndicators: {},
    counterProfilePatterns: [],
  },
  maintenance: {
    path: "maintenance",
    goal: "Verify true necessity",
    // NOTE: probingHints are defined at the subpath level (maintenanceSubPathProbing)
    modeIndicators: {},
    counterProfilePatterns: [],
  },
};

export const impulseSubPathProbing: Record<string, SubPathProbing> = {
  price_felt_right: {
    subPath: "price_felt_right",
    explorationTag: "#price-sensitivity-driven",
    explorationGoal: "Understand their internal price threshold",
    probingHints: [
      "What price did you get it for?",
      "What price would've made you pause?",
      "Do things under $X usually feel like a no-brainer for you?",
    ],
    targetModes: ["#intuitive-threshold-spender"],
    modeSignals: { "#intuitive-threshold-spender": ["saw it, wanted it, bought it"] },
  },
  treating_myself: {
    subPath: "treating_myself",
    explorationTag: "#self-reward-driven",
    explorationGoal: "What triggered the need for reward/treat?",
    probingHints: [
      "What were you treating yourself for?",
      "Was it tied to something or more of a random mood?",
      "Do you just enjoy shopping as a fun activity?",
    ],
    targetModes: ["#reward-driven-spender", "#comfort-driven-spender", "#routine-treat-spender"],
    modeSignals: {
      "#reward-driven-spender": ["I hit my goal"],
      "#comfort-driven-spender": ["rough week", "felt down"],
      "#routine-treat-spender": ["I always do this on Fridays"],
    },
  },
  caught_eye: {
    subPath: "caught_eye",
    explorationTag: "#visual-impulse-driven",
    explorationGoal: "Where/how did they encounter it?",
    probingHints: [
      "What caught your eye about it?",
      "Is this similar to things you already own?",
      "Is trying new stuff kind of the fun part for you?",
    ],
    targetModes: ["#scroll-triggered", "#in-store-wanderer", "#aesthetic-driven", "#duplicate-collector"],
    modeSignals: {
      "#scroll-triggered": ["I was scrolling and saw it"],
      "#in-store-wanderer": ["I was just walking by"],
      "#aesthetic-driven": ["it was so pretty"],
      "#duplicate-collector": ["I have like 5 of these already"],
    },
  },
  trending: {
    subPath: "trending",
    explorationTag: "#trend-susceptibility-driven",
    explorationGoal: "How susceptible are they to trends?",
    probingHints: [
      "Where have you been seeing it?",
      "Do you feel like it's you or more of a trend buy?",
    ],
    targetModes: ["#social-media-influenced", "#friend-peer-influenced"],
    modeSignals: {
      "#social-media-influenced": ["I saw it on TikTok"],
      "#friend-peer-influenced": ["my friend got one"],
    },
    counterProfileExit: "If user confirms it is them, exit gracefully",
  },
  other: {
    subPath: "other",
    explorationGoal: "Open-ended: understand what drove the impulse",
    probingHints: ["What made you want it right then?"],
    targetModes: ["#intuitive-threshold-spender", "#reward-driven-spender"],
    modeSignals: {},
  },
};

export const deliberateSubPathProbing: Record<string, SubPathProbing> = {
  afford_it: {
    subPath: "afford_it",
    explorationGoal: "Were they saving toward a goal?",
    probingHints: ["What changed that made it feel okay to buy?"],
    targetModes: ["#deliberate-budget-saver"],
    modeSignals: { "#deliberate-budget-saver": ["saved up for it"] },
    lightProbing: true,
  },
  right_price: {
    subPath: "right_price",
    explorationGoal: "Understand their deal-seeking patience",
    probingHints: ["What deal did you find?"],
    targetModes: ["#deliberate-deal-hunter"],
    modeSignals: { "#deliberate-deal-hunter": ["tracked the price"] },
    lightProbing: true,
  },
  right_one: {
    subPath: "right_one",
    explorationGoal: "Understand their research process",
    probingHints: ["Where did you go for your research?"],
    targetModes: ["#deliberate-researcher"],
    modeSignals: { "#deliberate-researcher": ["did my research"] },
    lightProbing: true,
  },
  still_wanted: {
    subPath: "still_wanted",
    explorationGoal: "Validate their intentional pause",
    probingHints: ["How long was it on your radar?"],
    targetModes: ["#deliberate-pause-tester"],
    modeSignals: { "#deliberate-pause-tester": ["sat on it for a while"] },
    lightProbing: true,
  },
  got_around: {
    subPath: "got_around",
    explorationGoal: "Understand what was creating the delay",
    probingHints: ["What finally made you do it?"],
    targetModes: ["#deliberate-low-priority"],
    modeSignals: { "#deliberate-low-priority": ["just got around to it"] },
    lightProbing: true,
  },
  other: {
    subPath: "other",
    explorationGoal: "Open-ended: understand what they were waiting on",
    probingHints: ["What was the main thing you were waiting on?"],
    targetModes: ["#deliberate-budget-saver", "#deliberate-deal-hunter", "#deliberate-researcher"],
    modeSignals: {},
    lightProbing: true,
  },
};

export const dealSubPathProbing: Record<string, SubPathProbing> = {
  limited_edition: {
    subPath: "limited_edition",
    explorationGoal: "Susceptibility to FOMO",
    probingHints: [
      "Tell me more about the limited edition event or drop",
      "Would you have bought it if it wasn't running out?",
      "First one or adding to the collection?",
      "What would've happened if you missed it?",
    ],
    targetModes: ["#scarcity-driven"],
    modeSignals: { "#scarcity-driven": ["did not want to miss it", "FOMO"] },
  },
  sale_discount: {
    subPath: "sale_discount",
    explorationGoal: "Do they buy things they already wanted at a better price?",
    probingHints: [
      "Tell me more about the sale, deal or discount",
      "What amount made it feel like the deal was worth it?",
      "Were you already looking for this or the deal caught your eye?",
      "Would you have bought it at full price?",
    ],
    targetModes: ["#deal-driven"],
    modeSignals: { "#deal-driven": ["could not pass up the deal"] },
    counterProfileExit: "If they would have bought at full price, exit gracefully",
  },
  free_shipping: {
    subPath: "free_shipping",
    explorationGoal: "Did they add items just to hit the threshold?",
    probingHints: [
      "Was this online or in-store?",
      "Did you add any items to the cart that you didn't originally intend to buy?",
      "Would you have bought just the original item without the bonus?",
      "Was it worth what you added?",
    ],
    targetModes: ["#threshold-spending-driven"],
    modeSignals: { "#threshold-spending-driven": ["added something to get free shipping"] },
    counterProfileExit: "If they were already over the threshold, exit gracefully",
  },
};

export const giftSubPathProbing: Record<string, SubPathProbing> = {
  family: {
    subPath: "family",
    explorationGoal: "Light exploration of gift-giving",
    probingHints: ["Special occasion?"],
    targetModes: ["#gift-giver"],
    modeSignals: {},
    lightProbing: true,
  },
  friend: {
    subPath: "friend",
    explorationGoal: "Light exploration of gift-giving",
    probingHints: ["Special occasion?"],
    targetModes: ["#gift-giver"],
    modeSignals: {},
    lightProbing: true,
  },
  partner: {
    subPath: "partner",
    explorationGoal: "Light exploration of gift-giving",
    probingHints: ["Special occasion?"],
    targetModes: ["#gift-giver"],
    modeSignals: {},
    lightProbing: true,
  },
  coworker: {
    subPath: "coworker",
    explorationGoal: "Light exploration of gift-giving",
    probingHints: ["Special occasion?"],
    targetModes: ["#gift-giver"],
    modeSignals: {},
    lightProbing: true,
  },
};

export const maintenanceSubPathProbing: Record<string, SubPathProbing> = {
  same_thing: {
    subPath: "same_thing",
    explorationGoal: "Validate loyalty",
    probingHints: ["How long have you been using that?"],
    targetModes: ["#loyal-repurchaser"],
    modeSignals: { "#loyal-repurchaser": ["it works"] },
    lightProbing: true,
  },
  switched_up: {
    subPath: "switched_up",
    explorationGoal: "Understand the switch",
    probingHints: ["What made you switch?"],
    targetModes: ["#brand-switcher"],
    modeSignals: { "#brand-switcher": ["wanted to try something new"] },
    lightProbing: true,
  },
  upgraded: {
    subPath: "upgraded",
    explorationGoal: "Understand upgrade motivation",
    probingHints: ["What made you want to upgrade?"],
    targetModes: ["#upgrader"],
    modeSignals: { "#upgrader": ["wanted something better"] },
    lightProbing: true,
  },
};

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

export const impulseSubPathGoals: Record<string, SubPathExplorationGoal> = {
  price_felt_right: {
    subPath: "price_felt_right",
    mode: "#intuitive-threshold-spender",
    explorationGoal: "Understand their price threshold",
    probingHints: [
      "What price did you get it for?",
      "What price would've made you pause?",
      "Do things under $X usually feel like a no-brainer for you?",
    ],
    keySignals: ["saw it, wanted it, bought it"],
  },
  treating_myself: {
    subPath: "treating_myself",
    mode: "",
    explorationGoal: "What triggered the reward?",
    probingHints: [
      "What were you treating yourself for?",
      "Was it tied to something or more of a random mood?",
      "Do you just enjoy shopping as a fun activity?",
    ],
    keySignals: [],
    possibleModes: ["#reward-driven-spender", "#comfort-driven-spender", "#routine-treat-spender"],
  },
  caught_eye: {
    subPath: "caught_eye",
    mode: "",
    explorationGoal: "Where/how did they encounter it?",
    probingHints: [
      "What caught your eye about it?",
      "Is this similar to things you already own?",
      "Is trying new stuff kind of the fun part for you?",
    ],
    keySignals: ["I was scrolling and saw it"],
    possibleModes: ["#scroll-triggered", "#in-store-wanderer", "#aesthetic-driven", "#duplicate-collector"],
  },
  trending: {
    subPath: "trending",
    mode: "",
    explorationGoal: "How susceptible to trends?",
    probingHints: [
      "Where have you been seeing it?",
      "Do you feel like it's you or more of a trend buy?",
    ],
    keySignals: ["I saw it on TikTok"],
    possibleModes: ["#social-media-influenced", "#friend-peer-influenced"],
  },
  other: {
    subPath: "other",
    mode: "",
    explorationGoal: "Open-ended",
    probingHints: ["What made you want it?"],
    keySignals: [],
    possibleModes: ["#intuitive-threshold-spender", "#reward-driven-spender", "#comfort-driven-spender"],
  },
};

export const dealSubPathGoals: Record<string, SubPathExplorationGoal> = {
  limited_edition: {
    subPath: "limited_edition",
    mode: "#scarcity-driven",
    explorationGoal: "FOMO susceptibility",
    probingHints: [
      "Tell me more about the limited edition event or drop",
      "Would you have bought it if it wasn't running out?",
      "First one or adding to the collection?",
      "What would've happened if you missed it?",
    ],
    keySignals: ["it was selling out"],
  },
  sale_discount: {
    subPath: "sale_discount",
    mode: "#deal-driven",
    explorationGoal: "Do they buy at better price?",
    probingHints: [
      "Tell me more about the sale, deal or discount",
      "What amount made it feel like the deal was worth it?",
      "Were you already looking for this or the deal caught your eye?",
      "Would you have bought it at full price?",
    ],
    keySignals: ["it was such a good deal"],
  },
  free_shipping: {
    subPath: "free_shipping",
    mode: "#threshold-spending-driven",
    explorationGoal: "Did they add items?",
    probingHints: [
      "Was this online or in-store?",
      "Did you add any items to the cart that you didn't originally intend to buy?",
      "Would you have bought just the original item without the bonus?",
      "Was it worth what you added?",
    ],
    keySignals: ["hit the free shipping threshold"],
  },
};

export const deliberateSubPathGoals: Record<string, SubPathExplorationGoal> = {
  afford_it: {
    subPath: "afford_it",
    mode: "#deliberate-budget-saver",
    explorationGoal: "Were they saving?",
    probingHints: ["What changed?"],
    keySignals: ["saved up for it"],
    lightProbing: true,
    counterProfileExit: "That is really thoughtful.",
  },
  right_price: {
    subPath: "right_price",
    mode: "#deliberate-deal-hunter",
    explorationGoal: "Understand deal-seeking",
    probingHints: ["What deal?"],
    keySignals: ["waited for a sale"],
    lightProbing: true,
    counterProfileExit: "Nice! Being patient pays off.",
  },
  right_one: {
    subPath: "right_one",
    mode: "#deliberate-researcher",
    explorationGoal: "Understand research process",
    probingHints: ["Where did you research?"],
    keySignals: ["researched options"],
    lightProbing: true,
    counterProfileExit: "Great way to shop!",
  },
  still_wanted: {
    subPath: "still_wanted",
    mode: "#deliberate-pause-tester",
    explorationGoal: "Validate pause",
    probingHints: ["How long on your radar?"],
    keySignals: ["gave it time"],
    lightProbing: true,
    counterProfileExit: "Smart approach.",
  },
  got_around: {
    subPath: "got_around",
    mode: "#deliberate-low-priority",
    explorationGoal: "Understand delay",
    probingHints: ["What finally made you do it?"],
    keySignals: ["kept putting it off"],
    lightProbing: true,
    counterProfileExit: "Sometimes things take a while.",
  },
  other: {
    subPath: "other",
    mode: "",
    explorationGoal: "Open-ended",
    probingHints: ["What were you waiting on?"],
    keySignals: [],
    possibleModes: ["#deliberate-budget-saver", "#deliberate-deal-hunter", "#deliberate-researcher"],
    lightProbing: true,
  },
};

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

export function getFixedQuestion2Options(category: string, path: string): QuickReplyOption[] | null {
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
        return [...new Set([...Object.keys(deliberateSubPathProbing), "other"])].map((key) => ({
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
          { id: "family", label: "Family", value: "family", color: "white" as const },
          { id: "friend", label: "Friend", value: "friend", color: "white" as const },
          { id: "partner", label: "Partner", value: "partner", color: "white" as const },
          { id: "coworker", label: "Coworker", value: "coworker", color: "white" as const },
          { id: "other", label: "Someone else", value: "other", color: "white" as const },
        ];

      case "maintenance":
        return [
          { id: "same_thing", label: "Same thing as before", value: "same_thing", color: "white" as const },
          { id: "switched_up", label: "Switched it up", value: "switched_up", color: "white" as const },
          { id: "upgraded", label: "Upgraded", value: "upgraded", color: "white" as const },
        ];

      default:
        return null;
    }
  }
  return null;
}
