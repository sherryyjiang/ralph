/**
 * Food Check-In Question Trees - handles food delivery check-in flow
 */

import { FixedQuestionResponse, CalibrationResult } from "./types";

export function getFoodAwarenessCalibration(
  transaction: { merchant: string; amount: number },
  actualMonthlySpend: number
): FixedQuestionResponse {
  return {
    content: "I see you ordered from " + transaction.merchant + ". Before we dig in, how much do you think you have spent on food delivery this month?",
    options: [
      { id: "guess_low", label: "Around $" + Math.round(actualMonthlySpend * 0.4), emoji: "money", value: String(Math.round(actualMonthlySpend * 0.4)), color: "white" },
      { id: "guess_medium", label: "Around $" + Math.round(actualMonthlySpend * 0.7), emoji: "money", value: String(Math.round(actualMonthlySpend * 0.7)), color: "white" },
      { id: "guess_high", label: "Around $" + Math.round(actualMonthlySpend), emoji: "money", value: String(Math.round(actualMonthlySpend)), color: "white" },
      { id: "guess_higher", label: "$" + Math.round(actualMonthlySpend * 1.2) + "+", emoji: "money", value: String(Math.round(actualMonthlySpend * 1.2)), color: "white" },
    ],
  };
}

export function getFoodCalibrationResult(guessedAmount: number, actualAmount: number): CalibrationResult {
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
      message: "Nice awareness! You have spent $" + actualAmount.toFixed(0) + " on food delivery this month. You were pretty close!",
      showBreakdown: false,
    };
  } else {
    const direction = diff > 0 ? "more" : "less";
    return {
      isClose: false,
      percentDiff,
      absoluteDiff,
      actualAmount,
      message: "Actually, you have spent $" + actualAmount.toFixed(0) + " this month - about $" + absoluteDiff.toFixed(0) + " " + direction + " than you guessed. Would you like to see what is behind this amount?",
      showBreakdown: true,
    };
  }
}

export function getFoodFeelingQuestion(): FixedQuestionResponse {
  return {
    content: "How do you feel about this number?",
    options: [
      { id: "ok_with_it", label: "I am ok with it", emoji: "thumbsup", value: "ok_with_it", color: "white" },
      { id: "not_great", label: "Not great, honestly", emoji: "thinking", value: "not_great", color: "yellow" },
    ],
  };
}

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
      { id: "drained", label: "I am usually too drained to cook", emoji: "tired", value: "drained", color: "yellow" },
      { id: "easier", label: "It is just easier to order", emoji: "phone", value: "easier", color: "white" },
      { id: "no_plan", label: "I keep meaning to cook but never plan", emoji: "list", value: "no_plan", color: "yellow" },
      { id: "wanted_meal", label: "I actually wanted that specific meal", emoji: "food", value: "wanted_meal", color: "white" },
      { id: "too_busy", label: "I am too busy to plan", emoji: "clock", value: "too_busy", color: "yellow" },
    ],
  };
}

export function getFoodModeFromMotivation(motivation: string): string | null {
  const modeMap: Record<string, string> = {
    drained: "#autopilot-from-stress",
    easier: "#convenience-driven",
    no_plan: "#lack-of-pre-planning",
    wanted_meal: "#intentional-treat",
    too_busy: "#lack-of-pre-planning",
    stress: "#autopilot-from-stress",
    convenience: "#convenience-driven",
    planning: "#lack-of-pre-planning",
    craving: "#intentional-treat",
    social: "#social-eating",
  };
  return modeMap[motivation] || null;
}

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
    explorationGoal: "Understand what is driving the stress/drain.",
    probingHints: ["What is usually going on when you feel that way?", "Is it more of a work thing or just life in general?"],
    keySignals: ["when I am stressed I just order", "busy week so I did not cook"],
  },
  "#convenience-driven": {
    mode: "#convenience-driven",
    explorationGoal: "Understand if this is a lifestyle choice or friction avoidance.",
    probingHints: ["Do you cook at all, or is ordering kind of the default?"],
    keySignals: ["it is just easier", "it shows up at my door"],
  },
  "#lack-of-pre-planning": {
    mode: "#lack-of-pre-planning",
    explorationGoal: "Understand where the planning breaks down.",
    probingHints: ["What usually gets in the way of planning?"],
    keySignals: ["got home late", "forgot to bring lunch"],
  },
  "#intentional-treat": {
    mode: "#intentional-treat",
    explorationGoal: "Validate that this was intentional.",
    probingHints: ["Nice - what did you get?"],
    keySignals: ["I was craving it", "planned treat"],
    isCounterProfile: true,
    exitResponses: ["Sounds like you knew what you wanted - enjoy!"],
  },
};

export function getFoodEconomicEvaluation(mode: FoodMode, monthlySpend: number): FixedQuestionResponse {
  const benefitMap: Record<FoodMode, string> = {
    "#autopilot-from-stress": "relief from cooking when you are drained",
    "#convenience-driven": "the ease and convenience",
    "#lack-of-pre-planning": "not having to plan",
    "#intentional-treat": "enjoying the meals you really wanted",
    "#social-eating": "the social experience of sharing meals",
  };

  const benefit = benefitMap[mode] || "convenience";

  return {
    content: "Is " + benefit + " worth the $" + monthlySpend.toFixed(0) + " you are spending?",
    options: [
      { id: "worth_it", label: "Yeah, it is worth it to me", emoji: "check", value: "worth_it", color: "white" },
      { id: "not_worth", label: "Honestly, probably not", emoji: "thinking", value: "not_worth", color: "yellow" },
    ],
  };
}
