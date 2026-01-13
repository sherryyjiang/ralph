# Ralph Iteration 3: Fix Shopping Question Tree Logic

> **Created:** 2026-01-13  
> **Goal:** Align shopping check-in flow precisely with `docs/question-trees/shopping-check-in.md` specification
> **Baseline:** Commit `dad1414` (Iteration 2 complete)

---

## Overview

The shopping check-in logic has drifted from the specification. This iteration focuses on:
1. Aligning Fixed Q1 → Q2 question mapping exactly with the spec
2. Ensuring Q2 options are fixed (not freeform) for each path
3. Fixing mode IDs - removing "base mode" concept (modes are flat, not hierarchical)
4. Adding missing modes and counter-profiles
5. Fixing the `getFixedQuestion2Options` function which references undefined variables
6. Adding Layer 3 Reflection path logic
7. Adding comprehensive tests

---

## Problem Analysis

### Current Issues in `lib/llm/question-trees.ts`

#### Issue 1: Fixed Q1 Missing "Other/Custom" Option
**Spec says:** 6 options (impulse, deliberate, deal/scarcity, gift, maintenance, other/custom)
**Current:** Only 5 options (missing other/custom)

#### Issue 2: Q1 → Q2 Question Mapping Missing
**Spec says:** Each Q1 response leads to a SPECIFIC Q2 question:
- "Saw it and bought it in the moment" → **"What made you go for it?"**
- "Been thinking about this for a while" → **"What were you waiting for?"**
- "A good deal/discount or limited drop made me go for it" → **"Tell me more about the deal, discount or limited event?"**
- "Bought it for someone else" → **"Who was it for?"** (light probing)
- "Restocking or replacing" → **"Did you get the same thing or switched it up?"** (light probing)

**Current:** Q2 question text is not explicitly mapped to Q1 response.

#### Issue 3: Q2 Options Are Fixed (NOT Freeform)
**Spec says:** Each Q2 question has FIXED options, not freeform chat:

**Impulse Path Q2 Options** (for "What made you go for it?"):
| Option | Label |
|--------|-------|
| `price_felt_right` | "the price felt right" |
| `treating_myself` | "treating myself" |
| `caught_eye` | "just caught my eye" |
| `trending` | "it's been trending lately" |
| `other` | Other/Custom |

**Deal Path Q2 Options** (for "Tell me more about the deal..."):
| Option | Label |
|--------|-------|
| `limited_edition` | "limited edition or drop that is running out" |
| `sale_discount` | "it was a good sale, deal or discount" |
| `free_shipping` | "hit free shipping threshold or got a bonus/sample with purchase" |

**Current:** Some paths incorrectly use freeform or auto-generate labels from keys.

#### Issue 4: "Base Mode" Concept Should Not Exist
**Spec says:** Modes are FLAT, not hierarchical. The tags in the diagrams (e.g., `#price-sensitivity-driven`, `#self-reward-driven`) are just exploration tags, NOT modes.

The ACTUAL modes are assigned after LLM probing:
- `#scroll-triggered` (NOT a submode of `#visual-impulse-driven`)
- `#in-store-wanderer` (NOT a submode)
- `#aesthetic-driven` (NOT a submode)
- etc.

**Current:** Code treats some as "base modes" with "submodes" - this is wrong.

#### Issue 5: `getFixedQuestion2Options` References Undefined Variables
**Bug:** Function references `impulseSubPathGoals`, `deliberateSubPathGoals`, `dealSubPathGoals` which don't exist.
**Correct names:** `impulseSubPathProbing`, `deliberateSubPathProbing`, `dealSubPathProbing`

#### Issue 6: Missing Layer 3 Reflection Logic
**Spec says:** After mode assignment, Layer 3 offers 5 reflection paths:
1. "Is this a problem?" — Behavioral Excavation
2. "How do I feel about this?" — Emotional Reflection
3. "Is this a good use of money?" — Cost Comparison
4. "I have a different question" — Open-Ended
5. "I'm good for now" — Exit

**Current:** Reflection logic exists but may not match spec exactly.

#### Issue 7: Probing Turn Limits Need Verification

**Spec says:** (from `docs/question-trees/shopping-check-in.md`)
| Path Type | Probing Depth | Max Questions |
|-----------|---------------|---------------|
| Impulse (YELLOW) | Deep | 2-3 |
| Deal (YELLOW) | Moderate | 2-3 |
| Deliberate (WHITE) | Light | 1 |
| Gift (WHITE) | Light | 1 |
| Maintenance (WHITE) | Light | 1 |

**Current Implementation** (`lib/llm/prompts.ts` lines 58-72):
```typescript
probingTurn = 0,           // Current turn (0-indexed)
maxProbingTurns = 3,       // Default for yellow paths

const isLightProbing = subPathProbing?.lightProbing ?? false;
const effectiveMaxTurns = isLightProbing ? 1 : maxProbingTurns;
const shouldTransitionNow = probingTurn >= effectiveMaxTurns;
```

