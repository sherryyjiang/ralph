/**
 * Exploration Goals
 * 
 * Goals for each path, re-exported with flattened mode indicators.
 */

import { shoppingExplorationGoals, getSubPathProbing, type SubPathProbing } from "../question-trees";
import type { ExplorationGoal } from "./types";

// =============================================================================
// Exploration Goals (re-exported for API route)
// =============================================================================

/**
 * Exploration goals mapped by path, with flattened mode indicators
 * 
 * NOTE: probingHints are NOT defined at the path level - they exist ONLY at the subpath level.
 * Use getSubPathProbing(path, subPath) to get probing hints for Layer 2.
 */
export const explorationGoals: Record<string, ExplorationGoal> = Object.fromEntries(
  Object.entries(shoppingExplorationGoals).map(([key, value]) => [
    key,
    {
      goal: value.goal,
      // Note: in Shopping, these prefixes are *exploration tags* (e.g. "#price-sensitivity-driven"),
      // not the flat modes assigned after probing completes.
      modeIndicators: Object.entries(value.modeIndicators).flatMap(([tag, indicators]) =>
        indicators.map((i: string) => `${tag}: ${i}`)
      ),
      counterProfilePatterns: value.counterProfilePatterns,
    },
  ])
);

// Re-export for use in API route
export { getSubPathProbing, type SubPathProbing };

