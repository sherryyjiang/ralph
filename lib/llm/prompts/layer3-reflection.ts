/**
 * Layer 3 Reflection Prompts
 * 
 * Prompts for the reflection phase (Is this a problem?, How do I feel?, etc.)
 */

import type { TransactionCategory } from "@/lib/types";
import { getCostComparisonModeAdaptedQuestion } from "../question-trees";

// =============================================================================
// Mode-Based Entry Questions for Behavioral Excavation
// =============================================================================

const BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS: Record<string, string> = {
  "#intuitive-threshold-spender": "can you think of another time you bought something just because the price felt right?",
  "#reward-driven-spender": "can you think of another time you bought something to celebrate or reward yourself?",
  "#comfort-driven-spender": "can you think of another time you shopped because you were stressed or needed a pick-me-up?",
  "#routine-treat-spender": "can you think of another time you treated yourself as part of your regular routine?",
  "#scroll-triggered": "can you think of another time something just caught your eye while scrolling and you went for it?",
  "#in-store-wanderer": "can you think of another time something just caught your eye in a store and you went for it?",
  "#aesthetic-driven": "can you think of another time something visually appealing made you want to buy it?",
  "#duplicate-collector": "can you think of another time you bought something similar to things you already have?",
  "#trend-susceptibility-driven": "can you think of another time you bought something because everyone seemed to have it?",
  "#social-media-influenced": "can you think of another time you bought something because you saw it on social media?",
  "#friend-peer-influenced": "can you think of another time you bought something because a friend had it or recommended it?",
  "#scarcity-driven": "can you think of another time you bought something because it was running out or limited?",
  "#deal-driven": "can you think of another time a sale or deal made you go for something?",
  "#threshold-spending-driven": "can you think of another time you added stuff to hit free shipping or get a bonus?",
};

/**
 * Get the behavioral excavation entry question for a specific mode
 */
export function getBehavioralExcavationEntryQuestion(mode: string): string | undefined {
  return BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS[mode];
}

/**
 * Probing question hints for behavioral excavation (Layer 3)
 */
export const BEHAVIORAL_EXCAVATION_PROBING = {
  frequencyCheck: "does this feel like something that happens a lot, sometimes, or rarely?",
  usageCheck: "what usually happens with the stuff that slides through — do you end up using it?",
  comfortCheck: "does that sit okay with you or is there something about it that bugs you?",
  rootCause: "if it doesn't feel great, what do you think is behind that?",
  barrierExploration: "you said it bugs you but it keeps happening — what do you think gets in the way?",
};

// =============================================================================
// Mode-Aware Context
// =============================================================================

/**
 * Mode-based entry questions for behavioral excavation
 */
export const behavioralExcavationEntryQuestions: Record<string, string> = {
  "#intuitive-threshold-spender": "Can you think of another time you bought something just because the price felt right?",
  "#reward-driven-spender": "Can you think of another time you bought something to celebrate or reward yourself?",
  "#comfort-driven-spender": "Can you think of another time you shopped because you were stressed or needed a pick-me-up?",
  "#routine-treat-spender": "Can you think of another time you treated yourself as part of your regular routine?",
  "#scroll-triggered": "Can you think of another time something just caught your eye online and you went for it?",
  "#in-store-wanderer": "Can you think of another time something just caught your eye in a store and you went for it?",
  "#aesthetic-driven": "Can you think of another time you bought something because it looked really appealing?",
  "#trend-susceptibility-driven": "Can you think of another time you bought something because everyone seemed to have it?",
  "#social-media-influenced": "Can you think of another time you bought something because you saw it on social media?",
  "#friend-peer-influenced": "Can you think of another time you bought something because a friend recommended it?",
  "#novelty-seeker": "Can you think of another time you bought something because it was new or trending?",
  "#social-spender": "Can you think of another time you bought something influenced by others?",
  "#scarcity-driven": "Can you think of another time you bought something because it was running out or limited?",
  "#scarcity-susceptible": "Can you think of another time you bought something because it was running out or limited?",
  "#deal-driven": "Can you think of another time a sale or deal made you go for something?",
  "#deal-hunter": "Can you think of another time a sale or deal made you go for something?",
  "#threshold-spending-driven": "Can you think of another time you added stuff to hit free shipping or get a bonus?",
  "default": "Can you think of another time you made a similar purchase?",
};

/**
 * Mode-adapted context phrases for emotional reflection
 */
export const emotionalReflectionContext: Record<string, string> = {
  "#comfort-driven-spender": "spending money shopping because you're stressed",
  "#routine-treat-spender": "spending money on these regular treats",
  "#scroll-triggered": "buying things you saw while scrolling",
  "#deal-driven": "buying things because they were on sale",
  "#deal-hunter": "buying things because they were on sale",
  "#scarcity-driven": "buying things because they're limited or running out",
  "#scarcity-susceptible": "buying things because they're limited",
  "#reward-driven-spender": "spending to celebrate or reward yourself",
  "#novelty-seeker": "buying things because they're new or trending",
  "#social-spender": "buying things influenced by others",
  "#intuitive-threshold-spender": "buying things that feel like a good price",
  "default": "this type of purchase",
};

// =============================================================================
// Comparison Helper
// =============================================================================

/**
 * Get comparison example based on price tier
 */
export function getComparisonExample(amount: number): string {
  if (amount < 20) return "a nice lunch out";
  if (amount < 50) return "a month of a streaming service";
  if (amount < 100) return "a nice dinner for two";
  if (amount < 200) return "a weekend getaway fund contribution";
  if (amount < 500) return "a plane ticket";
  return "a month of savings towards a bigger goal";
}