**What needs verification:**
- `lightProbing: true` is set on all deliberate/gift/maintenance sub-paths ✓
- BUT it's NOT set on impulse/deal sub-paths (relies on default `maxProbingTurns = 3`)
- Need to verify the LLM actually respects these limits and transitions when told
- Need to ensure `probingTurn` is properly tracked and passed to each call

**Potential gaps:**
- The `probingTurn` counter needs to be managed in the session state and incremented correctly
- Deal path should potentially be 2-3 questions (moderate), but currently uses same logic as impulse
- Need explicit instructions for when to transition (after 2nd question vs 3rd)

---

## Reference: Shopping Spec Summary

### Layer 1: Orientation (Two Fixed Question Sets)

#### Fixed Q1: "When you bought this, were you..."

| Option | Label | Color | Route to Q2 |
|--------|-------|-------|-------------|
| `impulse` | Saw it and bought it in the moment | YELLOW | → "What made you go for it?" |
| `deliberate` | Been thinking about this for a while | WHITE | → "What were you waiting for?" |
| `deal` | A good deal/discount or limited drop made me go for it | YELLOW | → "Tell me more about the deal, discount or limited event?" |
| `gift` | Bought it for someone else | WHITE | → "Who was it for?" |
| `maintenance` | Restocking or replacing, ran out or wore out | WHITE | → "Did you get the same thing or switched it up?" |
| `other` | Other/Custom | WHITE | → Open exploration |

#### Fixed Q2 Questions and Options Per Path

**Q2A: Impulse Path — "What made you go for it?"**
| Option ID | Label | Exploration Tag | Target Mode After Probing |
|-----------|-------|-----------------|---------------------------|
| `price_felt_right` | "the price felt right" | #price-sensitivity-driven | `#intuitive-threshold-spender` |
| `treating_myself` | "treating myself" | #self-reward-driven | → ONE OF: `#reward-driven-spender`, `#comfort-driven-spender`, `#routine-treat-spender` |
| `caught_eye` | "just caught my eye" | #visual-impulse-driven | → ONE OF: `#scroll-triggered`, `#in-store-wanderer`, `#aesthetic-driven`, `#duplicate-collector`, `#exploration-hobbyist` |
| `trending` | "it's been trending lately" | #trend-susceptibility-driven | → ONE OF: `#social-media-influenced`, `#friend-peer-influenced` |
| `other` | Other/Custom | — | → LLM determines |

**Q2B: Deliberate Path — "What were you waiting for?"**
| Option ID | Label | Target Mode |
|-----------|-------|-------------|
| `afford_it` | "waiting until I could afford it" | `#deliberate-budget-saver` |
| `right_price` | "waiting for the right price/deal" | `#deliberate-deal-hunter` |
| `right_one` | "waiting for the right one" | `#deliberate-researcher` |
| `still_wanted` | "letting it sit to see if I still wanted it" | `#deliberate-pause-tester` |
| `got_around` | "finally got around to it" | `#deliberate-low-priority` |
| `other` | Other/Custom | → LLM determines |

**Q2C: Deal/Scarcity Path — "Tell me more about the deal, discount or limited event?"**
| Option ID | Label | Target Mode |
|-----------|-------|-------------|
| `limited_edition` | "limited edition or drop that is running out" | `#scarcity-driven` |
| `sale_discount` | "it was a good sale, deal or discount" | `#deal-driven` |
| `free_shipping` | "hit free shipping threshold or got a bonus/sample with purchase" | `#threshold-spending-driven` |

**Q2D: Gift Path — "Who was it for?"**
| Option ID | Label | Target Mode |
|-----------|-------|-------------|
| `family` | Family member | `#gift-giver` |
| `friend` | Friend | `#gift-giver` |
| `partner` | Partner | `#gift-giver` |
| `coworker` | Coworker | `#gift-giver` |
| `other` | Someone else | `#gift-giver` |

**Q2E: Maintenance Path — "Did you get the same thing or switched it up?"**
| Option ID | Label | Target Mode |
|-----------|-------|-------------|
| `same_thing` | Got the same thing | `#loyal-repurchaser` |
| `switched_up` | Switched it up | `#brand-switcher` |
| `upgraded` | Upgraded | `#upgrader` |

### Complete Mode Reference (FLAT - No Hierarchy)

All modes are equal-level. There are NO "base modes" or "submodes".

#### From Impulse Path
| Q2 Option | Possible Modes (after probing) |
|-----------|-------------------------------|
| `price_felt_right` | `#intuitive-threshold-spender` |
| `treating_myself` | `#reward-driven-spender`, `#comfort-driven-spender`, `#routine-treat-spender` |
| `caught_eye` | `#scroll-triggered`, `#in-store-wanderer`, `#aesthetic-driven`, `#duplicate-collector`, `#exploration-hobbyist` |
| `trending` | `#social-media-influenced`, `#friend-peer-influenced` |

