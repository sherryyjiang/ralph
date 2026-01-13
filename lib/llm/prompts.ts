/**
 * LLM Prompts and Fixed Question Helpers
 * 
 * Wraps question-tree data for use in the check-in flow.
 */

import type { TransactionCategory, QuickReplyOption, Transaction, CheckInSession } from "@/lib/types";
import { 
  getShoppingFixedQuestion1, 
  shoppingExplorationGoals,
  getSubPathProbing,
  type SubPathProbing,
} from "./question-trees";

// =============================================================================
// Exploration Goals (re-exported for API route)
// =============================================================================

export interface ExplorationGoal {
  goal: string;
  probingHints: string[];
  modeIndicators: string[];
  counterProfilePatterns: string[];
}

/**
 * Exploration goals mapped by path, with flattened mode indicators
 */
export const explorationGoals: Record<string, ExplorationGoal> = Object.fromEntries(
  Object.entries(shoppingExplorationGoals).map(([key, value]) => [
    key,
    {
      goal: value.goal,
      probingHints: value.probingHints,
      modeIndicators: Object.entries(value.modeIndicators).flatMap(([mode, indicators]) => 
        indicators.map((i: string) => `${mode}: ${i}`)
      ),
      counterProfilePatterns: value.counterProfilePatterns,
    },
  ])
);

// Re-export for use in API route
export { getSubPathProbing, type SubPathProbing };

// =============================================================================
// Build System Prompt (for API route)
// =============================================================================

interface BuildSystemPromptParams {
  transaction: Transaction;
  session: CheckInSession;
  questionTreeSection?: string;
  probingTurn?: number;
  maxProbingTurns?: number;
}

export function buildSystemPrompt({ 
  transaction, 
  session, 
  questionTreeSection,
  probingTurn = 0,
  maxProbingTurns = 3,
}: BuildSystemPromptParams): string {
  // Get sub-path probing details if available
  const subPathProbing = session.path && session.subPath 
    ? getSubPathProbing(session.path, session.subPath)
    : undefined;
    
  const isLightProbing = subPathProbing?.lightProbing ?? false;
  const effectiveMaxTurns = isLightProbing ? 1 : maxProbingTurns;
  const shouldTransitionNow = probingTurn >= effectiveMaxTurns;

  // Build sub-path specific probing context
  let probingContext = "";
  if (subPathProbing && session.currentLayer === 2) {
    probingContext = `
## Sub-Path Probing Context
- Sub-path: ${subPathProbing.subPath}
- Exploration Goal: ${subPathProbing.explorationGoal}
- Light Probing: ${isLightProbing ? "Yes (1 question max)" : "No (2-3 questions)"}
- Probing Turn: ${probingTurn + 1} of ${effectiveMaxTurns}
${shouldTransitionNow ? "- READY TO TRANSITION: Assign mode and move to Layer 3" : ""}

### Probing Question Hints:
${subPathProbing.probingHints.map((h) => `- "${h}"`).join("\n")}

### Target Modes:
${subPathProbing.targetModes.map((m) => `- ${m}`).join("\n")}

### Mode Signals (look for these patterns):
${Object.entries(subPathProbing.modeSignals).map(([mode, signals]) => 
  `${mode}:\n${signals.map((s) => `  - "${s}"`).join("\n")}`
).join("\n")}

${subPathProbing.counterProfileExit ? `### Counter-Profile Exit:\n${subPathProbing.counterProfileExit}` : ""}
`;
  }

  // Build response format based on layer and probing state
  let responseFormat = "";
  if (session.currentLayer === 2) {
    if (shouldTransitionNow) {
      responseFormat = `
You have completed probing. Now you MUST:
1. Acknowledge and validate what the user shared (1 sentence)
2. Summarize what you learned about their spending pattern (1 sentence)
3. Assign a mode based on the signals you detected
4. Respond with JSON:
{
  "message": "Your acknowledgment and summary, ending with: Would you like to explore any of these?",
  "shouldTransition": true,
  "assignedMode": "#mode-id-from-target-modes",
  "options": [
    { "id": "problem", "label": "Is this a problem?", "emoji": "🤔", "value": "problem" },
    { "id": "feel", "label": "How do I feel about this?", "emoji": "💭", "value": "feel" },
    { "id": "worth", "label": "Is this a good use of money?", "emoji": "💰", "value": "worth" },
    { "id": "done", "label": "I'm good for now", "emoji": "✅", "value": "done" }
  ]
}`;
    } else {
      responseFormat = `
Continue probing with ONE follow-up question based on the probing hints above.
Listen for mode signals but don't label the user yet.
Respond with ONLY your conversational message - no JSON.

**Counter-Profile Detection**: If the user's responses suggest intentional behavior (not matching the path), 
acknowledge gracefully and respond with JSON:
{
  "message": "It sounds like this was actually more planned/intentional - that's great!",
  "exitGracefully": true
}`;
    }
  } else if (session.currentLayer === 3) {
    responseFormat = `
For Layer 3 reflection: Help the user explore their chosen question (problem, feelings, or worth).
Be warm and non-judgmental. Guide self-discovery, don't lecture.
When the reflection feels complete, respond with JSON: { "message": "...", "exitGracefully": true }`;
  }

  const basePrompt = `You are a friendly, empathetic financial coach helping users understand their spending patterns.
Your tone is warm but not judgmental - like a supportive friend who happens to be good with money.
Keep responses concise (2-3 sentences max).
Never lecture or moralize. Ask curious questions.
If the user seems defensive, validate their feelings first.

## Current Context
- Transaction: $${transaction.amount.toFixed(2)} at ${transaction.merchant}
- Category: ${transaction.category}
- Check-in Layer: ${session.currentLayer}
- Path: ${session.path || "not yet determined"}
- Sub-path: ${session.subPath || "not yet determined"}
${session.mode ? `- Assigned Mode: ${session.mode}` : ""}

${probingContext}

${questionTreeSection ? `## Additional Question Tree Context\n${questionTreeSection}` : ""}

## Response Format
${responseFormat}`;

  return basePrompt;
}

// =============================================================================
// Fixed Question 1 Options by Category
// =============================================================================

/**
 * Get Fixed Question 1 options for a given category
 */
export function getFixedQuestion1Options(category: TransactionCategory): QuickReplyOption[] {
  switch (category) {
    case "shopping":
      // Use the shopping fixed question structure
      const shoppingQ1 = getShoppingFixedQuestion1({ merchant: "", amount: 0 });
      return shoppingQ1.options;
    
    case "food":
      // Food uses awareness calibration (guess vs actual), different flow
      return [
        { id: "guess_100", label: "$100 or less", value: "100" },
        { id: "guess_200", label: "$100-200", value: "200" },
        { id: "guess_300", label: "$200-300", value: "300" },
        { id: "guess_400", label: "$300-400", value: "400" },
        { id: "guess_500", label: "$400+", value: "500" },
      ];
    
    case "coffee":
      // Coffee uses frequency calibration (count), different flow
      return [
        { id: "guess_5", label: "5 or less", value: "5" },
        { id: "guess_10", label: "6-10 times", value: "10" },
        { id: "guess_15", label: "11-15 times", value: "15" },
        { id: "guess_20", label: "16-20 times", value: "20" },
        { id: "guess_25", label: "More than 20", value: "25" },
      ];
    
    default:
      return [];
  }
}

// =============================================================================
// System Prompts for LLM
// =============================================================================

export function getSystemPrompt(category: TransactionCategory, path?: string): string {
  const basePrompt = `You are a friendly, empathetic financial coach helping users understand their spending patterns.
Your tone is warm but not judgmental - like a supportive friend who happens to be good with money.
Keep responses concise (2-3 sentences max).
Never lecture or moralize. Ask curious questions.
If the user seems defensive, validate their feelings first.

Current check-in type: ${category}`;

  if (!path) return basePrompt;

  const pathPrompts: Record<string, string> = {
    impulse: `
The user made an impulse purchase. Your goal is to:
1. Understand what triggered the spontaneous decision
2. Explore if this is a pattern (retail therapy, boredom, etc.)
3. Gently probe emotional state without being pushy

Watch for mode indicators:
- #comfort-driven-spender: mentions stress, "treat myself", emotional state
- #novelty-seeker: excited by new/trending, FOMO
- #social-spender: influenced by friends, social media`,

    deliberate: `
The user made a planned purchase. This is generally positive!
1. Validate their intentionality
2. Briefly explore their decision process
3. Move quickly to Layer 3 reflection options`,

    deal: `
The user bought because of a deal. Your goal is to:
1. Distinguish between genuine value vs. deal-induced impulse
2. Ask if they would have bought at full price
3. Explore if deal-seeking is a pattern

Watch for mode indicators:
- #deal-hunter: actively seeks discounts, buys unneeded items on sale
- #scarcity-susceptible: responds to limited time/quantity, urgency`,

    gift: `
The user bought a gift for someone else.
1. Acknowledge the thoughtfulness
2. Briefly explore gift-giving patterns
3. Move to Layer 3 unless there are signs of overspending on gifts`,

    maintenance: `
The user is restocking or replacing something.
1. Verify it's truly a necessity
2. Briefly check if there are restocking patterns
3. Move quickly to Layer 3 - this is usually fine`,
  };

  return basePrompt + (pathPrompts[path] || "");
}