// =============================================================================
// Reflection Prompt Builders
// =============================================================================

/**
 * Get behavioral excavation prompt (Is this a problem?)
 */
export function getBehavioralExcavationPrompt(
  mode: string, 
  transaction: { merchant: string; amount: number }
): string {
  const entryQuestion = behavioralExcavationEntryQuestions[mode] || behavioralExcavationEntryQuestions.default;
  
  return `## Reflection Path: "Is this a problem?" — Behavioral Excavation

EXPLORATION GOAL:
Surface how often this autopilot behavior kicks in, and whether the user is actually using what they buy or it's piling up.

START WITH THIS MODE-BASED ENTRY QUESTION:
"${entryQuestion}"

PROBING QUESTION HINTS (use these to guide the conversation):

FREQUENCY CHECK:
• "Does this feel like something that happens a lot, sometimes, or rarely?"

USAGE/OUTCOME CHECK:
• "What usually happens with the stuff that slides through — do you end up using it?"

COMFORT CHECK (Transition to Emotional):
• "Does that sit okay with you or is there something about it that bugs you?"

ROOT CAUSE (If it bugs them):
• "If it doesn't feel great, what do you think is behind that?"

BARRIER EXPLORATION (If pattern persists):
• "You said it bugs you but it keeps happening — what do you think gets in the way?"

CONTEXT MEMORY HOOKS:
• Reference the merchant: "Does this happen more at ${transaction.merchant} specifically?"
• Reference timing: "Is this usually a weekend thing or weekday?"

IMPORTANT: Never tell them they have a problem. Help them discover patterns for themselves.`;
}

/**
 * Get emotional reflection prompt (How do I feel about this?)
 */
export function getEmotionalReflectionPrompt(
  mode: string, 
  transaction: { merchant: string; amount: number }
): string {
  const context = emotionalReflectionContext[mode] || emotionalReflectionContext.default;
  
  return `## Reflection Path: "How do I feel about this?" — Emotional Reflection

EXPLORATION GOAL:
Surface the gut reaction to this spending and help the user name why they feel any tension.

START WITH THIS ENTRY QUESTION:
"You spent $${transaction.amount.toFixed(2)} at ${transaction.merchant} — how does that land for you?"

MODE-ADAPTED FOLLOW-UP:
"Does ${context} sit well with you?"

PROBING QUESTION HINTS:

NAMING THE FEELING:
• "Is it more of a 'meh' or does it actually bother you?"
• "If you had to name what you're feeling, what would it be?"

TENSION EXPLORATION:
• "What is it about this that's creating the tension?"
• "Is it the amount, the frequency, or something else?"

VALUES ALIGNMENT:
• "Does this feel like it lines up with how you want to spend?"

IMPORTANT: Validate whatever they're feeling. This is about self-discovery, not judgment.`;
}

/**
 * Get cost comparison prompt (Is this a good use of money?)
 */
export function getCostComparisonPrompt(
  mode: string, 
  transaction: { merchant: string; amount: number }
): string {
  const comparison = getComparisonExample(transaction.amount);
  const modeAdaptedQuestion =
    getCostComparisonModeAdaptedQuestion(mode, transaction.amount) ||
    `If you had to spend that $${transaction.amount.toFixed(2)} again, would you?`;
  
  return `## Reflection Path: "Is this a good use of money?" — Cost Comparison

EXPLORATION GOAL:
Make abstract spending concrete through comparisons. Surface opportunity cost by showing what else the money could have been.

START WITH THIS COMPARISON FRAMING:
"You spent $${transaction.amount.toFixed(2)} at ${transaction.merchant} — that's roughly the equivalent of ${comparison}. Which one feels like a better use of money?"

MODE-ADAPTED QUESTION:
"${modeAdaptedQuestion}"

PROBING QUESTION HINTS:

UTILITY/VALUE CHECK:
• "Is this something you'll get a lot of use out of?"

REGRET TEST:
• "If you had to spend that $${transaction.amount.toFixed(2)} again, would you?"

COST-PER-USE (for durable goods):
• "If you use this 10 times, that's about $${(transaction.amount / 10).toFixed(2)} per use — does that feel worth it?"

OPPORTUNITY COST:
• "What else could that money have gone toward?"

IMPORTANT: Avoid being preachy. Present comparisons neutrally and let them evaluate.`;
}

/**
 * Get open-ended reflection prompt (I have a different question)
 */
export function getOpenEndedReflectionPrompt(): string {
  return `## Reflection Path: "I have a different question" — Open-Ended

EXPLORATION GOAL:
User-directed exploration. Meet them where they are.

START WITH:
"What's on your mind?" or "What are you curious about?"

LLM BEHAVIOR:
• Listen for keywords that map to other reflection paths
• If they ask about frequency → use behavioral excavation questions
• If they express feelings → use emotional reflection questions
• If they ask about value/worth → use cost comparison questions
• If novel question → answer directly and offer to continue

IMPORTANT: Follow their lead while gently connecting back to spending awareness.`;
}

/**
 * Get mode-aware reflection prompt for Layer 3
 */
export function getModeAwareReflectionPrompt(
  reflectionType: string,
  mode: string,
  transaction: { merchant: string; amount: number }
): string {
  switch (reflectionType) {
    case "problem":
      return getBehavioralExcavationPrompt(mode, transaction);
    case "feel":
      return getEmotionalReflectionPrompt(mode, transaction);
    case "worth":
      return getCostComparisonPrompt(mode, transaction);
    case "different":
      return getOpenEndedReflectionPrompt();
    default:
      return `Help the user explore their thoughts about this purchase in a supportive, non-judgmental way.`;
  }
}