#### From Deal/Scarcity Path
| Q2 Option | Mode |
|-----------|------|
| `limited_edition` | `#scarcity-driven` |
| `sale_discount` | `#deal-driven` |
| `free_shipping` | `#threshold-spending-driven` |

#### From Deliberate Path (Light Probing)
| Q2 Option | Mode |
|-----------|------|
| `afford_it` | `#deliberate-budget-saver` |
| `right_price` | `#deliberate-deal-hunter` |
| `right_one` | `#deliberate-researcher` |
| `still_wanted` | `#deliberate-pause-tester` |
| `got_around` | `#deliberate-low-priority` |

#### From Gift Path (Light Probing)
- `#gift-giver` (with optional sub-tags: `#planned-gift`, `#spontaneous-gift`)

#### From Maintenance Path (Light Probing)
- `#loyal-repurchaser`
- `#brand-switcher`
- `#upgrader`

### Counter-Profiles (Exit Ramps)
| Counter-Profile | Patterns | Exit Message |
|-----------------|----------|--------------|
| `intentional-collector` | "I collect these", "adding to my collection", "I would've bought this anyway" | "Sounds like this is part of an intentional collection — that's different from impulse buying!" |
| `trend-but-fits-me` | User confirms "it's me" when asked "is it you or more of a trend buy?" | "Sounds like it really fits your style — nothing wrong with hopping on a trend that's actually you!" |
| `deal-assisted-intentional` | "I was waiting for it to go on sale", "I'd been eyeing it" | "Smart! Waiting for a deal on something you already wanted is solid financial sense." |
| `no-clear-threshold` | Can't name a price threshold, price wasn't the real reason | "Hmm, sounds like price wasn't really the driver here. Let me ask a different question..." → reroute to `treating_myself` |

---

## Layer 3: Reflection (User-Directed)

After mode assignment, users choose how to explore their behavior:

### Reflection Options
| Option | Path | Description |
|--------|------|-------------|
| `problem` | Behavioral Excavation | "Is this a problem?" |
| `feel` | Emotional Reflection | "How do I feel about this?" |
| `worth` | Cost Comparison | "Is this a good use of money?" |
| `different` | Open-Ended | "I have a different question" |
| `done` | Exit | "I'm good for now" |

### Reflection Path 1: "Is this a problem?" — Behavioral Excavation

**Exploration Goal:** Surface how often autopilot behavior kicks in, and whether the user is using what they buy or it's piling up.

**Mode-Based Entry Questions:**
| Mode | Entry Question |
|------|----------------|
| `#intuitive-threshold-spender` | "can you think of another time you bought something just because the price felt right?" |
| `#reward-driven-spender` | "can you think of another time you bought something to celebrate or reward yourself?" |
| `#comfort-driven-spender` | "can you think of another time you shopped because you were stressed or needed a pick-me-up?" |
| `#routine-treat-spender` | "can you think of another time you treated yourself as part of your regular routine?" |
| `#scroll-triggered`, `#in-store-wanderer`, `#aesthetic-driven`, `#duplicate-collector`, `#exploration-hobbyist` | "can you think of another time something just caught your eye and you went for it?" |
| `#social-media-influenced`, `#friend-peer-influenced` | "can you think of another time you bought something because everyone seemed to have it?" |
| `#scarcity-driven` | "can you think of another time you bought something because it was running out or limited?" |
| `#deal-driven` | "can you think of another time a sale or deal made you go for something?" |
| `#threshold-spending-driven` | "can you think of another time you added stuff to hit free shipping or get a bonus?" |

**Probing Question Hints:**
- FREQUENCY CHECK: "does this feel like something that happens a lot, sometimes, or rarely?"
- USAGE/OUTCOME CHECK: "what usually happens with the stuff that slides through — do you end up using it?"
- COMFORT CHECK: "does that sit okay with you or is there something about it that bugs you?"
- ROOT CAUSE: "if it doesn't feel great, what do you think is behind that?"
- BARRIER EXPLORATION: "you said it bugs you but it keeps happening — what do you think gets in the way?"
- CONTEXT HOOKS: "does this happen more at {merchant} specifically?", "is this usually a {day of week} thing?"

### Reflection Path 2: "How do I feel about this?" — Emotional Reflection

**Exploration Goal:** Surface gut reaction to spending. Help user name the tension they feel.

**Entry:** "you spent ${price} on {item} — how does that land for you?"

**Mode-Aware Question Adaptation:**
| Mode | Adapted Question |
|------|------------------|
| `#comfort-driven-spender` | "does spending money shopping because you're stressed sit well with you?" |
| `#routine-treat-spender` | "does spending money on these regular treats sit well with you?" |
| `#aesthetic-driven` | "does buying things just because they caught your eye sit well with you?" |
| `#deal-driven` | "does buying things because they were on sale sit well with you?" |

