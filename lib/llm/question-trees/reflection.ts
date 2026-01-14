/**
 * Layer 3: Reflection Paths
 * Single source of truth for all reflection path data.
 */

import type { FixedQuestionResponse, ReflectionPathProbing, ReflectionPathType } from "./types";

// =============================================================================
// Reflection Options (UI)
// =============================================================================

export function getReflectionOptions(): FixedQuestionResponse {
  return {
    content: "Would you like to explore any of these?",
    options: [
      { id: "problem", label: "Is this a problem?", emoji: "🤔", value: "problem", color: "white" },
      { id: "feel", label: "How do I feel about this?", emoji: "💭", value: "feel", color: "white" },
      { id: "worth", label: "Is this a good use of money?", emoji: "💰", value: "worth", color: "white" },
      { id: "different", label: "I have a different question", emoji: "❓", value: "different", color: "white" },
      { id: "done", label: "I'm good for now", emoji: "✅", value: "done", color: "white" },
    ],
  };
}

export interface ReflectionPathOption {
  id: string;
  label: string;
  emoji: string;
  type: "behavioral_excavation" | "emotional_reflection" | "cost_comparison" | "open_ended" | "exit";
}

export const REFLECTION_PATHS: Record<string, ReflectionPathOption> = {
  problem: { id: "problem", label: "Is this a problem?", emoji: "🤔", type: "behavioral_excavation" },
  feel: { id: "feel", label: "How do I feel about this?", emoji: "💭", type: "emotional_reflection" },
  worth: { id: "worth", label: "Is this a good use of money?", emoji: "💰", type: "cost_comparison" },
  different: { id: "different", label: "I have a different question", emoji: "❓", type: "open_ended" },
  done: { id: "done", label: "I'm good for now", emoji: "✅", type: "exit" },
};

// =============================================================================
// Reflection Path Probing Data (Structured)
// =============================================================================

/**
 * "Is this a problem?" - Behavioral Excavation
 * Surfaces how often autopilot behavior kicks in and whether they use what they buy.
 */
export const BEHAVIORAL_EXCAVATION: ReflectionPathProbing = {
  path: "problem",
  explorationGoal: "Surface how often autopilot behavior kicks in, and whether the user is actually using what they buy or it's piling up.",
  entryQuestions: {
    // Impulse - Price
    "#intuitive-threshold-spender": "can you think of another time you bought something just because the price felt right?",
    // Impulse - Reward/Comfort
    "#reward-driven-spender": "can you think of another time you bought something to celebrate or reward yourself?",
    "#comfort-driven-spender": "can you think of another time you shopped because you were stressed or needed a pick-me-up?",
    "#routine-treat-spender": "can you think of another time you treated yourself as part of your regular routine?",
    // Impulse - Visual
    "#scroll-triggered": "can you think of another time something just caught your eye while scrolling and you went for it?",
    "#in-store-wanderer": "can you think of another time something just caught your eye in a store and you went for it?",
    "#aesthetic-driven": "can you think of another time something visually appealing made you want to buy it?",
    "#duplicate-collector": "can you think of another time you bought something similar to things you already have?",
    "#exploration-hobbyist": "can you think of another time you bought something just to try something new?",
    // Impulse - Trend
    "#social-media-influenced": "can you think of another time you bought something because everyone seemed to have it?",
    "#friend-peer-influenced": "can you think of another time you bought something because a friend had it or recommended it?",
    // Deal/Scarcity
    "#scarcity-driven": "can you think of another time you bought something because it was running out or limited?",
    "#deal-driven": "can you think of another time a sale or deal made you go for something?",
    "#threshold-spending-driven": "can you think of another time you added stuff to hit free shipping or get a bonus?",
    // Fallback
    "default": "can you think of another time you made a similar purchase?",
  },
  probingHints: [
    "does this feel like something that happens a lot, sometimes, or rarely?",
    "what usually happens with the stuff that slides through — do you end up using it?",
    "does that sit okay with you or is there something about it that bugs you?",
    "if it doesn't feel great, what do you think is behind that?",
    "you said it bugs you but it keeps happening — what do you think gets in the way?",
  ],
  evaluationContext: {
    // Impulse - Price
    "#intuitive-threshold-spender": "buying things when the price feels right",
    // Impulse - Reward/Comfort
    "#reward-driven-spender": "treating yourself after accomplishments",
    "#comfort-driven-spender": "shopping when you're stressed",
    "#routine-treat-spender": "treating yourself regularly",
    // Impulse - Visual
    "#scroll-triggered": "buying things you saw while scrolling",
    "#in-store-wanderer": "buying things that catch your eye in stores",
    "#aesthetic-driven": "buying things because they look appealing",
    "#duplicate-collector": "buying things similar to what you already have",
    "#exploration-hobbyist": "buying things to try something new",
    // Impulse - Trend
    "#social-media-influenced": "buying things you saw on social media",
    "#friend-peer-influenced": "buying things friends recommended",
    // Deal/Scarcity
    "#scarcity-driven": "buying things because they're limited",
    "#deal-driven": "buying things because of deals",
    "#threshold-spending-driven": "adding items to hit thresholds",
  },
};

