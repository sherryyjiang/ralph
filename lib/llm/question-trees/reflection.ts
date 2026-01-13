/**
 * Layer 3: Reflection Options
 */

import { FixedQuestionResponse } from "./types";

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

export interface ReflectionPath {
  id: string;
  label: string;
  emoji: string;
  type: "behavioral_excavation" | "emotional_reflection" | "cost_comparison" | "open_ended" | "exit";
}

export const REFLECTION_PATHS: Record<string, ReflectionPath> = {
  problem: { id: "problem", label: "Is this a problem?", emoji: "🤔", type: "behavioral_excavation" },
  feel: { id: "feel", label: "How do I feel about this?", emoji: "💭", type: "emotional_reflection" },
  worth: { id: "worth", label: "Is this a good use of money?", emoji: "💰", type: "cost_comparison" },
  different: { id: "different", label: "I have a different question", emoji: "❓", type: "open_ended" },
  done: { id: "done", label: "I'm good for now", emoji: "✅", type: "exit" },
};

export const BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS: Record<string, string> = {
  "#intuitive-threshold-spender": "can you think of another time you bought something just because the price felt right?",
  "#reward-driven-spender": "can you think of another time you bought something to celebrate or reward yourself?",
  "#comfort-driven-spender": "can you think of another time you shopped because you were stressed or needed a pick-me-up?",
  "#routine-treat-spender": "can you think of another time you treated yourself as part of your regular routine?",
  "#scroll-triggered": "can you think of another time something just caught your eye and you went for it?",
  "#social-media-influenced": "can you think of another time you bought something because everyone seemed to have it?",
  "#scarcity-driven": "can you think of another time you bought something because it was running out or limited?",
  "#deal-driven": "can you think of another time a sale or deal made you go for something?",
  "#threshold-spending-driven": "can you think of another time you added stuff to hit free shipping or get a bonus?",
};

export const EMOTIONAL_REFLECTION_CONTEXT: Record<string, string> = {
  "#comfort-driven-spender": "spending money shopping because you are stressed",
  "#routine-treat-spender": "spending money on these regular treats",
  "#aesthetic-driven": "buying things just because they caught your eye",
  "#deal-driven": "buying things because they were on sale",
  "#scarcity-driven": "buying things because they are limited or running out",
};

export const COST_COMPARISON_CONTEXT: Record<string, string> = {
  "#threshold-spending-driven": "adding extra items to hit free shipping",
  "#scarcity-driven": "buying limited items",
  "#reward-driven-spender": "rewarding yourself",
};

/**
 * Layer 3 probing hints (per docs/question-trees/shopping-check-in.md)
 *
 * These are intentionally stored as concrete question strings so prompts can
 * enforce "specific questions only" in reflection paths just like Layer 2.
 */
export const BEHAVIORAL_EXCAVATION_PROBING_HINTS = [
  "does this feel like something that happens a lot, sometimes, or rarely?",
  "what usually happens with the stuff that slides through — do you end up using it?",
  "does that sit okay with you or is there something about it that bugs you?",
  "if it doesn't feel great, what do you think is behind that?",
  "you said it bugs you but it keeps happening — what do you think gets in the way?",
  // Context hooks (placeholders are filled in by the prompt builder)
  "does this happen more at {merchant} specifically?",
  "is this usually a {day_of_week} thing?",
];

export const EMOTIONAL_REFLECTION_PROBING_HINTS = [
  "is it more of a 'meh' or does it actually bother you?",
  "if you had to name what you're feeling, what would it be?",
  "what is it about this that's creating the tension?",
  "is it the amount, the frequency, or something else?",
  "does this feel like it lines up with how you want to spend?",
];

export const COST_COMPARISON_PROBING_HINTS = [
  "is this something you'll get a lot of use out of?",
  "if you had to spend that ${price} again, would you?",
  "if you use this {x_times}, that's about ${y_per_use} per use — does that feel worth it?",
];

export const OPEN_ENDED_REFLECTION_GUIDANCE = [
  `start with: "what's on your mind?" or "what are you curious about?"`,
  "if they ask about frequency/patterns → pivot to Behavioral Excavation style questions",
  "if they express feelings/tension → pivot to Emotional Reflection style questions",
  "if they ask about value/worth/regret → pivot to Cost Comparison style questions",
  "if it's novel → answer briefly and offer to continue",
];

/**
 * Mode-aware question adaptation for Cost Comparison ("Is this a good use of money?")
 *
 * Spec source: docs/question-trees/shopping-check-in.md
 *
 * Note: V1 only has the transaction total (no cart breakdown), so for threshold spending we
 * use the full transaction amount as the best available stand-in for "${X}".
 */
export function getCostComparisonModeAdaptedQuestion(mode: string, amount: number): string | undefined {
  if (mode === "#threshold-spending-driven")
    return `Was adding those extra items to hit free shipping worth the $${amount.toFixed(2)} you spent?`;

  if (mode === "#scarcity-driven")
    return `If that limited drop came back, would you buy it again at $${amount.toFixed(2)}?`;

  if (mode === "#reward-driven-spender") return "Is this reward something you'll get a lot of use out of?";

  return undefined;
}

/**
 * Spec source: docs/question-trees/shopping-check-in.md ("I'm good for now" exit path)
 */
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


