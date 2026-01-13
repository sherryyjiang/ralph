# LLM Probing Adherence Specification

> **Purpose:** Ensure Gemini follows probing hints from question trees  
> **Updated:** 2026-01-13

---

## Problem Statement

The LLM is generating generic questions instead of using the specific probing hints from `PEEK_QUESTION_TREES.md`.

**Example:**
- User selected: "Waiting for the right one" (deliberate → right_one)
- Expected: "Where did you go for your research?" or "Where did you end up finding it?"
- Actual: "What was it about this particular item that made it feel like the right one?"

The actual question is too generic and doesn't follow the spec.

---

## Solution: Directive Prompting

Instead of providing probing hints as "suggestions," make them **required** and **explicit**.

### Before (Current)

```
Probing Hints (use these to guide your questions):
- Where did you go for your research?
- Where did you end up finding it?
- How long did you spend looking?
```

### After (Fixed)

```
REQUIRED PROBING QUESTIONS - You MUST use these exact questions or very close variations:

1. "Where did you go for your research?"
2. "Where did you end up finding it?"
3. "How long did you spend looking?"

IMPORTANT: Do NOT generate your own questions. Pick from the list above.
If the user's response naturally leads to one of these, use that one.
If unsure, use question #1 first.
```

---

## Implementation

### In lib/llm/prompts.ts

Update `getSubPathProbing` to return stricter prompt format:

```typescript
export function getSubPathProbing(path: string, subPath: string): string {
  const hints = getExplorationGoals(path, subPath);
  
  if (!hints || hints.length === 0) {
    return "";
  }
  
  return `
## REQUIRED PROBING QUESTIONS

You MUST use these exact questions or very close variations. Do NOT make up your own questions.

${hints.map((h, i) => `${i + 1}. "${h}"`).join("\n")}

### How to use these:
- Start with question #1 if the user just answered Fixed Q2
- If user's response naturally leads to another question in the list, use that one
- Ask ONE question at a time
- After asking 2-3 questions from this list, you may transition to reflection

### Questions to AVOID (too generic):
- "What made you decide to buy this?"
- "Can you tell me more about that?"
- "What was it about this item that..."
- "How did that make you feel?"

These are too vague. Use the SPECIFIC questions above.
`;
}
```

### In app/api/chat/route.ts

Update `buildSystemPromptWithModeAssignment` to emphasize probing hints:

```typescript
function buildSystemPromptWithModeAssignment(
  category: string,
  path: string,
  subPath: string,
  assignedMode: string | null,
  currentLayer: number,
  conversationContext: Message[]
): string {
  const basePrompt = buildSystemPrompt(category);
  const toneGuidelines = getToneGuidelines(); // From AI_TONE_GUIDELINES.md
  
  // Get probing hints with stricter formatting
  const probingSection = getSubPathProbing(path, subPath);
  
  // Build context from conversation
  const contextSummary = summarizeConversation(conversationContext);
  
  return `
${basePrompt}

${toneGuidelines}

## Current Context
- Category: ${category}
- Path: ${path}
- Sub-path: ${subPath}
- Assigned Mode: ${assignedMode || "not yet assigned"}
- Current Layer: ${currentLayer}

## Conversation So Far
${contextSummary}

${probingSection}

## Your Task
Continue the conversation by asking ONE of the required probing questions above.
Keep your response to 1-2 sentences max.
Start with warmth, then ask the question.
`;
}
```

---

## Probing Hints by Path

### Shopping: Impulse Paths

**price_felt_right** (impulse → price_felt_right)
```
1. "Did you check the price before or after deciding you wanted it?"
2. "Was there a moment where the price almost made you pause?"
3. "Do you remember what made the price feel okay in the moment?"
```

**treating_myself** (impulse → treating_myself)
```
1. "What was going on that day that made you want to treat yourself?"
2. "Was there something specific that triggered that feeling?"
3. "Is treating yourself something you do often, or was this more of a one-off?"
```

**caught_eye** (impulse → caught_eye)
```
1. "Where did you first see it — in store, online, on social?"
2. "What was it about this specific item that grabbed you?"
3. "Did you consider any alternatives, or was it just this one?"
```

**trending** (impulse → trending)
```
1. "Where did you see this trending — social media, friends, somewhere else?"
2. "Do you usually keep up with trends, or was this different?"
3. "Is this more of a 'want to fit in' thing or a 'I actually like this' thing?"
```

### Shopping: Deliberate Paths

**afford_it** (deliberate → afford_it)
```
1. "How long were you waiting to pull the trigger?"
2. "What finally made it feel like the right time?"
3. "Did you set aside money specifically for this, or just wait until you had room?"
```

**right_price** (deliberate → right_price)
```
1. "How long were you tracking the price?"
2. "What price would have been 'too much'?"
3. "Do you have a system for tracking deals, or was this more casual?"
```

**right_one** (deliberate → right_one)
```
1. "Where did you go for your research?"
2. "Where did you end up finding it?"
3. "How long did you spend looking?"
```

**still_wanted** (deliberate → still_wanted)
```
1. "How long did you let it sit?"
2. "What made you finally decide to go for it?"
3. "Did your excitement change during the wait, or stay the same?"
```

**got_around** (deliberate → got_around)
```
1. "How long was this on your to-do list?"
2. "What kept bumping it down the priority list?"
3. "What finally made you do it now?"
```

### Shopping: Deal Paths

**deal** (deal → any)
```
1. "How did you find out about the sale?"
2. "Were you planning to buy this anyway, or did the deal trigger it?"
3. "What would you have done if there was no sale?"
```

---

## Negative Examples (What NOT to Generate)

These are examples of overly generic questions the LLM tends to generate:

```
❌ "What was it about this particular item that made it feel like the right one?"
❌ "Can you tell me more about your decision-making process?"
❌ "How did you feel when you made the purchase?"
❌ "What factors did you consider?"
❌ "Was there anything else that influenced your decision?"
❌ "Could you elaborate on that?"
```

**Why these are bad:**
- They don't reveal specific behavioral patterns
- They feel like therapy questions, not friendly curiosity
- They don't follow the conversational structure we designed
- They miss the opportunity to uncover blindspots

---

## Testing Adherence

### Manual Test

1. Start a shopping check-in
2. Select "deliberate" → "Waiting for the right one"
3. Verify the first LLM question is one of:
   - "Where did you go for your research?"
   - "Where did you end up finding it?"
   - "How long did you spend looking?"
4. Answer the question
5. Verify the next question is from the same list (or a natural follow-up)

### Automated Test

```typescript
describe("LLM Probing Adherence", () => {
  it("uses correct probing questions for right_one path", async () => {
    const response = await callLLM({
      category: "shopping",
      path: "deliberate",
      subPath: "right_one",
      userMessage: "Yeah, I did a lot of research first",
    });
    
    const expectedQuestions = [
      "Where did you go for your research",
      "Where did you end up finding it",
      "How long did you spend looking",
    ];
    
    const containsExpectedQuestion = expectedQuestions.some(q => 
      response.message.toLowerCase().includes(q.toLowerCase())
    );
    
    expect(containsExpectedQuestion).toBe(true);
  });
});
```

---

## Related Files

- `lib/llm/prompts.ts` — Probing prompt construction
- `lib/llm/question-trees.ts` — Exploration goals data
- `app/api/chat/route.ts` — System prompt assembly
- `PEEK_QUESTION_TREES.md` — Source of truth for probing hints

