/**
 * Layer 3 Reflection Prompt Builders
 * 
 * Builds LLM prompts for reflection paths. All data is sourced from question-trees/reflection.ts.
 */

import type { ReflectionPathType } from "@/lib/llm/question-trees/types";
import {
  getReflectionPathProbing,
  getComparisonExample,
  getCostComparisonModeAdaptedQuestion,
} from "@/lib/llm/question-trees/reflection";

// =============================================================================
// Prompt Builders
// =============================================================================

interface TransactionContext {
  merchant: string;
  amount: number;
}

/**
 * Build the Layer 3 reflection prompt for a given path and mode.
 * This is the main entry point used by route.ts.
 */
export function buildReflectionPrompt(
  reflectionPath: ReflectionPathType,
  mode: string | undefined,
  transaction: TransactionContext
): string {
  switch (reflectionPath) {
    case "problem":
      return buildBehavioralExcavationPrompt(mode, transaction);
    case "feel":
      return buildEmotionalReflectionPrompt(mode, transaction);
    case "worth":
      return buildCostComparisonPrompt(mode, transaction);
    case "different":
      return buildOpenEndedPrompt();
    default:
      return buildBehavioralExcavationPrompt(mode, transaction);
  }
}

/**
 * "Is this a problem?" - Behavioral Excavation
 */
function buildBehavioralExcavationPrompt(
  mode: string | undefined,
  transaction: TransactionContext
): string {
  const { probing, entryQuestion, evaluationPhrase } = getReflectionPathProbing("problem", mode);

  return `## BEHAVIORAL EXCAVATION PATH ("Is this a problem?")

**Goal**: ${probing.explorationGoal}

YOUR FIRST MESSAGE MUST BE EXACTLY:
"${entryQuestion}"

DO NOT substitute with a generic question like "What comes to mind?" or "That's a great question."

**Probing Hints** (use progressively after entry):
${probing.probingHints.map((h, i) => `${i + 1}. "${h}"`).join("\n")}

**Context Hooks** (use info from the transaction):
- Merchant: "does this happen more at ${transaction.merchant} specifically?"
- Timing: "is this usually more of a weekday thing or weekend thing?"

${evaluationPhrase ? `**Mode Context**: This user tends to ${evaluationPhrase}.\n` : ""}
**Guidelines**:
- Never tell them they have a problem — help them discover for themselves
- If they say it's fine, validate and don't push
- If they show concern, explore gently without judgment`;
}

/**
 * "How do I feel about this?" - Emotional Reflection
 */
function buildEmotionalReflectionPrompt(
  mode: string | undefined,
  transaction: TransactionContext
): string {
  const { probing, evaluationPhrase } = getReflectionPathProbing("feel", mode);
  const sitWellQuestion = evaluationPhrase
    ? `does ${evaluationPhrase} sit well with you?`
    : "does this sit well with you?";

  return `## EMOTIONAL REFLECTION PATH ("How do I feel about this?")

**Goal**: ${probing.explorationGoal}

YOUR FIRST MESSAGE MUST BE:
"you spent $${transaction.amount.toFixed(2)} at ${transaction.merchant} — how does that land for you?"

**Mode-Adapted Follow-up** (use after their initial response):
"${sitWellQuestion}"

**Probing Hints**:
${probing.probingHints.map((h, i) => `${i + 1}. "${h}"`).join("\n")}

**Guidelines**:
- Validate whatever they're feeling first
- If they seem neutral ("meh"), that's fine — don't push
- If they express concern, explore what specifically bothers them`;
}

/**
 * "Is this a good use of money?" - Cost Comparison
 */
function buildCostComparisonPrompt(
  mode: string | undefined,
  transaction: TransactionContext
): string {
  const { probing } = getReflectionPathProbing("worth", mode);
  const comparison = getComparisonExample(transaction.amount);
  const modeQuestion = mode ? getCostComparisonModeAdaptedQuestion(mode, transaction.amount) : undefined;

  return `## COST COMPARISON PATH ("Is this a good use of money?")

**Goal**: ${probing.explorationGoal}

YOUR FIRST MESSAGE MUST BE:
"you spent $${transaction.amount.toFixed(2)} at ${transaction.merchant} — that's roughly the equivalent of ${comparison}. which one feels like a better use of money?"

${modeQuestion ? `**Mode-Adapted Question** (use when relevant):\n"${modeQuestion}"\n` : ""}
**Probing Hints**:
${probing.probingHints.map((h, i) => `${i + 1}. "${h.replace("${price}", transaction.amount.toFixed(2))}"`).join("\n")}

**Cost-Per-Use** (for durable goods):
"if you use this 10 times, that's about $${(transaction.amount / 10).toFixed(2)} per use — does that feel worth it?"

**Guidelines**:
- Keep it neutral (no shame, no lecturing)
- Ask about value in THEIR terms (joy, utility, alignment with goals)`;
}

/**
 * "I have a different question" - Open-Ended
 */
function buildOpenEndedPrompt(): string {
  const { probing } = getReflectionPathProbing("different");

  return `## OPEN-ENDED PATH ("I have a different question")

**Goal**: ${probing.explorationGoal}

YOUR FIRST MESSAGE MUST BE:
"what's on your mind?" or "what are you curious about?"

**LLM Behavior**:
${probing.probingHints.map((h) => `- ${h}`).join("\n")}

**Guidelines**:
- Follow their lead, stay warm and concise
- If their question maps to another path, smoothly pivot`;
}
