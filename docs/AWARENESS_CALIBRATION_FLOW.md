# Awareness Calibration Flow Specification

> **Applies to:** Food Check-In, Coffee/Treats Check-In  
> **Type:** Pattern Check-In  
> **Updated:** 2026-01-13

---

## Overview

Pattern check-ins (Food, Coffee) start with an **awareness calibration** phase where we:
1. Ask the user to guess their spending/frequency
2. Compare to actual data
3. Reveal the result
4. Gauge their emotional response
5. (Optionally) show detailed breakdown

This happens BEFORE Layer 2 (Diagnosis).

---

## Home Card Entry Point

### Food Category Card

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

**Data shown:**
- Category total spend (sum of all food transactions)
- Order count (number of food transactions)

**User input:**
- Freeform text field for dollar amount guess
- Submit button navigates to check-in with `?guess=[amount]`

### Coffee Category Card

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

**Data shown:**
- Category total spend
- Purchase count

**User input:**
- Freeform text field for count guess
- Submit button navigates to check-in with `?guessCount=[count]`

---

## Chat Flow (After Home Card Submission)

### Phase 1: Show Calibration Result

When chat opens, the guess has already been submitted. First message shows the result:

**If CLOSE (within 20% or <$75 difference):**

```
Nice awareness! You've actually spent $251 on food delivery this month. 
You know your spending pretty well! 🎯
```

**If WAY OFF (>20% AND $75+ difference):**

```
Interesting! You've actually spent $251 on food delivery this month — 
that's $76 more than you thought (43% higher). 📊
```

### Phase 2: Feeling Question

Immediately after showing result, ask:

```
How do you feel about that number?

[ 👍 I'm ok with it ]
[ 🤔 Feel like it could be better ]
```

### Phase 3a: If "I'm ok with it"

Light reflection and offer to explore or exit:

```
Got it — sounds like it's working for you! 

Is there anything about your food ordering you'd like to explore, 
or are you good for now?

[ I'm good for now ✓ ]
[ Actually, I'm curious about something... ]
```

### Phase 3b: If "Feel like it could be better"

**If guess was WAY OFF:**

```
Would you like to see what's behind this amount?

[ Yes, show me ]
[ No, I'd rather move on ]
```

**If "Yes, show me":**

```
Here's the breakdown:

📊 By Merchant:
• DoorDash: 5 orders ($125)
• Uber Eats: 3 orders ($95)
• Sweetgreen: 1 order ($31)

📅 By Day:
• Fridays: 4 orders (most common)
• Wednesdays: 3 orders
• Weekends: 2 orders

Does that land how you expected?

[ Yeah, that tracks ]
[ Some of that surprises me ]
```

**After breakdown (or if skipped):**

Transition to Layer 2 (Diagnosis):

```
When you think about why you order food, what feels most true?

[ 😓 I'm usually too drained to cook ]
[ 📱 It's just easier to order ]
[ 🤷 I keep meaning to cook but never plan ]
[ ⏰ I'm too busy to plan ]
[ 🍕 I actually wanted that specific meal ]
```

---

## State Machine

```
┌─────────────────┐
│ HOME_CARD_GUESS │  ← User enters guess on home card
└────────┬────────┘
         │ Submit guess
         ↓
┌─────────────────┐
│ RESULT_SHOWN    │  ← Show calibration result
└────────┬────────┘
         │ Auto-advance
         ↓
┌─────────────────┐
│ FEELING_ASKED   │  ← "How do you feel about this number?"
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
"ok"       "could be better"
    ↓         ↓
┌───────┐  ┌──────────────────┐
│ EXIT  │  │ BREAKDOWN_OFFER  │  ← Only if WAY OFF
│ LIGHT │  │ (optional)       │
└───┬───┘  └────────┬─────────┘
    │               │
    │          ┌────┴────┐
    │          ↓         ↓
    │        "yes"     "no"
    │          ↓         ↓
    │    ┌─────────┐    │
    │    │ SHOW    │    │
    │    │BREAKDOWN│    │
    │    └────┬────┘    │
    │         │         │
    │         └────┬────┘
    │              ↓
    │       ┌──────────────┐
    │       │ LAYER_2      │  ← Diagnosis phase
    │       │ (MOTIVATION) │
    │       └──────────────┘
    │
    ↓
┌──────────────────┐
│ EXPLORE_OR_EXIT  │  ← "Anything else you'd like to explore?"
└──────────────────┘
```

---

## Implementation State

Track calibration phase in session state:

```typescript
type CalibrationPhase = 
  | "result_shown"      // Just showed the calibration result
  | "feeling_asked"     // Waiting for feeling response
  | "breakdown_offered" // Asked if they want breakdown (only if way off)
  | "breakdown_shown"   // Showed the breakdown
  | "layer_2_ready"     // Ready to transition to Layer 2
  | "complete";         // Calibration done, in Layer 2+

interface CalibrationState {
  phase: CalibrationPhase;
  userGuess: number;
  actualAmount: number;
  isWayOff: boolean;
  feelingResponse?: "ok_with_it" | "could_be_better";
  wantsBreakdown?: boolean;
}
```

---

## Coffee-Specific Variations

Coffee uses **count** instead of **amount** for the guess:

```
"How many times did you buy coffee or small treats this month?"

Result: "Actually, you made 18 purchases this month — that's 8 more 
        than you guessed, totaling $102."

Breakdown:
📊 By Merchant:
• Starbucks: 15 purchases ($85)
• Blue Bottle: 3 purchases ($17)

📅 By Day:
• Weekday mornings: 12 purchases (most common)
• Afternoon pick-me-ups: 6 purchases
```

---

## Key Principles

1. **Guess happens on home card** — Chat never re-asks the guess question
2. **Result is first chat message** — User immediately sees how they did
3. **Feeling question always follows result** — Single combined message
4. **Breakdown is optional** — Only offered if way off AND user wants to explore
5. **Layer 2 is next** — After calibration, go to diagnosis (motivation question)
6. **Exit is always available** — "I'm ok with it" can lead to graceful exit

---

## Related Files

- `app/page.tsx` — Home card with guess input
- `app/check-in/[sessionId]/page.tsx` — Chat flow handler
- `lib/hooks/use-check-in-session.ts` — Session state management
- `lib/llm/question-trees.ts` — Calibration result functions
- `lib/data/synthetic-transactions.ts` — Category aggregate functions

