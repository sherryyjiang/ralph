/**
 * Question Trees - Main Entry Point
 * Re-exports all question tree modules for easy imports.
 */

// Types
export type {
  FixedQuestionResponse,
  ExplorationGoal,
  SubPathProbing,
  ModeDefinition,
  CalibrationResult,
  CoffeeCalibrationResult,
  ReflectionPathProbing,
  ReflectionPathType,
} from "./types";

// Modes
export {
  modeDefinitions,
  shoppingModeDefinitions,
  MODE_CATEGORIES,
  EXPLORATION_TAGS,
  isExplorationTag,
  isValidMode,
} from "./modes";

// Reflection (Layer 3)
export {
  // UI Options
  getReflectionOptions,
  REFLECTION_PATHS,
  // Structured path data
  BEHAVIORAL_EXCAVATION,
  EMOTIONAL_REFLECTION,
  COST_COMPARISON,
  OPEN_ENDED,
  // Lookup functions
  getReflectionPathProbing,
  getComparisonExample,
  getCostComparisonModeAdaptedQuestion,
  // Closing
  getGracefulExitMessage,
  buildClosingSummary,
  GRACEFUL_EXIT_MESSAGES,
  MODE_AWARE_EXIT_MESSAGE,
  // Legacy exports (for backwards compatibility)
  BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS,
  EMOTIONAL_REFLECTION_CONTEXT,
  COST_COMPARISON_CONTEXT,
  BEHAVIORAL_EXCAVATION_PROBING_HINTS,
  EMOTIONAL_REFLECTION_PROBING_HINTS,
  COST_COMPARISON_PROBING_HINTS,
  OPEN_ENDED_REFLECTION_GUIDANCE,
} from "./reflection";
export type { ReflectionPathOption, EvaluationOutcome } from "./reflection";

// Shopping
export {
  SHOPPING_Q2_QUESTIONS,
  getShoppingFixedQuestion1,
  getShoppingFixedQuestion2Text,
  shoppingExplorationGoals,
  impulseSubPathProbing,
  deliberateSubPathProbing,
  dealSubPathProbing,
  giftSubPathProbing,
  maintenanceSubPathProbing,
  getSubPathProbing,
  getFixedQuestion2Options,
} from "./shopping";

// Food
export {
  getFoodAwarenessCalibration,
  getFoodCalibrationResult,
  getFoodFeelingQuestion,
  getFoodMotivationQuestion,
  getFoodModeFromMotivation,
  foodModeExplorations,
  getFoodEconomicEvaluation,
} from "./food";
export type { FoodMode, FoodModeExploration } from "./food";

// Coffee
export {
  getCoffeeFrequencyCalibration,
  getCoffeeCalibrationResult,
  getCoffeeFeelingQuestion,
  getCoffeeMotivationQuestion,
  getCoffeeFixedQ2,
  getCoffeeModeFromQ2Response,
  coffeeModeExplorations,
  getCoffeeEconomicEvaluation,
  getCoffeeModeFromMotivation,
} from "./coffee";
export type { CoffeeMode, CoffeeMotivation, CoffeeModeAssignment, CoffeeModeExploration } from "./coffee";
