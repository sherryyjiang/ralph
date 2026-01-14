/**
 * Shared types for LLM prompts
 */

import type { TransactionCategory, QuickReplyOption, Transaction, CheckInSession } from "@/lib/types";

/**
 * Path-level exploration goal
 * NOTE: Mode detection (targetModes, modeSignals) is defined at the subpath level
 * via SubPathProbing. The LLM derives modes from conversation context + subpath signals.
 */
export interface ExplorationGoal {
  goal: string;
  counterProfilePatterns: string[];
}

export interface BuildSystemPromptParams {
  transaction: Transaction;
  session: CheckInSession;
  questionTreeSection?: string;
  probingTurn?: number;
  maxProbingTurns?: number;
}

export type { TransactionCategory, QuickReplyOption, Transaction, CheckInSession };

