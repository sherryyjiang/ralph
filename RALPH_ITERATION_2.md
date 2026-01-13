# Ralph Iteration 2: Task Instructions

> **Created:** 2026-01-13  
> **Goal:** Improve check-in UX with inline entry questions, fix awareness calibration bugs, and enhance AI tone

---

## Overview

This iteration focuses on:
1. Redesigning the home page to show entry questions inline on transaction cards
2. Fixing the awareness calibration loop bug for Food/Coffee check-ins
3. Improving the graceful exit experience
4. Enhancing AI warmth and question adherence

---

## Task 1: Remove Weekly Summary Header

**File:** `app/page.tsx`

**Current State:** The home page has a `WeeklySummary` component showing "This Week: $876.27 ↑18% vs last week"

**Change:** Delete the entire `WeeklySummary` component and its usage. Keep only:
- The "Spending" title
- The "X peeks waiting" badge
- Category filter pills
- Transaction list

**Implementation:**
```tsx
// DELETE this component entirely:
function WeeklySummary({ ... }) { ... }

// DELETE these lines from DashboardPage:
const weeklySpend = useMemo(() => calculateWeeklySpend(), []);
const previousWeekSpend = weeklySpend * 0.85;

// DELETE this JSX:
<WeeklySummary totalSpent={weeklySpend} previousWeek={previousWeekSpend} />
```

---

## Task 2: Redesign Transaction Cards with Inline Entry Questions

**Files:** 
- `app/page.tsx` (TransactionCard component)
- `lib/data/synthetic-transactions.ts`

### 2A: Shopping Cards (Zara, H&M)

Show the Fixed Q1 question and options directly on the card:

```
┌─────────────────────────────────────────────────────────┐
│  🛍️ Zara                                      $45.00   │
│  Today · First time                                     │
│                                                         │
│  When you bought this, were you...                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⚡ Saw it and bought it in the moment           │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🎯 Been thinking about this for a while         │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🏷️ A good deal / discount made me go for it     │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🎁 Bought it for someone else                   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔄 Restocking or replacing                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

When user selects an option:
1. Navigate to `/check-in/[sessionId]?txn=[id]&path=[selectedPath]`
2. Chat starts with Fixed Q2 for that path (NOT Fixed Q1 again)

### 2B: Food Card (Category Check-In)

**IMPORTANT:** This is a CATEGORY check-in, not a single transaction check-in.

```
┌─────────────────────────────────────────────────────────┐
│  🍕 Food Delivery                              $251     │
│  9 orders this month                                    │
│                                                         │
│  How much do you think you spent on                     │
│  ordering food this month?                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  $________                              [→]     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

- Show a text input field for freeform number entry
- When user submits, navigate to check-in with `?guess=[userInput]`
- Chat starts with calibration RESULT (not the guess question again)

### 2C: Coffee Card (Category Check-In)

```
┌─────────────────────────────────────────────────────────┐
│  ☕ Coffee & Treats                            $102     │
│  10 purchases this month                                │
│                                                         │
│  How many times did you buy coffee or                   │
│  small treats this month?                               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ________                               [→]     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

- Show a text input field for freeform number entry
- When user submits, navigate to check-in with `?guessCount=[userInput]`
- Chat starts with calibration RESULT (not the guess question again)

---

## Task 3: Calculate Aggregate Category Totals

**File:** `lib/data/synthetic-transactions.ts`

Add/update these functions:

```typescript
/**
 * Get aggregate stats for food category (for category check-in card)
 */
export function getFoodCategoryStats(): {
  totalSpend: number;
  orderCount: number;
  topMerchants: { name: string; count: number; spend: number }[];
  topDays: { day: string; count: number }[];
} {
  const foodTxns = getTransactionsByCategory("food");
  // Calculate totals and breakdowns
  // ...
}

/**
 * Get aggregate stats for coffee category (for category check-in card)
 */
