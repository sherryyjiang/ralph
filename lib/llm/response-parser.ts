/**
 * LLM Response Parser
 *
 * Parses LLM responses into structured data for the check-in flow.
 * Handles both JSON and plain text responses.
 */

import type { LLMResponse } from "@/lib/types";

/**
 * List of valid spending modes that can be assigned
 */
const VALID_MODES = [
  "#comfort-driven-spender",
  "#novelty-seeker",
  "#social-spender",
  "#deal-hunter",
  "#scarcity-susceptible",
  "#intentional-planner",
  "#quality-seeker",
  "#generous-giver",
  "#obligation-driven",
  "#organized-restocker",
  "#just-in-case-buyer",
  "#intuitive-threshold-spender",
  "#reward-driven-spender",
  "#routine-treat-spender",
  "#scroll-triggered",
  "#in-store-wanderer",
  "#aesthetic-driven",
  "#duplicate-collector",
  "#social-media-influenced",
  "#friend-peer-influenced",
  "#scarcity-driven",
  "#deal-driven",
  "#threshold-spending-driven",
  "#deliberate-budget-saver",
  "#deliberate-deal-hunter",
  "#deliberate-researcher",
  "#deliberate-pause-tester",
  "#deliberate-low-priority",
  "#gift-giver",
  "#loyal-repurchaser",
  "#brand-switcher",
  "#upgrader",
];

/**
 * Parse an LLM response into structured data
 *
 * @param text - Raw text response from the LLM
 * @param expectModeAssignment - Whether to look for mode indicators in plain text
 * @returns Parsed LLM response
 */
export function parseResponse(text: string, expectModeAssignment = false): LLMResponse {
  // Try to parse as JSON first
  try {
    // Look for JSON in the response (might be wrapped in markdown code blocks)
    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*"message"[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      return {
        message: parsed.message || text,
        options: parsed.options,
        assignedMode: parsed.assignedMode,
        shouldTransition: parsed.shouldTransition ?? false,
        exitGracefully: parsed.exitGracefully ?? false,
        rerouteToSubPath: parsed.rerouteToSubPath,
      };
    }
  } catch {
    // JSON parsing failed, fall through to plain text handling
  }

  // Look for mode indicators in plain text if we expected mode assignment
  let assignedMode: string | undefined;
  if (expectModeAssignment) {
    for (const mode of VALID_MODES) {
      if (text.toLowerCase().includes(mode.toLowerCase())) {
        assignedMode = mode;
        break;
      }
    }
  }

  // If not valid JSON, treat entire response as message
  return {
    message: text,
    assignedMode,
    shouldTransition: expectModeAssignment, // Transition to Layer 3 if mode assignment was expected
    exitGracefully: false,
  };
}

/**
 * Validate that an assigned mode is valid
 *
 * @param mode - The mode to validate
 * @returns Whether the mode is valid
 */
export function isValidMode(mode: string): boolean {
  return VALID_MODES.includes(mode);
}

/**
 * Extract mode from text that mentions a mode
 *
 * @param text - Text that may contain a mode mention
 * @returns The first mode found, or undefined
 */
export function extractModeFromText(text: string): string | undefined {
  for (const mode of VALID_MODES) {
    if (text.toLowerCase().includes(mode.toLowerCase())) {
      return mode;
    }
  }
  return undefined;
}
