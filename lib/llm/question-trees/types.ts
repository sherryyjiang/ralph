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
  probingHints: string[];
  modeIndicators: Record<string, string[]>;
  counterProfilePatterns: string[];
}

export interface SubPathProbing {
  subPath: string;
  explorationTag?: string;
  explorationGoal: string;
  probingHints: string[];
  targetModes: string[];
  modeSignals: Record<string, string[]>;
  counterProfileExit?: string;
  lightProbing?: boolean;
}

export interface SubPathExplorationGoal {
  subPath: string;
  mode: string;
  explorationGoal: string;
  probingHints: string[];
  keySignals: string[];
  possibleModes?: string[];
  lightProbing?: boolean;
  counterProfileExit?: string;
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