**Probing Question Hints:**
- NAMING THE FEELING: "is it more of a 'meh' or does it actually bother you?", "if you had to name what you're feeling, what would it be?"
- TENSION EXPLORATION: "what is it about this that's creating the tension?", "is it the amount, the frequency, or something else?"
- VALUES ALIGNMENT: "does this feel like it lines up with how you want to spend?"

### Reflection Path 3: "Is this a good use of money?" — Cost Comparison

**Exploration Goal:** Make abstract spending concrete through comparisons. Surface opportunity cost.

**Entry:** "you spent ${price} on {item} — that's the equivalent of {other item}. which one feels like a better use of money?"

**Mode-Aware Question Adaptation:**
| Mode | Adapted Question |
|------|------------------|
| `#threshold-spending-driven` | "was adding those extra items to hit free shipping worth the ${X} you spent?" |
| `#scarcity-driven` | "if that limited drop came back, would you buy it again at ${price}?" |
| `#reward-driven-spender` | "is this reward something you'll get a lot of use out of?" |

**Probing Question Hints:**
- UTILITY/VALUE CHECK: "is this something you'll get a lot of use out of?"
- REGRET TEST: "if you had to spend that ${price} again, would you?"
- COST-PER-USE: "if you use this {X times}, that's about ${Y} per use — does that feel worth it?"

### Reflection Path 4: "I have a different question" — Open-Ended

**Entry:** "what's on your mind?" or "what are you curious about?"

**LLM Behavior:**
- Listen for keywords that map to other reflection paths
- If they ask about frequency → route to Behavioral Excavation
- If they express feelings → route to Emotional Reflection
- If they ask about value/worth → route to Cost Comparison
- If novel question → answer directly and offer to continue

### Reflection Path 5: "I'm good for now" — Exit

**Responses:**
- "got it — thanks for walking through this with me."
- "cool, we can always pick this up later if something comes up."
- (If mode was assigned): "i'll keep an eye on this pattern and check in if i notice it happening again."

---

## Success Criteria

### Phase A: Fix Core Data Structures

1. [ ] Add `other` option to `getShoppingFixedQuestion1` options array
2. [ ] Remove "base mode" concept - all modes are flat (no `#visual-impulse-driven` as parent)
3. [ ] Update `shoppingExplorationGoals` to use exploration TAGS (not modes)
4. [ ] Fix `getFixedQuestion2Options` to use correct variable names (`*SubPathProbing`)
5. [ ] Add Q2 question text mapping (Q1 response → specific Q2 question)

### Phase B: Fix Fixed Q2 Options and Labels

6. [ ] Impulse Q2: question = "What made you go for it?", options = price_felt_right, treating_myself, caught_eye, trending, other
7. [ ] Deliberate Q2: question = "What were you waiting for?", options = afford_it, right_price, right_one, still_wanted, got_around, other
8. [ ] Deal Q2: question = "Tell me more about the deal, discount or limited event?", options = limited_edition, sale_discount, free_shipping
9. [ ] Gift Q2: question = "Who was it for?", options = family, friend, partner, coworker, other
10. [ ] Maintenance Q2: question = "Did you get the same thing or switched it up?", options = same_thing, switched_up, upgraded

### Phase C: Fix Mode Definitions (Flat, No Hierarchy)

11. [ ] Remove `#visual-impulse-driven` as a mode - it's only an exploration TAG
12. [ ] Remove `#trend-susceptibility-driven` as a mode - it's only an exploration TAG
13. [ ] Ensure all modes are flat: `#scroll-triggered`, `#in-store-wanderer`, `#aesthetic-driven`, etc.
14. [ ] Update `targetModes` in all SubPathProbing to list only actual modes

### Phase D: Add Counter-Profiles

15. [ ] Add `intentional-collector` counter-profile with patterns and exit message
16. [ ] Add `trend-but-fits-me` counter-profile with patterns and exit message
17. [ ] Add `deal-assisted-intentional` counter-profile with patterns and exit message
18. [ ] Add `no-clear-threshold` counter-profile with reroute logic

### Phase E: Add Layer 3 Reflection Logic

19. [ ] Implement reflection option routing (problem, feel, worth, different, done)
20. [ ] Add mode-based entry questions for Behavioral Excavation
21. [ ] Add mode-aware question adaptation for Emotional Reflection
22. [ ] Add mode-aware question adaptation for Cost Comparison
23. [ ] Add probing hints for each reflection path
24. [ ] Implement graceful exit messages

### Phase F: Update prompts.ts to Align

25. [ ] Update `getFixedQuestion2Options` to return both question text AND options
26. [ ] Update mode indicators to use only flat modes (not exploration tags)
27. [ ] Add reflection path prompts

### Phase G: Probing Turn Limits

