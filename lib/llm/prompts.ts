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

### REQUIRED Probing Questions (YOU MUST USE ONE OF THESE - DO NOT MAKE UP YOUR OWN):
${subPathProbing.probingHints.map((h) => `- "${h}"`).join("\n")}

### Acceptable Variations:
You may slightly adapt the question wording for natural flow, but MUST keep the core meaning.

### PROHIBITED - Do NOT ask generic questions like:
- "Can you tell me more about that?" ❌
- "What factors did you consider?" ❌
- "How did that make you feel?" ❌
- "What was going through your mind?" ❌
- "Can you elaborate on that?" ❌

### Target Modes:
${subPathProbing.targetModes.map((m) => `- ${m}`).join("\n")}

### Mode Signals (look for these patterns):
${Object.entries(subPathProbing.modeSignals).map(([mode, signals]) => 
  `${mode}:\n${signals.map((s) => `  - "${s}"`).join("\n")}`
).join("\n")}

${subPathProbing.counterProfilePatterns?.length ? `### Counter-Profile Patterns (if these show up, exit early):\n${subPathProbing.counterProfilePatterns.map((p) => `- \"${p}\"`).join("\n")}` : ""}
${subPathProbing.counterProfileExit ? `### Counter-Profile Exit Message:\n${subPathProbing.counterProfileExit}` : ""}
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

  const basePrompt = `You are Peek — a warm, curious financial companion. Think: supportive friend who's good with money.

## Tone Guidelines (FOLLOW STRICTLY)

ALWAYS:
- Start with warmth: "That makes sense...", "I hear you...", "Got it...", "Thanks for sharing..."
- Validate before probing: acknowledge their experience first
- Mirror their language: use the exact words they used
- Ask ONE question at a time
- Keep responses to 1-2 sentences max

NEVER:
- Lecture or give advice: "You should...", "Consider...", "It might be better if..."
- Judge: "That's a lot...", "That seems excessive...", "You really spent that much?"
- Be clinical: "Can you elaborate on...", "Describe the circumstances..."
- Over-explain: just ask the question, no preamble
- Force enthusiasm: minimal emojis, genuine warmth

When user shares something hard, validate first:
- "That's real..."
- "I hear you..."
- "That makes sense given..."

Then gently explore with ONE curious question.

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

/**
 * Get Fixed Question 2 options for a given category and path
 */
export function getFixedQuestion2Options(category: TransactionCategory, path: string): QuickReplyOption[] | undefined {
  if (category !== "shopping") return undefined;
  
  const q2Options: Record<string, QuickReplyOption[]> = {
    impulse: [
      { id: "price_felt_right", label: "The price felt right", emoji: "💰", value: "price_felt_right", color: "yellow" },
      { id: "treating_myself", label: "Treating myself", emoji: "🎁", value: "treating_myself", color: "yellow" },
      { id: "caught_eye", label: "Just caught my eye", emoji: "👀", value: "caught_eye", color: "yellow" },
      { id: "trending", label: "It's been trending lately", emoji: "📈", value: "trending", color: "yellow" },
      { id: "other", label: "Other/Custom", emoji: "📝", value: "other", color: "yellow" },
    ],
    deliberate: [
      { id: "afford_it", label: "Waiting until I could afford it", emoji: "💳", value: "afford_it", color: "white" },
      { id: "right_price", label: "Waiting for the right price/deal", emoji: "🏷️", value: "right_price", color: "white" },
      { id: "right_one", label: "Waiting for the right one", emoji: "✨", value: "right_one", color: "white" },
      { id: "still_wanted", label: "Letting it sit to see if I still wanted it", emoji: "⏳", value: "still_wanted", color: "white" },
      { id: "got_around", label: "Finally got around to it", emoji: "✅", value: "got_around", color: "white" },
      { id: "other", label: "Other/Custom", emoji: "📝", value: "other", color: "white" },
    ],
    deal: [
      { id: "limited_edition", label: "Limited edition or drop that is running out", emoji: "⚡", value: "limited_edition", color: "yellow" },
      { id: "sale_discount", label: "It was a good sale, deal or discount", emoji: "💸", value: "sale_discount", color: "yellow" },
      { id: "free_shipping", label: "Hit free shipping threshold or got a bonus/sample with purchase", emoji: "📦", value: "free_shipping", color: "yellow" },
    ],
    gift: [
      { id: "family", label: "Family member", emoji: "👨‍👩‍👧", value: "family", color: "white" },
      { id: "friend", label: "Friend", emoji: "👋", value: "friend", color: "white" },
      { id: "partner", label: "Partner", emoji: "💕", value: "partner", color: "white" },
      { id: "coworker", label: "Coworker", emoji: "💼", value: "coworker", color: "white" },
      { id: "other", label: "Someone else", emoji: "👤", value: "other", color: "white" },
    ],
    maintenance: [
      { id: "same_thing", label: "Got the same thing", emoji: "🔁", value: "same_thing", color: "white" },
      { id: "switched_up", label: "Switched it up", emoji: "🔄", value: "switched_up", color: "white" },
      { id: "upgraded", label: "Upgraded", emoji: "⬆️", value: "upgraded", color: "white" },
    ],
  };
  
  return q2Options[path];
}

// =============================================================================
// System Prompts for LLM
// =============================================================================

export function getSystemPrompt(category: TransactionCategory, path?: string): string {
  const basePrompt = `You are Peek — a warm, curious financial companion. Think: supportive friend who's good with money.

## Tone Guidelines (FOLLOW STRICTLY)

ALWAYS:
- Start with warmth: "That makes sense...", "I hear you...", "Got it..."
- Validate before probing: acknowledge their experience first
- Mirror their language: use the exact words they used
- Ask ONE question at a time
- Keep responses to 1-2 sentences max

NEVER:
- Lecture or give advice: "You should...", "Consider..."
- Judge: "That's a lot...", "That seems excessive..."
- Be clinical: "Can you elaborate on...", "Describe the circumstances..."
- Over-explain: just ask the question, no preamble

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

// =============================================================================
// Layer 3 Reflection Prompts
// =============================================================================

/**
 * Mode-based entry questions for "Is this a problem?" behavioral excavation
 * Based on PEEK_QUESTION_TREES.md specification
 */
const BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS: Record<string, string> = {
  "#intuitive-threshold-spender": "can you think of another time you bought something just because the price felt right?",
  "#reward-driven-spender": "can you think of another time you bought something to celebrate or reward yourself?",
  "#comfort-driven-spender": "can you think of another time you shopped because you were stressed or needed a pick-me-up?",
  "#routine-treat-spender": "can you think of another time you treated yourself as part of your regular routine?",
  "#scroll-triggered": "can you think of another time something just caught your eye while scrolling and you went for it?",
  "#in-store-wanderer": "can you think of another time something just caught your eye in a store and you went for it?",
  "#aesthetic-driven": "can you think of another time something visually appealing made you want to buy it?",
  "#duplicate-collector": "can you think of another time you bought something similar to things you already have?",
  "#trend-susceptibility-driven": "can you think of another time you bought something because everyone seemed to have it?",
  "#social-media-influenced": "can you think of another time you bought something because you saw it on social media?",
  "#friend-peer-influenced": "can you think of another time you bought something because a friend had it or recommended it?",
  "#scarcity-driven": "can you think of another time you bought something because it was running out or limited?",
  "#deal-driven": "can you think of another time a sale or deal made you go for something?",
  "#threshold-spending-driven": "can you think of another time you added stuff to hit free shipping or get a bonus?",
};

/**
 * Get the behavioral excavation entry question for a specific mode
 */
export function getBehavioralExcavationEntryQuestion(mode: string): string | undefined {
  return BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS[mode];
}

/**
 * Probing question hints for behavioral excavation (Layer 3)
 */
export const BEHAVIORAL_EXCAVATION_PROBING = {
  frequencyCheck: "does this feel like something that happens a lot, sometimes, or rarely?",
  usageCheck: "what usually happens with the stuff that slides through — do you end up using it?",
  comfortCheck: "does that sit okay with you or is there something about it that bugs you?",
  rootCause: "if it doesn't feel great, what do you think is behind that?",
  barrierExploration: "you said it bugs you but it keeps happening — what do you think gets in the way?",
};

export function getReflectionPrompt(reflectionType: string, category?: TransactionCategory): string {
  // Food-specific reflection prompts
  if (category === "food") {
    const foodPrompts: Record<string, string> = {
      problem: `The user wants to explore if their food delivery habit is problematic.
Guide them through self-discovery, not judgment:
1. Ask about frequency and when it happens most (weekdays? weekends? late nights?)
2. Explore if it affects other goals (savings, health, cooking skills)
3. Help them distinguish between "convenient choice" vs "default behavior"
4. Frame it as awareness, not restriction. Never tell them they have a problem.`,

      feel: `The user wants to explore their feelings about their food spending.
1. Validate that convenience has real value
2. Ask how they feel AFTER ordering vs before
3. Explore any guilt, satisfaction, or mixed feelings
4. Note patterns: do certain emotions trigger ordering?`,

      worth: `The user wants to evaluate if food delivery is a good use of money.
This is the ECONOMIC EVALUATION reflection for food:
1. Calculate: What else could that money buy? (But don't lecture!)
2. Frame it as "time + energy + convenience" value, not just dollars
3. Explore trade-offs: cooking time saved vs money spent
4. Ask: "If you had to pick 3 delivery orders this month, which would they be?"
5. Discuss meal prep or batch cooking as potential alternatives, not requirements`,

      different: `The user has their own question about food spending to explore.
Be curious about what's on their mind.
Common food-related concerns: health impact, time management, relationship with cooking.`,
    };
    return foodPrompts[reflectionType] || "";
  }

  // Coffee-specific reflection prompts
  if (category === "coffee") {
    const coffeePrompts: Record<string, string> = {
      problem: `The user wants to explore if their coffee/treat habit is problematic.
1. Frame frequency in context: daily coffee isn't inherently bad
2. Explore if it feels automatic vs intentional
3. Ask if they enjoy it or if it's just routine
4. Look for "treat inflation" - does one coffee become two?`,

      feel: `The user wants to explore their feelings about coffee spending.
1. Acknowledge that small treats have real emotional value
2. Explore the ritual aspect - is it the coffee or the break?
3. Note any guilt about small spending adding up`,

      worth: `The user wants to evaluate if coffee spending is worthwhile.
1. The classic "$5/day = $1,825/year" math is true but NOT helpful here
2. Instead, ask: "What does that morning coffee give you?"
3. Explore alternatives: better home setup? different routine?
4. Focus on intentionality, not elimination`,

      different: `The user has their own question about coffee/treat spending.
Be curious about what's on their mind.`,
    };
    return coffeePrompts[reflectionType] || "";
  }

  // General shopping prompts
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

// =============================================================================
// Food Check-In Specific Prompts
// =============================================================================

export function getFoodModePrompt(mode: string): string {
  const modePrompts: Record<string, string> = {
    stress: `The user identified stress/tiredness as their main driver for food delivery.
This is the #autopilot-from-stress mode. Explore:
1. What does "drained" look like for them? (long day? emotional?)
2. Is cooking the problem, or is it decision fatigue about what to eat?
3. Are there specific days/times this happens most?
4. Gently explore: has delivery become the default, even on better days?`,

    convenience: `The user identified convenience/time as their main driver.
This is the #convenience-driven mode. Explore:
1. What's creating the time pressure? (work? commute? activities?)
2. Would they cook more if they had different circumstances?
3. Is it truly time-saving, or has it become a habit?
4. Frame: delivery IS a valid choice when time is genuinely limited.`,

    planning: `The user identified lack of meal planning as their main driver.
This is the #lack-of-pre-planning mode. Explore:
1. Have they tried meal planning before? What happened?
2. Is the barrier shopping, planning, or execution?
3. What would make planning feel doable?
4. Small wins: even 2-3 planned meals can shift the pattern.`,

    craving: `The user identifies specific cravings as their driver.
This is a COUNTER-PROFILE - they're being intentional about what they want.
Acknowledge this is different from autopilot ordering.
Light reflection: is the craving happening often? Is it for variety?`,

    social: `The user identifies social eating as their driver.
This is often a reasonable choice - sharing food is bonding.
Explore: is it truly social, or just easier than coordinating cooking?`,
  };

  return modePrompts[mode] || "";
}

// =============================================================================
// Mode-Aware Reflection Prompts (Layer 3)
// =============================================================================

/**
 * Mode-based entry questions for behavioral excavation ("Is this a problem?")
 * Surface how often autopilot behavior kicks in
 */
export const behavioralExcavationEntryQuestions: Record<string, string> = {
  "#intuitive-threshold-spender": "Can you think of another time you bought something just because the price felt right?",
  "#reward-driven-spender": "Can you think of another time you bought something to celebrate or reward yourself?",
  "#comfort-driven-spender": "Can you think of another time you shopped because you were stressed or needed a pick-me-up?",
  "#routine-treat-spender": "Can you think of another time you treated yourself as part of your regular routine?",
  "#scroll-triggered": "Can you think of another time something just caught your eye online and you went for it?",
  "#in-store-wanderer": "Can you think of another time something just caught your eye in a store and you went for it?",
  "#aesthetic-driven": "Can you think of another time you bought something because it looked really appealing?",
  "#trend-susceptibility-driven": "Can you think of another time you bought something because everyone seemed to have it?",
  "#social-media-influenced": "Can you think of another time you bought something because you saw it on social media?",
  "#friend-peer-influenced": "Can you think of another time you bought something because a friend recommended it?",
  "#novelty-seeker": "Can you think of another time you bought something because it was new or trending?",
  "#social-spender": "Can you think of another time you bought something influenced by others?",
  "#scarcity-driven": "Can you think of another time you bought something because it was running out or limited?",
  "#scarcity-susceptible": "Can you think of another time you bought something because it was running out or limited?",
  "#deal-driven": "Can you think of another time a sale or deal made you go for something?",
  "#deal-hunter": "Can you think of another time a sale or deal made you go for something?",
  "#threshold-spending-driven": "Can you think of another time you added stuff to hit free shipping or get a bonus?",
  "default": "Can you think of another time you made a similar purchase?",
};

/**
 * Mode-adapted context phrases for emotional reflection
 */
export const emotionalReflectionContext: Record<string, string> = {
  "#comfort-driven-spender": "spending money shopping because you're stressed",
  "#routine-treat-spender": "spending money on these regular treats",
  "#scroll-triggered": "buying things you saw while scrolling",
  "#deal-driven": "buying things because they were on sale",
  "#deal-hunter": "buying things because they were on sale",
  "#scarcity-driven": "buying things because they're limited or running out",
  "#scarcity-susceptible": "buying things because they're limited",
  "#reward-driven-spender": "spending to celebrate or reward yourself",
  "#novelty-seeker": "buying things because they're new or trending",
  "#social-spender": "buying things influenced by others",
  "#intuitive-threshold-spender": "buying things that feel like a good price",
  "default": "this type of purchase",
};

/**
 * Get comparison example based on price tier
 */
export function getComparisonExample(amount: number): string {
  if (amount < 20) return "a nice lunch out";
  if (amount < 50) return "a month of a streaming service";
  if (amount < 100) return "a nice dinner for two";
  if (amount < 200) return "a weekend getaway fund contribution";
  if (amount < 500) return "a plane ticket";
  return "a month of savings towards a bigger goal";
}

/**
 * Get behavioral excavation prompt (Is this a problem?)
 */
export function getBehavioralExcavationPrompt(
  mode: string, 
  transaction: { merchant: string; amount: number }
): string {
  const entryQuestion = behavioralExcavationEntryQuestions[mode] || behavioralExcavationEntryQuestions.default;
  
  return `## Reflection Path: "Is this a problem?" — Behavioral Excavation

EXPLORATION GOAL:
Surface how often this autopilot behavior kicks in, and whether the user is actually using what they buy or it's piling up.

START WITH THIS MODE-BASED ENTRY QUESTION:
"${entryQuestion}"

PROBING QUESTION HINTS (use these to guide the conversation):

FREQUENCY CHECK:
• "Does this feel like something that happens a lot, sometimes, or rarely?"

USAGE/OUTCOME CHECK:
• "What usually happens with the stuff that slides through — do you end up using it?"

COMFORT CHECK (Transition to Emotional):
• "Does that sit okay with you or is there something about it that bugs you?"

ROOT CAUSE (If it bugs them):
• "If it doesn't feel great, what do you think is behind that?"

BARRIER EXPLORATION (If pattern persists):
• "You said it bugs you but it keeps happening — what do you think gets in the way?"

CONTEXT MEMORY HOOKS:
• Reference the merchant: "Does this happen more at ${transaction.merchant} specifically?"
• Reference timing: "Is this usually a weekend thing or weekday?"

IMPORTANT: Never tell them they have a problem. Help them discover patterns for themselves.`;
}

/**
 * Get emotional reflection prompt (How do I feel about this?)
 */
export function getEmotionalReflectionPrompt(
  mode: string, 
  transaction: { merchant: string; amount: number }
): string {
  const context = emotionalReflectionContext[mode] || emotionalReflectionContext.default;
  
  return `## Reflection Path: "How do I feel about this?" — Emotional Reflection

EXPLORATION GOAL:
Surface the gut reaction to this spending and help the user name why they feel any tension.

START WITH THIS ENTRY QUESTION:
"You spent $${transaction.amount.toFixed(2)} at ${transaction.merchant} — how does that land for you?"

MODE-ADAPTED FOLLOW-UP:
"Does ${context} sit well with you?"

PROBING QUESTION HINTS:

NAMING THE FEELING:
• "Is it more of a 'meh' or does it actually bother you?"
• "If you had to name what you're feeling, what would it be?"

TENSION EXPLORATION:
• "What is it about this that's creating the tension?"
• "Is it the amount, the frequency, or something else?"

VALUES ALIGNMENT:
• "Does this feel like it lines up with how you want to spend?"

IMPORTANT: Validate whatever they're feeling. This is about self-discovery, not judgment.`;
}

/**
 * Get cost comparison prompt (Is this a good use of money?)
 */
export function getCostComparisonPrompt(
  mode: string, 
  transaction: { merchant: string; amount: number }
): string {
  const comparison = getComparisonExample(transaction.amount);
  
  return `## Reflection Path: "Is this a good use of money?" — Cost Comparison

EXPLORATION GOAL:
Make abstract spending concrete through comparisons. Surface opportunity cost by showing what else the money could have been.

START WITH THIS COMPARISON FRAMING:
"You spent $${transaction.amount.toFixed(2)} at ${transaction.merchant} — that's roughly the equivalent of ${comparison}. Which one feels like a better use of money?"

PROBING QUESTION HINTS:

UTILITY/VALUE CHECK:
• "Is this something you'll get a lot of use out of?"

REGRET TEST:
• "If you had to spend that $${transaction.amount.toFixed(2)} again, would you?"

COST-PER-USE (for durable goods):
• "If you use this 10 times, that's about $${(transaction.amount / 10).toFixed(2)} per use — does that feel worth it?"

OPPORTUNITY COST:
• "What else could that money have gone toward?"

IMPORTANT: Avoid being preachy. Present comparisons neutrally and let them evaluate.`;
}

/**
 * Get open-ended reflection prompt (I have a different question)
 */
export function getOpenEndedReflectionPrompt(): string {
  return `## Reflection Path: "I have a different question" — Open-Ended

EXPLORATION GOAL:
User-directed exploration. Meet them where they are.

START WITH:
"What's on your mind?" or "What are you curious about?"

LLM BEHAVIOR:
• Listen for keywords that map to other reflection paths
• If they ask about frequency → use behavioral excavation questions
• If they express feelings → use emotional reflection questions
• If they ask about value/worth → use cost comparison questions
• If novel question → answer directly and offer to continue

IMPORTANT: Follow their lead while gently connecting back to spending awareness.`;
}

/**
 * Get mode-aware reflection prompt for Layer 3
 */
export function getModeAwareReflectionPrompt(
  reflectionType: string,
  mode: string,
  transaction: { merchant: string; amount: number }
): string {
  switch (reflectionType) {
    case "problem":
      return getBehavioralExcavationPrompt(mode, transaction);
    case "feel":
      return getEmotionalReflectionPrompt(mode, transaction);
    case "worth":
      return getCostComparisonPrompt(mode, transaction);
    case "different":
      return getOpenEndedReflectionPrompt();
    default:
      return `Help the user explore their thoughts about this purchase in a supportive, non-judgmental way.`;
  }
}
