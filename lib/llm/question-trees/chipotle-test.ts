// Chipotle test flow - isolated test logic
import type { QuickReplyOption } from "@/lib/types";

// Home card entry options
export type ChipotleEntryReason = "social" | "takeout" | "treat" | "just_like";

export const CHIPOTLE_ENTRY_OPTIONS: QuickReplyOption[] = [
  { id: "social", label: "Eating with someone else", emoji: "👥", value: "social", color: "white" },
  { id: "takeout", label: "Convenient takeout", emoji: "🥡", value: "takeout", color: "white" },
  { id: "treat", label: "Treating myself", emoji: "🎁", value: "treat", color: "white" },
  { id: "just_like", label: "I just like Chipotle", emoji: "🌯", value: "just_like", color: "white" },
];

// Q1: Was this worth it?
export const CHIPOTLE_WORTH_IT_OPTIONS: QuickReplyOption[] = [
  { id: "yes", label: "Yes", emoji: "👍", value: "yes", color: "white" },
  { id: "no", label: "No", emoji: "👎", value: "no", color: "white" },
  { id: "meh", label: "Meh", emoji: "😐", value: "meh", color: "white" },
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

// Q2 (if meh): Tension-based options
export const CHIPOTLE_MEH_OPTIONS: QuickReplyOption[] = [
  { id: "taste_vs_money", label: "I like the taste but it's not worth the money", emoji: "💰", value: "taste_vs_money", color: "white" },
  { id: "time_vs_cooking", label: "It saves me time but I could cook if I planned better", emoji: "⏰", value: "time_vs_cooking", color: "white" },
  { id: "too_often", label: "I like Chipotle but I go way too many times", emoji: "📈", value: "too_often", color: "white" },
  { id: "convenient_but_lazy", label: "It's convenient but I feel lazy relying on it", emoji: "🛋️", value: "convenient_but_lazy", color: "white" },
  { id: "tastes_fine_not_special", label: "It tastes fine but nothing special anymore", emoji: "😶", value: "tastes_fine_not_special", color: "white" },
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
export function getChipotleFollowUpQuestion(answer: "yes" | "no" | "meh"): { content: string; options: QuickReplyOption[] } {
  if (answer === "yes") {
    return {
      content: "Why was it worth it?",
      options: CHIPOTLE_WHY_WORTH_OPTIONS,
    };
  }
  if (answer === "no") {
    return {
      content: "Why wasn't it worth it?",
      options: CHIPOTLE_WHY_NOT_WORTH_OPTIONS,
    };
  }
  // meh
  return {
    content: "What's the tension you're feeling?",
    options: CHIPOTLE_MEH_OPTIONS,
  };
}

// Build prompt for LLM conclusion
export function buildChipotleConclusionPrompt(
  entryReason: string,
  worthAnswer: string,
  followUpAnswer: string
): string {
  const entryLabels: Record<string, string> = {
    social: "eating with someone else",
    takeout: "convenient takeout",
    treat: "treating themselves",
    just_like: "just liking Chipotle",
  };

  const worthLabels: Record<string, string> = {
    yes: "it was worth it",
    no: "it wasn't worth it",
    meh: "they felt mixed about it",
  };

  const followUpLabels: Record<string, string> = {
    // Yes options
    taste: "the taste",
    time_saved: "time saved",
    mood_boost: "mood boost",
    social: "social aspect",
    // No options
    habit: "doing it out of habit/autopilot",
    not_worth_money: "not worth the money",
    didnt_taste_good: "it didn't taste good",
    didnt_match_eating: "it didn't match how they want to eat",
    // Meh options
    taste_vs_money: "liking the taste but not worth the money",
    time_vs_cooking: "saving time but could cook with better planning",
    too_often: "liking Chipotle but going too often",
    convenient_but_lazy: "convenience but feeling lazy relying on it",
    tastes_fine_not_special: "it tastes fine but nothing special anymore",
  };

  return `You are Peek, a warm financial companion. The user just completed a quick check-in about a $12.42 Chipotle purchase.

Their responses:
- Why they went: ${entryLabels[entryReason] || entryReason}
- Was it worth it: ${worthLabels[worthAnswer] || worthAnswer}
- Reason: ${followUpLabels[followUpAnswer] || followUpAnswer}

Write a brief, warm conclusion (2-3 sentences max) that:
1. Acknowledges their specific response pattern without being preachy
2. Mentions that Peek appreciates them sharing and this helps us learn about their patterns around food
3. Keeps it conversational and friendly

Don't give advice. Don't lecture. Just acknowledge and thank them warmly.`;
}