/**
 * "How do I feel about this?" - Emotional Reflection
 * Surfaces gut reactions and helps the user name their feelings.
 */
export const EMOTIONAL_REFLECTION: ReflectionPathProbing = {
  path: "feel",
  explorationGoal: "Surface the gut reaction to this spending and help the user name why they feel any tension.",
  entryQuestions: {
    // Entry is transaction-based: "you spent ${amount} at ${merchant} — how does that land for you?"
    // Mode adaptation happens via evaluationContext
    "default": "how does that land for you?",
  },
  probingHints: [
    "is it more of a 'meh' or does it actually bother you?",
    "if you had to name what you're feeling, what would it be?",
    "what is it about this that's creating the tension?",
    "is it the amount, the frequency, or something else?",
    "does this feel like it lines up with how you want to spend?",
  ],
  evaluationContext: {
    // Impulse - Price
    "#intuitive-threshold-spender": "buying things because the price felt right",
    // Impulse - Reward/Comfort
    "#reward-driven-spender": "spending to celebrate or reward yourself",
    "#comfort-driven-spender": "spending money shopping because you're stressed",
    "#routine-treat-spender": "spending money on these regular treats",
    // Impulse - Visual
    "#scroll-triggered": "buying things you saw while scrolling",
    "#in-store-wanderer": "buying things that caught your eye in a store",
    "#aesthetic-driven": "buying things just because they caught your eye",
    "#duplicate-collector": "buying things similar to what you already own",
    "#exploration-hobbyist": "buying things just to try something new",
    // Impulse - Trend
    "#social-media-influenced": "buying things because you saw them on social media",
    "#friend-peer-influenced": "buying things because friends had them or recommended them",
    // Deal/Scarcity
    "#scarcity-driven": "buying things because they're limited or running out",
    "#deal-driven": "buying things because they were on sale",
    "#threshold-spending-driven": "adding items to hit free shipping or get a bonus",
  },
};

/**
 * "Is this a good use of money?" - Cost Comparison
 * Makes abstract spending concrete through comparisons.
 */
export const COST_COMPARISON: ReflectionPathProbing = {
  path: "worth",
  explorationGoal: "Make abstract spending concrete through comparisons. Surface opportunity cost by showing what else the money could have been.",
  entryQuestions: {
    // Entry uses comparison framing: "${amount} is equivalent to {comparison}. Which feels like a better use?"
    "default": "which one feels like a better use of money?",
  },
  probingHints: [
    "is this something you'll get a lot of use out of?",
    "if you had to spend that ${price} again, would you?",
    "if you use this {x_times}, that's about ${y_per_use} per use — does that feel worth it?",
  ],
  evaluationContext: {
    // Impulse - Price
    "#intuitive-threshold-spender": "buying things when the price felt right",
    // Impulse - Reward/Comfort
    "#reward-driven-spender": "rewarding yourself",
    "#comfort-driven-spender": "shopping to feel better",
    "#routine-treat-spender": "these regular treats",
    // Impulse - Visual
    "#scroll-triggered": "things you bought while scrolling",
    "#in-store-wanderer": "things you grabbed in-store",
    "#aesthetic-driven": "things you bought because they looked good",
    "#duplicate-collector": "similar items you already have",
    "#exploration-hobbyist": "trying something new",
    // Impulse - Trend
    "#social-media-influenced": "things you saw on social media",
    "#friend-peer-influenced": "things friends recommended",
    // Deal/Scarcity
    "#scarcity-driven": "buying limited items",
    "#deal-driven": "buying because of the deal",
    "#threshold-spending-driven": "adding extra items to hit free shipping",
  },
};

/**
 * "I have a different question" - Open-Ended
 * User-directed exploration.
 */
export const OPEN_ENDED: ReflectionPathProbing = {
  path: "different",
  explorationGoal: "User-directed exploration. Meet them where they are.",
  entryQuestions: {
    "default": "what's on your mind?",
  },
  probingHints: [
    `start with: "what's on your mind?" or "what are you curious about?"`,
    "if they ask about frequency/patterns → pivot to Behavioral Excavation style questions",
    "if they express feelings/tension → pivot to Emotional Reflection style questions",
    "if they ask about value/worth/regret → pivot to Cost Comparison style questions",
    "if it's novel → answer briefly and offer to continue",
  ],
};

// =============================================================================
// Lookup Functions
// =============================================================================

const REFLECTION_PATH_DATA: Record<ReflectionPathType, ReflectionPathProbing> = {
  problem: BEHAVIORAL_EXCAVATION,
  feel: EMOTIONAL_REFLECTION,
  worth: COST_COMPARISON,
  different: OPEN_ENDED,
};

/**
 * Get the reflection path probing data for a given path and mode.
 */
