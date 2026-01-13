/**
 * Coffee/Treats Check-In Question Trees
 */

import { FixedQuestionResponse, CoffeeCalibrationResult } from "./types";

export function getCoffeeFrequencyCalibration(
  transaction: { merchant: string },
  actualMonthlyCount: number
): FixedQuestionResponse {
  return {
    content: "I noticed you stopped by " + transaction.merchant + ". How many times do you think you have grabbed coffee/treats this month?",
    options: [
      { id: "few", label: Math.max(1, Math.round(actualMonthlyCount * 0.3)) + " or fewer times", emoji: "number", value: String(Math.max(1, Math.round(actualMonthlyCount * 0.3))), color: "white" },
      { id: "some", label: "About " + Math.round(actualMonthlyCount * 0.6) + "-" + Math.round(actualMonthlyCount * 0.8) + " times", emoji: "number", value: String(Math.round(actualMonthlyCount * 0.7)), color: "white" },
      { id: "many", label: "More than " + Math.round(actualMonthlyCount * 0.9) + " times", emoji: "number", value: String(Math.round(actualMonthlyCount)), color: "yellow" },
    ],
  };
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
      message: "Pretty close! You made " + actualCount + " purchases this month, totaling $" + totalSpend.toFixed(0) + ". Nice awareness!",
      actualCount,
      totalSpend,
    };
  } else {
    const direction = diff > 0 ? "more" : "fewer";
    return {
      isClose: false,
      percentDiff,
      absoluteDiff: Math.abs(diff),
      message: "Actually, you made " + actualCount + " purchases this month - that is " + Math.abs(diff) + " " + direction + " than you guessed, totaling $" + totalSpend.toFixed(0) + ".",
      actualCount,
      totalSpend,
    };
  }
}

export function getCoffeeFeelingQuestion(): FixedQuestionResponse {
  return {
    content: "How do you feel about that number?",
    options: [
      { id: "ok_with_it", label: "I am ok with it", emoji: "thumbsup", value: "ok_with_it", color: "white" },
      { id: "could_be_better", label: "Feel like it could be better", emoji: "thinking", value: "could_be_better", color: "yellow" },
    ],
  };
}

export type CoffeeMode =
  | "#autopilot-routine"
  | "#environment-triggered"
  | "#emotional-coping"
  | "#productivity-justification"
  | "#intentional-ritual"
  | "#productive-coffee-drinker"
  | "#social-ritual";

export type CoffeeMotivation = "routine" | "nearby" | "pick_me_up" | "focus";

export function getCoffeeMotivationQuestion(): FixedQuestionResponse {
  return {
    content: "What is the main reason you buy these?",
    options: [
      { id: "routine", label: "It has become a routine", emoji: "repeat", value: "routine", color: "white" },
      { id: "nearby", label: "When I happen to be nearby", emoji: "location", value: "nearby", color: "white" },
      { id: "pick_me_up", label: "When I need a pick-me-up or break", emoji: "coffee", value: "pick_me_up", color: "yellow" },
      { id: "focus", label: "Helps me focus or get things done", emoji: "target", value: "focus", color: "white" },
    ],
  };
}

export function getCoffeeFixedQ2(motivation: CoffeeMotivation, weeklyAverage: number): FixedQuestionResponse {
  switch (motivation) {
    case "routine":
      return {
        content: "You have averaged about " + weeklyAverage + " times a week - was that intentional or did it just kind of happen?",
        options: [
          { id: "just_happened", label: "Just sort of happened", emoji: "shrug", value: "just_happened", color: "yellow" },
          { id: "intentional", label: "Yeah, intentional", emoji: "check", value: "intentional", color: "white" },
        ],
      };
    case "nearby":
      return {
        content: "Where does this usually happen?",
        options: [
          { id: "near_work", label: "Near work / on commute", emoji: "office", value: "near_work", color: "white" },
          { id: "near_home", label: "Near home", emoji: "home", value: "near_home", color: "white" },
          { id: "out_and_about", label: "When I am out doing other things", emoji: "walk", value: "out_and_about", color: "white" },
        ],
      };
    case "pick_me_up":
      return {
        content: "What is usually going on?",
        options: [
          { id: "work_heavy", label: "Work felt like a lot", emoji: "briefcase", value: "work_heavy", color: "yellow" },
          { id: "bored_stuck", label: "Bored or stuck, needed change of scenery", emoji: "meh", value: "bored_stuck", color: "yellow" },
          { id: "stressed_anxious", label: "Stressed or anxious", emoji: "worried", value: "stressed_anxious", color: "yellow" },
          { id: "step_away", label: "Just needed to step away", emoji: "door", value: "step_away", color: "white" },
        ],
      };
    case "focus":
      return {
        content: "You said it helps you focus - does it?",
        options: [
          { id: "real_difference", label: "Yeah, I notice a real difference", emoji: "sparkles", value: "real_difference", color: "white" },
          { id: "half_time", label: "Half the time", emoji: "thinking", value: "half_time", color: "yellow" },
          { id: "hard_to_say", label: "Think so? Hard to say", emoji: "question", value: "hard_to_say", color: "yellow" },
          { id: "probably_not", label: "Honestly, probably not", emoji: "sweat", value: "probably_not", color: "yellow" },
          { id: "ritual", label: "It is more about the ritual", emoji: "coffee", value: "ritual", color: "white" },
        ],
      };
  }
}

