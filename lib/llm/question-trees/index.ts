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

// Reflection
export {
  getReflectionOptions,
  REFLECTION_PATHS,
  BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS,
  EMOTIONAL_REFLECTION_CONTEXT,
  COST_COMPARISON_CONTEXT,
  BEHAVIORAL_EXCAVATION_PROBING_HINTS,
  EMOTIONAL_REFLECTION_PROBING_HINTS,
  COST_COMPARISON_PROBING_HINTS,
  OPEN_ENDED_REFLECTION_GUIDANCE,
  getCostComparisonModeAdaptedQuestion,
  GRACEFUL_EXIT_MESSAGES,
  MODE_AWARE_EXIT_MESSAGE,
  getGracefulExitMessage,
} from "./reflection";
export type { ReflectionPathOption } from "./reflection";

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