28. [ ] Verify `lightProbing: true` is set on ALL deliberate sub-paths
29. [ ] Verify `lightProbing: true` is set on ALL gift sub-paths
30. [ ] Verify `lightProbing: true` is set on ALL maintenance sub-paths
31. [ ] Verify impulse sub-paths have `lightProbing: false` or undefined (defaults to 2-3)
32. [ ] Verify deal sub-paths have `lightProbing: false` or undefined (defaults to 2-3)
33. [ ] Add `maxProbingTurns` to SubPathProbing interface for explicit control
34. [ ] Update prompt to tell LLM exactly when to transition based on turn count
35. [ ] Verify `probingTurn` is tracked in session state and incremented on each LLM response

### Phase H: Testing

36. [ ] Create `__tests__/shopping-flow.test.ts` with Q1 → Q2 mapping tests
37. [ ] Add Q2 options tests for each path
38. [ ] Add mode assignment tests (flat modes only)
39. [ ] Add counter-profile detection tests
40. [ ] Add reflection path routing tests
41. [ ] Add probing turn limit tests (verify lightProbing = 1 turn, default = 2-3 turns)
42. [ ] Run all tests: `pnpm test shopping-flow`

---

## Implementation Details

### Fix 1: Q2 Question + Options Structure

**File:** `lib/llm/question-trees.ts`

```typescript
// New interface for Q2 that includes both question and options
export interface FixedQuestion2 {
  question: string;
  options: QuickReplyOption[];
}

// Q2 questions mapped to Q1 responses
export const SHOPPING_Q2_QUESTIONS: Record<string, string> = {
  impulse: "What made you go for it?",
  deliberate: "What were you waiting for?",
  deal: "Tell me more about the deal, discount or limited event?",
  gift: "Who was it for?",
  maintenance: "Did you get the same thing or switched it up?",
};

export function getShoppingFixedQuestion2(path: string): FixedQuestion2 | null {
  const question = SHOPPING_Q2_QUESTIONS[path];
  if (!question) return null;
  
  const options = getFixedQuestion2Options("shopping", path);
  if (!options) return null;
  
  return { question, options };
}
```

### Fix 2: Remove Base Mode Concept

**File:** `lib/llm/question-trees.ts`

```typescript
// WRONG - treating these as "base modes" with "submodes"
targetModes: [
  "#visual-impulse-driven",  // ❌ This is an exploration TAG, not a mode
  "#scroll-triggered",
  "#in-store-wanderer",
  // ...
],

// CORRECT - flat list of actual modes only
targetModes: [
  "#scroll-triggered",
  "#in-store-wanderer",
  "#aesthetic-driven",
  "#duplicate-collector",
  "#exploration-hobbyist",
],
```

### Fix 3: Update impulseSubPathProbing

```typescript
export const impulseSubPathProbing: Record<string, SubPathProbing> = {
  price_felt_right: {
    subPath: "price_felt_right",
    explorationTag: "#price-sensitivity-driven",  // This is a TAG, not a mode
    explorationGoal: "Understand their internal price threshold around 'reasonable' to justify purchases",
    probingHints: [
      "What price did you get it for?",
      "What price would've made you pause?",
      "Do things under $X usually feel like a no-brainer for you?",
    ],
    targetModes: ["#intuitive-threshold-spender"],  // Only actual modes
    modeSignals: {
      "#intuitive-threshold-spender": [
        "saw it, wanted it, bought it",
        "the price felt right",
        "clear mental threshold around price",
      ],
    },
    counterProfilePatterns: ["I don't really have a price threshold"],
  },
  
  treating_myself: {
    subPath: "treating_myself",
    explorationTag: "#self-reward-driven",
    explorationGoal: "What triggered the need for reward/treat? Is it tied to an event, emotion, or habit?",
    probingHints: [
      "What were you treating yourself for?",
      "Was it tied to something or more of a random mood?",
      "Do you just enjoy shopping as a fun activity?",
    ],
    targetModes: [
      "#reward-driven-spender",
      "#comfort-driven-spender",
      "#routine-treat-spender",
    ],
    modeSignals: {
      "#reward-driven-spender": ["I hit my goal", "finished a hard week", "got a promotion"],
      "#comfort-driven-spender": ["rough week", "felt down", "needed a pick-me-up"],
      "#routine-treat-spender": ["I always do this on Fridays", "it's just my thing", "no specific reason"],
    },
  },
  
  caught_eye: {
    subPath: "caught_eye",
    explorationTag: "#visual-impulse-driven",  // TAG only
    explorationGoal: "Where/how did they encounter it? Is this a pattern?",
    probingHints: [
      "Where did you see it?",
      "What caught your eye about it?",
      "Is this similar to things you already own?",
      "How many similar items do you have?",
      "Is trying new stuff kind of the fun part for you?",
    ],
    targetModes: [
      "#scroll-triggered",
      "#in-store-wanderer",
      "#aesthetic-driven",
      "#duplicate-collector",
      "#exploration-hobbyist",
    ],
    modeSignals: {
      "#scroll-triggered": ["I was scrolling and saw it", "it came up in my feed"],
      "#in-store-wanderer": ["I was just walking by", "it was right there"],
      "#aesthetic-driven": ["it was so pretty", "I loved the packaging", "the color got me"],
      "#duplicate-collector": ["I have like 5 of these already", "adding to my collection"],
      "#exploration-hobbyist": ["I like trying new things", "wanted to see what the hype was about"],
    },
    counterProfilePatterns: ["I collect these intentionally"],
  },
  
  trending: {
    subPath: "trending",
    explorationTag: "#trend-susceptibility-driven",  // TAG only
    explorationGoal: "How susceptible are they to trends that don't fit them?",
    probingHints: [
      "Where have you been seeing it?",
      "Do you feel like it's you or more of a trend buy?",
    ],
    targetModes: [
      "#social-media-influenced",
      "#friend-peer-influenced",
    ],
    modeSignals: {
      "#social-media-influenced": ["I saw it on TikTok", "everyone's posting about it", "a creator I follow had it"],
      "#friend-peer-influenced": ["my friend got one", "everyone at work has it", "someone recommended it"],
    },
    counterProfilePatterns: ["it's totally me", "it fits my style"],
    counterProfileExit: "Sounds like it really fits your style — nothing wrong with hopping on a trend that's actually you!",
  },
};
```

