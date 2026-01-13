/**
 * Layer 2 Probing Prompts
 * 
 * Prompts for the probing phase after Q2 selection.
 */

import { getSubPathProbing } from "../question-trees";
import { explorationGoals } from "./exploration-goals";

// =============================================================================
// Layer 2 Probing Prompts
// =============================================================================

export function getLayer2ProbingPrompt(path: string, subPath: string, userResponse: string): string {
  const subPathProbing = getSubPathProbing(path, subPath);
  
  if (subPathProbing) {
    return `Based on the user's response: "${userResponse}"

**Exploration Goal**: ${subPathProbing.explorationGoal}

**REQUIRED Probing Questions** (YOU MUST USE ONE - DO NOT MAKE UP YOUR OWN):
${subPathProbing.probingHints.map((h) => `- "${h}"`).join("\n")}

**Acceptable**: You may slightly adapt wording for natural flow, but KEEP the core question.

**PROHIBITED - These are too generic**:
- "Can you tell me more?" ❌
- "What factors did you consider?" ❌  
- "Can you elaborate on that?" ❌
- "What was going through your mind?" ❌

**Response Format**:
1. Start with warmth: "That makes sense...", "I hear you...", "Got it..."
2. Mirror their language back briefly (1 sentence)
3. Ask ONE question from the required list above

Respond with ONLY your message - no JSON, no options.`;
  }
  
  return `Based on the user's response: "${userResponse}"

Continue exploring with warmth. Start with acknowledgment, then ask ONE curious follow-up question.
Keep it to 2 sentences max.

Respond with ONLY your message - no JSON, no options.`;
}

// =============================================================================
// Mode Assignment Prompts
// =============================================================================

export function getModeAssignmentPrompt(
  conversationHistory: string[],
  path: string,
  subPath?: string
): string {
  const subPathProbing = subPath ? getSubPathProbing(path, subPath) : undefined;
  const targetModes = subPathProbing?.targetModes || [];
  const modeSignals = subPathProbing?.modeSignals || {};
  
  const goalContext = explorationGoals[path] 
    ? `Path context: ${explorationGoals[path].goal}` 
    : "";
    
  return `Based on this conversation (path: ${path}, sub-path: ${subPath || "unknown"}):
${conversationHistory.join("\n")}

${goalContext}

${targetModes.length > 0 ? `
**Target Modes for this path**:
${targetModes.map((m) => `- ${m}`).join("\n")}

**Mode Signals** (look for matches in conversation):
${Object.entries(modeSignals).map(([mode, signals]) => 
  `${mode}: ${signals.join(", ")}`
).join("\n")}
` : `
Determine if the user matches one of these spending modes:
- #comfort-driven-spender
- #novelty-seeker
- #social-spender
- #deal-hunter
- #scarcity-susceptible
- #intentional-planner
- #quality-seeker
- #generous-giver
- #obligation-driven
- #organized-restocker
- #just-in-case-buyer
`}

Respond with JSON:
{
  "message": "Your transitional message to Layer 3, ending with: Would you like to explore any of these?",
  "assignedMode": "#mode-id or null if unclear",
  "shouldTransition": true,
  "options": [
    { "id": "problem", "label": "Is this a problem?", "emoji": "🤔", "value": "problem" },
    { "id": "feel", "label": "How do I feel about this?", "emoji": "💭", "value": "feel" },
    { "id": "worth", "label": "Is this a good use of money?", "emoji": "💰", "value": "worth" },
    { "id": "done", "label": "I'm good for now", "emoji": "✅", "value": "done" }
  ]
}`;
}

// Re-export for convenience
export { getSubPathProbing };
export type { SubPathProbing } from "../question-trees";

