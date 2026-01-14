/**
 * Exploration Goals
 * 
 * Goals for each path. Mode detection is now handled at the subpath level via SubPathProbing.
 */

import { shoppingExplorationGoals, getSubPathProbing, type SubPathProbing } from "../question-trees";
import type { ExplorationGoal } from "./types";

// =============================================================================
// Exploration Goals (re-exported for API route)
// =============================================================================

/**
 * Exploration goals mapped by path.
 * 
 * NOTE: Mode detection (targetModes, modeSignals) is defined at the subpath level.
 * Use getSubPathProbing(path, subPath) to get probing hints and target modes for Layer 2.
 */
export const explorationGoals: Record<string, ExplorationGoal> = Object.fromEntries(
  Object.entries(shoppingExplorationGoals).map(([key, value]) => [
    key,
    {
      goal: value.goal,
      counterProfilePatterns: value.counterProfilePatterns,
    },
  ])
);

// Re-export for use in API route
export { getSubPathProbing, type SubPathProbing };