// =============================================================================
// Layer 2 Probing Prompts
// =============================================================================

export function getLayer2ProbingPrompt(path: string, subPath: string, userResponse: string): string {
  const subPathProbing = getSubPathProbing(path, subPath);
  
  if (subPathProbing) {
    return `Based on the user's response: "${userResponse}"

**Exploration Goal**: ${subPathProbing.explorationGoal}

**Probing Hints** (choose one that fits):
${subPathProbing.probingHints.map((h) => `- "${h}"`).join("\n")}

Continue exploring with empathy. Ask ONE follow-up question that helps understand their spending pattern.
If you notice mode indicators, remember them but don't label the user yet.
If the user seems to be counter-profiling (their behavior doesn't match the path), 
gracefully acknowledge and adjust.

Respond with ONLY your message - no JSON, no options.`;
  }
  
  return `Based on the user's response: "${userResponse}"

Continue exploring with empathy. Ask ONE follow-up question that helps understand their spending pattern.
If you notice mode indicators, remember them but don't label the user yet.

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

// =============================================================================
// Layer 3 Reflection Prompts
// =============================================================================

export function getReflectionPrompt(reflectionType: string): string {
  const prompts: Record<string, string> = {
    problem: `The user wants to explore if this spending pattern is problematic.
Guide them through self-discovery, not judgment:
1. Ask about frequency and impact
2. Explore if it affects other goals
3. Help them define "problem" in their own terms
Never tell them they have a problem - help them decide for themselves.`,

    feel: `The user wants to explore their feelings about this purchase.
1. Validate whatever they're feeling
2. Explore the emotion behind the purchase AND how they feel now
3. Note any patterns between emotional state and spending`,

    worth: `The user wants to evaluate if this was a good use of money.
1. Avoid simple cost comparisons ("that's X cups of coffee")
2. Ask about value in THEIR terms (joy, utility, alignment with goals)
3. Explore opportunity cost gently`,

    different: `The user has their own question to explore.
Be curious about what's on their mind.
Follow their lead while gently connecting to spending awareness.`,
  };

  return prompts[reflectionType] || "";
}