export function getCoffeeCategoryStats(): {
  totalSpend: number;
  purchaseCount: number;
  avgPerVisit: number;
  topMerchants: { name: string; count: number; spend: number }[];
  topDays: { day: string; count: number }[];
} {
  const coffeeTxns = getTransactionsByCategory("coffee");
  // Calculate totals and breakdowns
  // ...
}
```

---

## Task 4: Reduce Synthetic Transactions

**File:** `lib/data/synthetic-transactions.ts`

Keep ONLY these transactions:

| Merchant | Category | Frequency | Notes |
|----------|----------|-----------|-------|
| Zara | shopping | 1 | Single transaction, first time |
| H&M | shopping | 1 | Single transaction |
| Starbucks | coffee | 18x/month | High frequency, autopilot pattern |
| (Food category) | food | 9x/month | Category-wide, not single merchant |

**Implementation:**
- Remove all other shopping transactions (Free People, Nuuly, Everlane, Urban Outfitters, etc.)
- Remove individual food merchant transactions (DoorDash, Uber Eats, Sweetgreen, Chipotle, Grubhub)
- Create a set of 9 food transactions with varied merchants to represent the category
- Keep Starbucks with 18 transactions spread across the month
- Remove other coffee merchants (Fount, Blue Bottle, Philz, Levain, Milk Bar, Dunkin)

---

## Task 5: Fix Awareness Calibration Loop Bug

**Files:**
- `app/check-in/[sessionId]/page.tsx`
- `lib/llm/question-trees.ts`

### Bug Diagnosis

**Problem:** When user selects a guess option for Food/Coffee check-in, the chat loops and doesn't advance to the next question.

**Root Cause Analysis:**

1. **Layer not transitioning:** After the guess is submitted, `currentLayer` should change from 1 to 1.5 (or remain at 1 but track a sub-state), then to 2 after the feeling question.

2. **Wrong option values:** The code in `getFoodAwarenessCalibration` generates options with values like `"low"`, `"medium"`, `"high"` but the handler expects these exact strings. However, the REAL issue is the flow should be:
   - User guesses → Show calibration result + feeling question
   - User answers feeling → THEN decide next step
   
3. **Missing state tracking:** The code doesn't track which sub-step of Layer 1 we're in:
   - Layer 1a: User makes guess
   - Layer 1b: Show result, ask "how do you feel?"
   - Layer 1c: (If way off) "Would you like to see breakdown?"
   - Then → Layer 2 (if user says "not great") or exit (if "ok with it")

### Fix Implementation

Add state tracking for awareness calibration phase:

```typescript
// In useCheckInSession hook, add:
const [calibrationPhase, setCalibrationPhase] = useState<
  "guess" | "result_shown" | "feeling_asked" | "breakdown_offered" | "complete"
>("guess");

// Update the option handler for food/coffee:
if (transaction.category === "food" || transaction.category === "coffee") {
  if (calibrationPhase === "guess") {
    // User just submitted their guess
    const guess = parseInt(value, 10);
    const actual = transaction.category === "food" 
      ? getMonthlyFoodSpend() 
      : getMonthlyCoffeeCount();
    
    // Store guess and actual
    setUserGuess(guess);
    setActualAmount(actual);
    
    // Show result + feeling question
    setCalibrationPhase("result_shown");
    
    // Next message shows result and asks "How do you feel about this?"
    // with options: "I'm ok with it" | "Feel like it could be better"
    
  } else if (calibrationPhase === "result_shown") {
    // User answered feeling question
    if (value === "ok_with_it") {
      // Light reflection and exit
      setCalibrationPhase("complete");
    } else if (value === "could_be_better") {
      // Check if we should offer breakdown
      const isWayOff = /* calculate if >20% off or $75+ diff */;
      if (isWayOff) {
        setCalibrationPhase("breakdown_offered");
        // Ask "Would you like to see what's behind this amount?"
      } else {
        // Skip to Layer 2 (diagnosis)
        setCalibrationPhase("complete");
        setLayer(2);
      }
    }
    
  } else if (calibrationPhase === "breakdown_offered") {
    if (value === "yes") {
      // Show breakdown by merchant and days
      // Then transition to Layer 2
    } else {
      // Respect boundary, go to Layer 2
    }
    setCalibrationPhase("complete");
    setLayer(2);
  }
}
```

---

## Task 6: Implement Full Awareness Flow

**Per PEEK_QUESTION_TREES.md spec:**

```
User Guess (on home card)
         ↓