export function getReflectionPathProbing(
  path: ReflectionPathType,
  mode?: string
): { probing: ReflectionPathProbing; entryQuestion: string; evaluationPhrase?: string } {
  const probing = REFLECTION_PATH_DATA[path];
  const entryQuestion = mode && probing.entryQuestions[mode]
    ? probing.entryQuestions[mode]
    : probing.entryQuestions["default"];
  const evaluationPhrase = mode && probing.evaluationContext?.[mode]
    ? probing.evaluationContext[mode]
    : undefined;

  return { probing, entryQuestion, evaluationPhrase };
}

/**
 * Get comparison example based on price tier (for cost comparison path).
 */
export function getComparisonExample(amount: number): string {
  if (amount < 20) return "a nice lunch out";
  if (amount < 50) return "a month of a streaming service";
  if (amount < 100) return "a nice dinner for two";
  if (amount < 200) return "a weekend getaway fund contribution";
  if (amount < 500) return "a plane ticket";
  return "a month of savings towards a bigger goal";
}

/**
 * Mode-aware question adaptation for Cost Comparison.
 */
export function getCostComparisonModeAdaptedQuestion(mode: string, amount: number): string | undefined {
  if (mode === "#threshold-spending-driven")
    return `Was adding those extra items to hit free shipping worth the $${amount.toFixed(2)} you spent?`;
  if (mode === "#scarcity-driven")
    return `If that limited drop came back, would you buy it again at $${amount.toFixed(2)}?`;
  if (mode === "#reward-driven-spender")
    return "Is this reward something you'll get a lot of use out of?";
  return undefined;
}

// =============================================================================
// Graceful Exit
// =============================================================================

export const GRACEFUL_EXIT_MESSAGES = [
  "got it — thanks for walking through this with me.",
  "cool, we can always pick this up later if something comes up.",
] as const;

export const MODE_AWARE_EXIT_MESSAGE =
  "i'll keep an eye on this pattern and check in if i notice it happening again.";

export function getGracefulExitMessage(hasAssignedMode: boolean): string {
  const base = GRACEFUL_EXIT_MESSAGES[0];
  if (!hasAssignedMode) return base;
  return `${base} ${MODE_AWARE_EXIT_MESSAGE}`;
}

// =============================================================================
// Closing Summary Builder
// =============================================================================

export type EvaluationOutcome = "comfortable" | "concerned" | "mixed" | "neutral";

const MODE_BEHAVIOR_PHRASES: Record<string, string> = {
  "#intuitive-threshold-spender": "buy things when the price feels right",
  "#reward-driven-spender": "treat yourself after accomplishments",
  "#comfort-driven-spender": "shop when you're stressed or need a pick-me-up",
  "#routine-treat-spender": "treat yourself as part of your regular routine",
  "#scroll-triggered": "buy things that catch your eye while scrolling",
  "#in-store-wanderer": "buy things that catch your eye in stores",
  "#aesthetic-driven": "get drawn to things that look appealing",
  "#duplicate-collector": "collect similar items",
  "#social-media-influenced": "buy things you see on social media",
  "#friend-peer-influenced": "buy things friends recommend",
  "#scarcity-driven": "buy things because they're limited",
  "#deal-driven": "go for things when there's a deal",
  "#threshold-spending-driven": "add items to hit free shipping or bonuses",
};

const EVALUATION_PHRASES: Record<EvaluationOutcome, string> = {
  comfortable: "you're comfortable with how this fits into your life",
  concerned: "there's something about this pattern that's bothering you",
  mixed: "you have mixed feelings about it",
  neutral: "you're still figuring out how you feel about it",
};

/**
 * Build a closing summary that combines mode + reflection path + evaluation.
 */
export function buildClosingSummary(
  mode: string | undefined,
  reflectionPath: ReflectionPathType,
  evaluation: EvaluationOutcome
): string {
  const modeBehavior = mode ? MODE_BEHAVIOR_PHRASES[mode] : undefined;
  const evalPhrase = EVALUATION_PHRASES[evaluation];

  if (modeBehavior) {
    return `sounds like you tend to ${modeBehavior}. based on our chat, ${evalPhrase}. thanks for exploring this with me.`;
  }

  return `based on our chat, ${evalPhrase}. thanks for exploring this with me.`;
}

// =============================================================================
// Legacy Exports (for backwards compatibility during migration)
// =============================================================================

// These will be removed after layer3-reflection.ts is refactored
export const BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS = BEHAVIORAL_EXCAVATION.entryQuestions;
export const EMOTIONAL_REFLECTION_CONTEXT = EMOTIONAL_REFLECTION.evaluationContext;
export const COST_COMPARISON_CONTEXT = COST_COMPARISON.evaluationContext;
export const BEHAVIORAL_EXCAVATION_PROBING_HINTS = BEHAVIORAL_EXCAVATION.probingHints;
export const EMOTIONAL_REFLECTION_PROBING_HINTS = EMOTIONAL_REFLECTION.probingHints;
export const COST_COMPARISON_PROBING_HINTS = COST_COMPARISON.probingHints;
export const OPEN_ENDED_REFLECTION_GUIDANCE = OPEN_ENDED.probingHints;