### Fix 4: Probing Turn Limits

**File:** `lib/llm/question-trees.ts`

Add explicit probing limits to the `SubPathProbing` interface:

```typescript
export interface SubPathProbing {
  subPath: string;
  explorationTag?: string;        // e.g., "#price-sensitivity-driven" (NOT a mode)
  explorationGoal: string;
  probingHints: string[];
  targetModes: string[];
  modeSignals: Record<string, string[]>;
  counterProfilePatterns?: string[];
  counterProfileExit?: string;
  lightProbing?: boolean;         // true = 1 question max
  maxProbingTurns?: number;       // explicit override (default: 3 for yellow, 1 for light)
}
```

**Probing depth by path:**

```typescript
// Impulse sub-paths: deep probing (2-3 questions)
export const impulseSubPathProbing = {
  price_felt_right: {
    // ... other fields ...
    lightProbing: false,      // explicit: NOT light probing
    maxProbingTurns: 3,       // can ask up to 3 questions
  },
  treating_myself: {
    lightProbing: false,
    maxProbingTurns: 3,
  },
  // etc.
};

// Deal sub-paths: moderate probing (2-3 questions)
export const dealSubPathProbing = {
  limited_edition: {
    lightProbing: false,
    maxProbingTurns: 3,
  },
  // etc.
};

// Deliberate sub-paths: light probing (1 question only)
export const deliberateSubPathProbing = {
  afford_it: {
    lightProbing: true,       // 1 question max
    maxProbingTurns: 1,       // explicit
  },
  // etc.
};

// Gift/Maintenance: light probing (1 question only)
export const giftSubPathProbing = {
  family: {
    lightProbing: true,
    maxProbingTurns: 1,
  },
  // etc.
};
```

**File:** `lib/llm/prompts.ts`

Update the prompt to be more explicit about when to transition:

```typescript
// In buildSystemPrompt:
const probingInstructions = shouldTransitionNow
  ? `
🚨 YOU HAVE REACHED THE PROBING LIMIT (${probingTurn + 1} of ${effectiveMaxTurns}).
You MUST now:
1. Acknowledge what the user shared (1 sentence)
2. Assign a mode from the target modes
3. Transition to Layer 3 with reflection options`
  : `
📊 PROBING STATUS: Question ${probingTurn + 1} of ${effectiveMaxTurns}
${probingTurn === 0 ? "Ask your FIRST probing question from the hints above." : ""}
${probingTurn === 1 ? "You may ask ONE more probing question, then you MUST transition." : ""}
${probingTurn >= 2 ? "This is your LAST probing question. Transition after this." : ""}`;
```

**File:** `lib/hooks/use-check-in-session.ts` (or wherever session state is managed)

Ensure `probingTurn` is tracked:

```typescript
interface CheckInSessionState {
  // ... existing fields ...
  probingTurn: number;  // Track which probing question we're on
}

// Increment on each LLM response during Layer 2:
if (session.currentLayer === 2 && !response.shouldTransition) {
  setProbingTurn(prev => prev + 1);
}
```

### Fix 5: Add Reflection Path Data

