/**
 * LLM Prompts - Modular Re-exports
 * 
 * This file re-exports all prompt modules for backwards compatibility.
 * Import from here or directly from submodules.
 */

// Types
export type { ExplorationGoal, BuildSystemPromptParams } from "./types";

// Exploration Goals
export { explorationGoals, getSubPathProbing, type SubPathProbing } from "./exploration-goals";

// Fixed Questions
export { getFixedQuestion1Options, getFixedQuestion2Options } from "./fixed-questions";

// System Prompts
export { getSystemPrompt } from "./system-prompts";

// Layer 2 Probing
export { getLayer2ProbingPrompt, getModeAssignmentPrompt } from "./layer2-probing";

// Layer 3 Reflection
export {
  getBehavioralExcavationEntryQuestion,
  BEHAVIORAL_EXCAVATION_PROBING,
  behavioralExcavationEntryQuestions,
  emotionalReflectionContext,
  getComparisonExample,
  getBehavioralExcavationPrompt,
  getEmotionalReflectionPrompt,
  getCostComparisonPrompt,
  getOpenEndedReflectionPrompt,
  getModeAwareReflectionPrompt,
} from "./layer3-reflection";

// Category-Specific Prompts
export { getReflectionPrompt, getFoodModePrompt } from "./category-prompts";

// Note: buildSystemPrompt is still in the main prompts.ts file
// as it has complex dependencies. Import it from "../prompts" directly.