export interface CoffeeModeAssignment {
  mode: CoffeeMode;
  isCounterProfile: boolean;
  exitMessage?: string;
}

export function getCoffeeModeFromQ2Response(motivation: CoffeeMotivation, q2Response: string): CoffeeModeAssignment {
  switch (motivation) {
    case "routine":
      if (q2Response === "intentional") {
        return { mode: "#intentional-ritual", isCounterProfile: true, exitMessage: "Sounds like you have got it dialed in! Nothing wrong with an intentional daily ritual." };
      }
      return { mode: "#autopilot-routine", isCounterProfile: false };
    case "nearby":
      return { mode: "#environment-triggered", isCounterProfile: false };
    case "pick_me_up":
      return { mode: "#emotional-coping", isCounterProfile: false };
    case "focus":
      if (q2Response === "real_difference") {
        return { mode: "#productive-coffee-drinker", isCounterProfile: true, exitMessage: "Sounds like it is working for you! If coffee genuinely helps your productivity, that is a worthwhile investment." };
      }
      return { mode: "#productivity-justification", isCounterProfile: false };
  }
}

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
    description: "Habit formed without conscious decision",
    keySignals: ["just sort of happened", "did not realize"],
    reflectionGuidance: "The habit snuck up on you.",
  },
  "#environment-triggered": {
    mode: "#environment-triggered",
    name: "Environment Triggered",
    description: "Purchases driven by physical proximity",
    keySignals: ["near work", "it is right there"],
    reflectionGuidance: "Your environment is making spending decisions for you.",
  },
  "#emotional-coping": {
    mode: "#emotional-coping",
    name: "Emotional Coping",
    description: "Coffee/treat is response to emotional states",
    keySignals: ["stressed or anxious", "needed a break"],
    reflectionGuidance: "You are using coffee runs to manage emotions.",
  },
  "#productivity-justification": {
    mode: "#productivity-justification",
    name: "Productivity Justification",
    description: "Claims productivity benefits",
    keySignals: ["half the time", "hard to say"],
    reflectionGuidance: "The productivity claim might be more hope than reality.",
  },
  "#intentional-ritual": {
    mode: "#intentional-ritual",
    name: "Intentional Ritual",
    description: "Consciously chose to have this as a regular treat",
    keySignals: ["intentional", "I like having this"],
    reflectionGuidance: "You have made a conscious choice. Enjoy it!",
    isCounterProfile: true,
  },
  "#productive-coffee-drinker": {
    mode: "#productive-coffee-drinker",
    name: "Productive Coffee Drinker",
    description: "Actually gets productive work done with coffee",
    keySignals: ["real difference", "actually works better"],
    reflectionGuidance: "If it genuinely helps, it is a tool.",
    isCounterProfile: true,
  },
  "#social-ritual": {
    mode: "#social-ritual",
    name: "Social Ritual",
    description: "Coffee runs are about social connection",
    keySignals: ["meeting someone", "catch up with"],
    reflectionGuidance: "The coffee is secondary to the connection.",
  },
};

export function getCoffeeEconomicEvaluation(mode: CoffeeMode, monthlySpend: number, monthlyCount: number): FixedQuestionResponse {
  const perVisit = monthlyCount > 0 ? monthlySpend / monthlyCount : 0;
  
  const benefitMap: Record<CoffeeMode, string> = {
    "#autopilot-routine": "the daily ritual you did not consciously choose",
    "#environment-triggered": "the convenience of grabbing something nearby",
    "#emotional-coping": "the mood boost and break from stress",
    "#productivity-justification": "the productivity you think you are getting",
    "#intentional-ritual": "your intentional daily treat",
    "#productive-coffee-drinker": "the real productivity boost",
    "#social-ritual": "the social connection and shared moments",
  };

  const benefit = benefitMap[mode] || "coffee and treats";

  return {
    content: "At $" + perVisit.toFixed(0) + " per visit, " + monthlyCount + " times a month, that is $" + monthlySpend.toFixed(0) + "/month. Is " + benefit + " worth it to you?",
    options: [
      { id: "worth_it", label: "Yeah, it is worth it to me", emoji: "check", value: "worth_it", color: "white" },
      { id: "not_worth", label: "Honestly, probably not", emoji: "thinking", value: "not_worth", color: "yellow" },
      { id: "mixed", label: "Some of it is, some is not", emoji: "scales", value: "mixed", color: "white" },
    ],
  };
}

export function getCoffeeModeFromMotivation(motivation: string): CoffeeMode | null {
  const modeMap: Record<string, CoffeeMode> = {
    routine: "#autopilot-routine",
    nearby: "#environment-triggered",
    pick_me_up: "#emotional-coping",
    focus: "#productivity-justification",
    treat: "#intentional-ritual",
    social: "#intentional-ritual",
  };
  return modeMap[motivation] || null;
}
