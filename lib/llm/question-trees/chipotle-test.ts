// Chipotle test flow - isolated test logic
import type { QuickReplyOption } from "@/lib/types";

// Home card entry options
export type ChipotleEntryReason = "social" | "convenience" | "reward";

export const CHIPOTLE_ENTRY_OPTIONS: QuickReplyOption[] = [
  { id: "social", label: "Social", emoji: "👥", value: "social", color: "white" },
  { id: "convenience", label: "Convenience", emoji: "⚡", value: "convenience", color: "white" },
  { id: "reward", label: "Reward", emoji: "🎁", value: "reward", color: "white" },
];

// Q1: Was this worth it?
export const CHIPOTLE_WORTH_IT_OPTIONS: QuickReplyOption[] = [
  { id: "yes", label: "Yes", emoji: "👍", value: "yes", color: "white" },
  { id: "no", label: "No", emoji: "👎", value: "no", color: "white" },
];

// Q2 (if yes): Why was it worth it?
export const CHIPOTLE_WHY_WORTH_OPTIONS: QuickReplyOption[] = [
  { id: "taste", label: "Taste", emoji: "😋", value: "taste", color: "white" },
  { id: "time_saved", label: "Time saved", emoji: "⏱️", value: "time_saved", color: "white" },
  { id: "mood_boost", label: "Mood boost", emoji: "😊", value: "mood_boost", color: "white" },
  { id: "social", label: "Social", emoji: "👥", value: "social", color: "white" },
];

// Q2 (if no): Why wasn't it worth it?
export const CHIPOTLE_WHY_NOT_WORTH_OPTIONS: QuickReplyOption[] = [
  { id: "habit", label: "I did it out of habit / autopilot", emoji: "🔄", value: "habit", color: "white" },
  { id: "not_worth_money", label: "Not worth the money", emoji: "💸", value: "not_worth_money", color: "white" },
  { id: "didnt_taste_good", label: "Didn't taste that good", emoji: "😕", value: "didnt_taste_good", color: "white" },
  { id: "didnt_match_eating", label: "It didn't match how I want to eat lately", emoji: "🥗", value: "didnt_match_eating", color: "white" },
];

// Exit options
export const CHIPOTLE_EXIT_OPTIONS: QuickReplyOption[] = [
  { id: "close", label: "Close", emoji: "✕", value: "close", color: "white" },
];

// Get the first chat question
export function getChipotleWorthItQuestion(): { content: string; options: QuickReplyOption[] } {
  return {
    content: "Was this worth it?",
    options: CHIPOTLE_WORTH_IT_OPTIONS,
  };
}

// Get the follow-up question based on worth answer
export function getChipotleFollowUpQuestion(wasWorthIt: boolean): { content: string; options: QuickReplyOption[] } {
  if (wasWorthIt) {
    return {
      content: "Why was it worth it?",
      options: CHIPOTLE_WHY_WORTH_OPTIONS,
    };
  }
  return {
    content: "Why wasn't it worth it?",
    options: CHIPOTLE_WHY_NOT_WORTH_OPTIONS,
  };
}

// Get conclusion message
export function getChipotleConclusionMessage(): string {
  return "Thanks for sharing! Peek appreciates you taking the time to reflect. We'll continue to learn more about you and your patterns, especially around food. 🌯";
}