```typescript
export const REFLECTION_PATHS = {
  problem: {
    id: "problem",
    label: "Is this a problem?",
    emoji: "🤔",
    type: "behavioral_excavation",
  },
  feel: {
    id: "feel",
    label: "How do I feel about this?",
    emoji: "💭",
    type: "emotional_reflection",
  },
  worth: {
    id: "worth",
    label: "Is this a good use of money?",
    emoji: "💰",
    type: "cost_comparison",
  },
  different: {
    id: "different",
    label: "I have a different question",
    emoji: "❓",
    type: "open_ended",
  },
  done: {
    id: "done",
    label: "I'm good for now",
    emoji: "✅",
    type: "exit",
  },
};

export const BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS: Record<string, string> = {
  "#intuitive-threshold-spender": "can you think of another time you bought something just because the price felt right?",
  "#reward-driven-spender": "can you think of another time you bought something to celebrate or reward yourself?",
  "#comfort-driven-spender": "can you think of another time you shopped because you were stressed or needed a pick-me-up?",
  "#routine-treat-spender": "can you think of another time you treated yourself as part of your regular routine?",
  "#scroll-triggered": "can you think of another time something just caught your eye and you went for it?",
  "#in-store-wanderer": "can you think of another time something just caught your eye and you went for it?",
  "#aesthetic-driven": "can you think of another time something just caught your eye and you went for it?",
  "#duplicate-collector": "can you think of another time something just caught your eye and you went for it?",
  "#exploration-hobbyist": "can you think of another time something just caught your eye and you went for it?",
  "#social-media-influenced": "can you think of another time you bought something because everyone seemed to have it?",
  "#friend-peer-influenced": "can you think of another time you bought something because everyone seemed to have it?",
  "#scarcity-driven": "can you think of another time you bought something because it was running out or limited?",
  "#deal-driven": "can you think of another time a sale or deal made you go for something?",
  "#threshold-spending-driven": "can you think of another time you added stuff to hit free shipping or get a bonus?",
};

export const EMOTIONAL_REFLECTION_CONTEXT: Record<string, string> = {
  "#comfort-driven-spender": "spending money shopping because you're stressed",
  "#routine-treat-spender": "spending money on these regular treats",
  "#aesthetic-driven": "buying things just because they caught your eye",
  "#deal-driven": "buying things because they were on sale",
  "#scarcity-driven": "buying things because they're limited or running out",
};

export const GRACEFUL_EXIT_MESSAGES = [
  "got it — thanks for walking through this with me.",
  "cool, we can always pick this up later if something comes up.",
];
```

---

## Test Cases

### Test File: `__tests__/shopping-flow.test.ts`

