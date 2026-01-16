import type { FixedQuestionResponse, QuickReplyOption } from "@/lib/types";

export const TEMU_ENTRY_QUESTION =
  "Before we dig in, how much do you think you spent on Temu this month?";

export const TEMU_DIAGNOSIS_QUESTIONS: FixedQuestionResponse[] = [
  {
    content: "What tends to pull you into Temu most often?",
    options: [
      { id: "deal", label: "A good deal or discount", emoji: "🏷️", value: "deal", color: "yellow" },
      { id: "browse", label: "Scrolling and finding random items", emoji: "🌀", value: "browse", color: "yellow" },
      { id: "specific", label: "Looking for something specific", emoji: "🎯", value: "specific", color: "white" },
      { id: "influenced", label: "Ads or recommendations got me", emoji: "📲", value: "influenced", color: "yellow" },
      { id: "other", label: "Other / custom", emoji: "📝", value: "other", color: "white" },
    ],
  },
];

export const TEMU_EXIT_OPTIONS: QuickReplyOption[] = [
  { id: "close", label: "Close", emoji: "✅", value: "close", color: "white" },
];

export const TEMU_REFLECTION_QUESTIONS: Record<string, string> = {
  problem: "When you think about how often Temu comes up, does it feel like a lot, sometimes, or rarely?",
  feel: "How does the $489.54 total land for you?",
  worth: "Does that amount feel worth it for what you got?",
  different: "What question is on your mind?",
};

export const TEMU_BREAKDOWN_PROMPT = "Want to dig deeper into the numbers to see where this came from?";

export const TEMU_BREAKDOWN_NOTE =
  "Sometimes the orders land on days you do not really think of as shopping days, and the amounts are small enough that they do not feel big in the moment, but they add up fast.";

export interface TemuCalibrationResult {
  isClose: boolean;
  message: string;
}

export function getTemuCalibrationResult(guess: number, actual: number): TemuCalibrationResult {
  const diff = Math.abs(actual - guess);
  const percentDiff = actual > 0 ? (diff / actual) * 100 : 0;
  const isClose = percentDiff <= 20 || diff <= 60;

  if (isClose) {
    return {
      isClose: true,
      message: `Pretty close — you spent about $${actual.toFixed(2)} on Temu this month.`,
    };
  }

  const direction = actual > guess ? "more" : "less";
  return {
    isClose: false,
    message: `Actually it was about $${actual.toFixed(2)} — roughly $${diff.toFixed(2)} ${direction} than your guess.`,
  };
}

export function buildTemuSummaryPrompt(params: {
  guess: number;
  actual: number;
  diagnosisAnswers: string[];
}): string {
  const { guess, actual, diagnosisAnswers } = params;
  return [
    "You are Peek — warm, concise, and non-judgmental.",
    "Write a 2-3 sentence summary of what we learned about the user's Temu spending.",
    "Use plain sentences only. No bullets, no markdown, no lists.",
    "",
    `Context: Temu monthly spend is $${actual.toFixed(2)}. User guessed $${guess.toFixed(2)}.`,
    `Diagnosis answers: ${diagnosisAnswers.join(" | ")}`,
    "End by inviting them to choose a reflection path.",
  ].join("\n");
}

export function buildTemuClosingPrompt(params: {
  reflectionPath: string;
  reflectionAnswer: string;
  actual: number;
}): string {
  const { reflectionPath, reflectionAnswer, actual } = params;
  return [
    "You are Peek — warm, concise, and non-judgmental.",
    "Write a 2-3 sentence closing that reflects the user's answer and wraps up gently.",
    "Use plain sentences only. No bullets, no markdown, no lists.",
    "",
    `Reflection path: ${reflectionPath}`,
    `User response: ${reflectionAnswer}`,
    `Temu spend: $${actual.toFixed(2)}`,
  ].join("\n");
}