┌─────────────────────────────────────────┐
│  Compare guess to actual                │
│  (within 20% = close, >20% = way off)   │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Show calibration result                │
│  "Nice awareness! You spent $X..."      │
│  or                                     │
│  "Actually, you spent $X - that's       │
│   $Y more than you thought"             │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  "How do you feel about that number?"   │
│                                         │
│  [ I'm ok with it ]                     │
│  [ Feel like it could be better ]       │
└─────────────────┬───────────────────────┘
                  ↓
      ┌───────────┴───────────┐
      ↓                       ↓
  "ok with it"         "could be better"
      ↓                       ↓
  Light exit            ┌─────────────────┐
  or offer to           │ If WAY OFF:     │
  explore more          │ "Would you like │
                        │  to see what's  │
                        │  behind this?"  │
                        └────────┬────────┘
                                 ↓
                        ┌────────┴────────┐
                        ↓                 ↓
                       YES               NO
                        ↓                 ↓
                   Show breakdown    Respect boundary
                   by merchant &     
                   day of week       
                        ↓                 ↓
                        └────────┬────────┘
                                 ↓
                           → Layer 2
                         (Diagnosis)
```

---

## Task 7: Replace Exit Experience

**File:** `app/check-in/[sessionId]/page.tsx`

**Current:** Shows "Thanks for the reflection! ✨" as a repeated message

**Change:** 
1. Remove the "Thanks for the reflection!" message pattern
2. Keep only the X button in the header for closing
3. When Layer 3 reflection is complete, just show the final AI message with no forced exit prompt

```tsx
// In header:
<header className="flex items-center justify-between ...">
  <button onClick={onClose}>← Back</button>
  <h1>Shopping Check-In</h1>
  <button onClick={onClose} className="...">✕</button>  {/* ADD THIS */}
</header>

// Remove or modify the exit option that shows "Thanks for the reflection!"
// Instead, let the conversation end naturally
```

---

## Task 8: Graceful Exit for Deliberate Paths

**Files:**
- `app/check-in/[sessionId]/page.tsx`
- `lib/llm/prompts.ts`

When user is on a **deliberate path** (or other counter-profile behavior), after Fixed Q2:

1. Show brief acknowledgment with validation
2. Mention saving to "magnets"
3. Offer freeform follow-up

**Example flow:**

```
User: "Waiting for the right one"
AI: "That makes sense! It sounds like you put real thought into this 
     purchase — finding exactly what works for you. 

     I'm saving this as a pattern in your Magnets. 🧲

     Is there anything else about this purchase you'd like to explore?"

[Free-form text input]
[I'm good for now ✓]
```

**Implementation in prompts.ts:**

```typescript
// Add to deliberate sub-path handling:
const DELIBERATE_EXIT_TEMPLATE = `
It sounds like you really put thought into this purchase, {specific_validation}.

I'm saving this as a pattern in your Magnets — it helps me understand 
your intentional spending style. 🧲

Is there anything else about this purchase you'd like to explore?
`;

// Specific validations by sub-path:
const deliberateValidations = {
  afford_it: "waiting until the timing was right financially",
  right_price: "being patient for the right deal",
  right_one: "doing your research and finding exactly what you wanted",
  still_wanted: "giving yourself time to be sure",
  got_around: "finally checking this off your list",
};
```

---

## Task 9: Add Warmth to AI Tone

**File:** `lib/llm/prompts.ts` and `app/api/chat/route.ts`

Update system prompts to include:

```typescript
const TONE_GUIDELINES = `
## Tone Guidelines

1. VALIDATE first - acknowledge what the user shared before asking more
   - "That makes sense..."
   - "I hear you..."
   - "Thanks for sharing that..."

2. MIRROR their language - use similar words/phrases they used
   - If they say "stressed", say "stressful" not "anxious"
   - If they say "just grabbed it", reflect "grabbed" back

3. Be CURIOUS not clinical
   - "I'm curious..." not "Can you elaborate..."
   - "What was going on..." not "Describe the circumstances..."

4. Keep it BRIEF - 1-2 sentences max for probing
   - Don't over-explain
   - Let them talk more than you

5. NO LECTURES - ever
   - Don't say "You should..."
   - Don't imply judgment
   - Present observations, not conclusions
`;
```

Add to the base system prompt in `buildSystemPromptWithModeAssignment`.

---

## Task 10: Improve LLM Probing Hint Adherence

**Problem:** LLM is generating its own questions instead of using the probing hints from the question tree.

**Example:**
- User selected: "Waiting for the right one"
- Expected questions: "Where did you go for your research?" / "Where did you end up finding it?"
- Actual question: "What was it about this particular item that made it feel like the right one?"

**Fix:** Make the probing hints more directive in the prompt:

```typescript
// In the system prompt, change from:
`Probing Hints (use these to guide your questions):`

// To:
`REQUIRED PROBING QUESTIONS - Use these EXACT questions or close variations:
${probingHints.map((h, i) => `${i + 1}. "${h}"`).join('\n')}

Do NOT ask your own questions. Pick from the list above.`
```

**Also add negative examples:**

```typescript
const PROBING_ANTI_PATTERNS = `
## Questions to AVOID (too generic):
- "What made you decide to buy this?"
- "Can you tell me more about that?"
- "How did that make you feel?"
- "What was going through your mind?"

These are too vague. Use the SPECIFIC probing hints provided above.
`;
```

---

## Task 11: Write Tests for Routing and Transitions

**File:** `__tests__/question-tree-routing.test.ts`

```typescript
describe("Question Tree Routing", () => {
  describe("Shopping Check-In", () => {
    it("routes impulse path to correct Fixed Q2", () => {
      // When user selects "impulse" from Fixed Q1
      // Then Fixed Q2 options should be: price_felt_right, treating_myself, caught_eye, trending
    });
    
    it("routes deliberate path to correct Fixed Q2", () => {
      // When user selects "deliberate" from Fixed Q1
      // Then Fixed Q2 options should be: afford_it, right_price, right_one, still_wanted, got_around
    });
    
    it("transitions from Layer 1 to Layer 2 after Fixed Q2", () => {
      // When user answers Fixed Q2
      // Then currentLayer should be 2
    });
    
    it("detects counter-profile and exits gracefully", () => {
      // When user shows intentional behavior on impulse path
      // Then exitGracefully should be true
    });
  });
  
  describe("Food Check-In", () => {
    it("shows feeling question after calibration result", () => {
      // When user submits guess
      // Then next message should include "How do you feel about this number?"
      // And options should be "I'm ok with it" and "Feel like it could be better"
    });
    
    it("offers breakdown when guess is way off and user says not great", () => {
      // When guess is >20% off AND user says "could be better"
      // Then should ask "Would you like to see what's behind this amount?"
    });
    
    it("transitions to Layer 2 after awareness calibration complete", () => {
      // When awareness calibration phase is complete
      // Then currentLayer should be 2
    });
  });
  
  describe("Coffee Check-In", () => {
    // Similar tests to Food
  });
});
```

---

## Execution Order

1. **Task 4** - Reduce transactions (simplifies testing)
2. **Task 3** - Calculate category aggregates (needed for cards)
3. **Task 1** - Remove weekly summary
4. **Task 2** - Redesign transaction cards
5. **Task 5 & 6** - Fix awareness calibration flow
6. **Task 7** - Fix exit experience  
7. **Task 8** - Graceful exit for deliberate paths
8. **Task 9 & 10** - AI tone and probing adherence
9. **Task 11** - Write tests

---

## Testing Checklist

After implementation, manually verify:

- [ ] Home page shows only 4 cards: Zara, H&M, Food (category), Coffee (category)
- [ ] Shopping cards show Fixed Q1 options inline
- [ ] Food/Coffee cards show text input for guess
- [ ] Food check-in: guess → result → feeling → (breakdown if way off) → Layer 2
- [ ] Coffee check-in: same flow as Food
- [ ] Deliberate path exits gracefully with magnet mention
- [ ] No more "Thanks for the reflection!" repeated message
- [ ] AI questions match probing hints from spec
- [ ] AI tone feels warm and validating, not clinical


