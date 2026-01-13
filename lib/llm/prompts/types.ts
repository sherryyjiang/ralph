/**
 * Shared types for LLM prompts
 */

import type { TransactionCategory, QuickReplyOption, Transaction, CheckInSession } from "@/lib/types";

export interface ExplorationGoal {
  goal: string;
  probingHints: string[];
  modeIndicators: string[];
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

