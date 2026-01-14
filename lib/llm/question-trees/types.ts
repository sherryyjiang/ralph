/**
 * Question Tree Type Definitions
 * Core types used across all question tree modules.
 */

import { QuickReplyOption } from "@/lib/types";

export interface FixedQuestionResponse {
  content: string;
  options: QuickReplyOption[];
}

export interface ExplorationGoal {
  path: string;
  goal: string;
  probingHints?: string[]; // Optional - probing hints should be defined at the subpath level
  counterProfilePatterns: string[];
}

export interface SubPathProbing {
  subPath: string;
  explorationTag?: string;
  explorationGoal: string;
  probingHints: string[];
  targetModes: string[];
  modeSignals: Record<string, string[]>;
  counterProfilePatterns?: string[];
  counterProfileBehavior?: "reroute" | "exit";
  counterProfileRerouteToSubPath?: string;
  counterProfileExit?: string;
  lightProbing?: boolean;
}


export interface ModeDefinition {
  id: string;
  name: string;
  description: string;
  indicators: string[];
  reflectionGuidance: string;
}

export interface CalibrationResult {
  isClose: boolean;
  percentDiff: number;
  absoluteDiff: number;
  actualAmount: number;
  message: string;
  showBreakdown: boolean;
}

export interface CoffeeCalibrationResult {
  isClose: boolean;
  percentDiff: number;
  absoluteDiff: number;
  message: string;
  actualCount: number;
  totalSpend: number;
}

/**
 * Layer 3 Reflection Path Probing
 * Structured data for each reflection path (problem, feel, worth, different)
 */
export type ReflectionPathType = "problem" | "feel" | "worth" | "different";

export interface ReflectionPathProbing {
  path: ReflectionPathType;
  explorationGoal: string;
  entryQuestions: Record<string, string>; // mode -> entry question
  probingHints: string[];
  evaluationContext?: Record<string, string>; // mode -> context phrase for evaluation
}