```typescript
import {
  getShoppingFixedQuestion1,
  getShoppingFixedQuestion2,
  SHOPPING_Q2_QUESTIONS,
  impulseSubPathProbing,
  deliberateSubPathProbing,
  SHOPPING_COUNTER_PROFILES,
  REFLECTION_PATHS,
  BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS,
} from "@/lib/llm/question-trees";

describe("Shopping Q1 → Q2 Mapping", () => {
  it("impulse path should get 'What made you go for it?' as Q2", () => {
    expect(SHOPPING_Q2_QUESTIONS.impulse).toBe("What made you go for it?");
  });

  it("deliberate path should get 'What were you waiting for?' as Q2", () => {
    expect(SHOPPING_Q2_QUESTIONS.deliberate).toBe("What were you waiting for?");
  });

  it("deal path should get 'Tell me more about the deal...' as Q2", () => {
    expect(SHOPPING_Q2_QUESTIONS.deal).toBe("Tell me more about the deal, discount or limited event?");
  });
});

describe("Shopping Q2 Options Are Fixed (Not Freeform)", () => {
  it("impulse Q2 should have exactly 5 fixed options", () => {
    const q2 = getShoppingFixedQuestion2("impulse");
    expect(q2?.options).toHaveLength(5);
    expect(q2?.options.map(o => o.value)).toEqual([
      "price_felt_right",
      "treating_myself",
      "caught_eye",
      "trending",
      "other",
    ]);
  });

  it("deal Q2 should have exactly 3 fixed options", () => {
    const q2 = getShoppingFixedQuestion2("deal");
    expect(q2?.options).toHaveLength(3);
    expect(q2?.options.map(o => o.value)).toEqual([
      "limited_edition",
      "sale_discount",
      "free_shipping",
    ]);
  });
});

describe("Modes Are Flat (No Base Mode Hierarchy)", () => {
  it("caught_eye should NOT include #visual-impulse-driven as a mode", () => {
    const probing = impulseSubPathProbing.caught_eye;
    expect(probing.targetModes).not.toContain("#visual-impulse-driven");
  });

  it("caught_eye should include flat modes only", () => {
    const probing = impulseSubPathProbing.caught_eye;
    expect(probing.targetModes).toContain("#scroll-triggered");
    expect(probing.targetModes).toContain("#in-store-wanderer");
    expect(probing.targetModes).toContain("#aesthetic-driven");
    expect(probing.targetModes).toContain("#duplicate-collector");
    expect(probing.targetModes).toContain("#exploration-hobbyist");
  });

  it("trending should NOT include #trend-susceptibility-driven as a mode", () => {
    const probing = impulseSubPathProbing.trending;
    expect(probing.targetModes).not.toContain("#trend-susceptibility-driven");
  });

  it("trending should include flat modes only", () => {
    const probing = impulseSubPathProbing.trending;
    expect(probing.targetModes).toContain("#social-media-influenced");
    expect(probing.targetModes).toContain("#friend-peer-influenced");
  });
});

describe("Deliberate Paths Have Light Probing", () => {
  const subPaths = Object.keys(deliberateSubPathProbing);

  it("all deliberate paths should have lightProbing: true", () => {
    subPaths.forEach((key) => {
      expect(deliberateSubPathProbing[key].lightProbing).toBe(true);
    });
  });
});

describe("Layer 3 Reflection Paths", () => {
  it("should have 5 reflection options", () => {
    expect(Object.keys(REFLECTION_PATHS)).toHaveLength(5);
  });

  it("should have mode-based entry questions for behavioral excavation", () => {
    expect(BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS["#intuitive-threshold-spender"]).toContain("price felt right");
    expect(BEHAVIORAL_EXCAVATION_ENTRY_QUESTIONS["#comfort-driven-spender"]).toContain("stressed");
  });
});

describe("Counter-Profiles", () => {
  it("trend-but-fits-me should trigger graceful exit", () => {
    const probing = impulseSubPathProbing.trending;
    expect(probing.counterProfileExit).toBeDefined();
    expect(probing.counterProfileExit).toContain("fits your style");
  });
});
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `lib/llm/question-trees.ts` | Fix Q1→Q2 mapping, Q2 options, flat modes, counter-profiles, reflection paths |
| `lib/llm/prompts.ts` | Update mode references, add reflection prompts |
| `__tests__/shopping-flow.test.ts` | Comprehensive shopping flow tests |

---

## Execution Order

1. **Phase A** - Fix core data structures (criteria 1-5)
2. **Phase B** - Fix Q2 questions and options (criteria 6-10)
3. **Phase C** - Fix mode definitions to be flat (criteria 11-14)
4. **Phase D** - Add counter-profiles (criteria 15-18)
5. **Phase E** - Add Layer 3 reflection logic (criteria 19-24)
6. **Phase F** - Sync prompts.ts (criteria 25-27)
7. **Phase G** - Testing (criteria 28-33)

---

## Testing Checklist

After implementation, verify:

- [ ] `pnpm test shopping-flow` - All tests pass
- [ ] `pnpm lint` - No linting errors
- [ ] Q1 has 6 options including "Other"
- [ ] Each Q1 response routes to correct Q2 question text
- [ ] Q2 options are fixed (not freeform)
- [ ] No "base modes" exist - all modes are flat
- [ ] `#visual-impulse-driven` and `#trend-susceptibility-driven` are exploration TAGS only
- [ ] Counter-profiles trigger graceful exits
- [ ] Layer 3 reflection paths are mode-aware
- [ ] Graceful exit messages are implemented

---

## Context Window Management

Large files can cause Ralph to hit context limits and trigger rotation loops. To manage this:

### File Splitting Guidelines
When a file exceeds ~40KB or ~1000 lines, split it into smaller modules:
1. Group related functions/types into separate files
2. Create a folder with the same name as the original file
3. Add an `index.ts` that re-exports all modules
4. Keep individual files under 500 lines (~20KB)

### Current Split Structure
- **lib/llm/question-trees/** - Modular code split from question-trees.ts
  - `types.ts` - Shared type definitions
  - `shopping.ts` - Shopping check-in logic
  - `food.ts` - Food check-in logic
  - `coffee.ts` - Coffee check-in logic
  - `reflection.ts` - Layer 3 reflection
  - `modes.ts` - Mode definitions
  - `index.ts` - Re-exports all modules

### For Ralph Iterations
- Read individual subfiles as needed rather than the entire monolithic file
- When implementing features, edit the specific module file (not the barrel index)
- If you find a file is too large, you may split it following the guidelines above, as long as it is labeled and hierarchized correctly for easy finding

---

## Ralph Instructions

1. Read this spec AND `docs/question-trees/shopping-check-in.md` carefully
2. Work through phases in order: A → B → C → D → E → F → G
3. Run tests after each phase: `pnpm test shopping-flow`
4. Commit after completing each numbered criterion
5. For Phase G testing, follow `question-tree-design-and-testing.md` skill doc
6. Yellow box probing (deep exploration) is mostly relevant for shopping - coffee/food can use lighter probing
7. When ALL criteria are `[x]`, output: `<ralph>COMPLETE</ralph>`
8. If stuck on same issue 3+ times, output: `<ralph>GUTTER</ralph>`
9. **If files are too large**, split them following the "Context Window Management" guidelines above

