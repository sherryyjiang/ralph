/**
 * Shared types for LLM prompts
 */

import type { TransactionCategory, QuickReplyOption, Transaction, CheckInSession } from "@/lib/types";

/**
 * Path-level exploration goal
 * NOTE: probingHints are NOT defined at the path level - they exist ONLY at the subpath level
 * via SubPathProbing. This is intentional architecture.
 */
export interface ExplorationGoal {
  goal: string;
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

