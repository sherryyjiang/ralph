---
task: Build Peek Check-In Chat App - Iteration 2
test_command: "npm run dev"
---

# Task: Peek Check-In Chat App - Iteration 2

Iterate on the v1 Peek Check-In Chat app with UI improvements, bug fixes, and LLM quality enhancements.

## Reference Documents

### Core Specs
- **PEEK_QUESTION_TREES.md** - Complete question tree logic (MUST follow exactly)
- **PEEK_CHECKIN_SPEC.md** - Technical specification and data models

### Iteration 2 Documents (NEW)
- **RALPH_ITERATION_2.md** - Main task list and implementation guide
- **docs/HOME_PAGE_REDESIGN.md** - Transaction card redesign with inline entry questions
- **docs/AWARENESS_CALIBRATION_FLOW.md** - Food/Coffee awareness flow specification
- **docs/BUG_DIAGNOSIS_CALIBRATION_LOOP.md** - Bug analysis and fix
- **docs/GRACEFUL_EXIT_PATTERNS.md** - Exit flows for deliberate/intentional behavior
- **docs/AI_TONE_GUIDELINES.md** - Warmth and validation guidelines
- **docs/LLM_PROBING_ADHERENCE.md** - Making LLM follow probing hints
- **docs/SYNTHETIC_TRANSACTIONS_V2.md** - Reduced transaction set

---

## Iteration 2 Success Criteria

### Phase A: Data Layer Updates
1. [x] Reduce synthetic transactions to 4 key items (Zara, H&M, Food category, Coffee category)
2. [x] Add category aggregate functions: `getFoodCategoryStats()`, `getCoffeeCategoryStats()`
3. [x] Verify aggregate totals match spec (~$251 food, ~$112 coffee)

### Phase B: Home Page Redesign
4. [x] Remove `WeeklySummary` component from home page
5. [x] Create `ShoppingTransactionCard` with inline Fixed Q1 options
6. [x] Create `CategoryCheckInCard` with freeform text input for guess
7. [x] Update navigation to pass path/guess via URL params
8. [x] Verify only 4 cards show on home page

### Phase C: Fix Awareness Calibration Loop
9. [x] Add `calibrationPhase` state to session management
10. [ ] Update check-in page to read guess from URL params (not re-ask)
11. [ ] Fix option handler to properly track calibration phases
12. [ ] Implement full flow: guess → result → feeling → (breakdown) → Layer 2
13. [ ] Test Food check-in flows completely
14. [ ] Test Coffee check-in flows completely

### Phase D: Exit Experience
15. [ ] Remove "Thanks for the reflection!" perpetual message
16. [ ] Add X close button to chat header
17. [ ] Implement graceful exit messages for deliberate paths
18. [ ] Add "Magnets" mention to graceful exits
19. [ ] Add freeform follow-up option after graceful exit

### Phase E: AI Quality
20. [ ] Update system prompt with tone guidelines (warmth, validation, mirroring)
21. [ ] Make probing hints REQUIRED in prompt (not suggestions)
22. [ ] Add negative examples to prevent generic questions
23. [ ] Test probing adherence for "right_one" path specifically

### Phase F: Testing
24. [ ] Write tests for question tree routing (shopping paths)
25. [ ] Write tests for awareness calibration phase transitions
26. [ ] Write tests for graceful exit detection
27. [ ] Manual verification of all 4 check-in cards

---

## Key Implementation Details

### URL Parameters

**Shopping Check-In:**
```
/check-in/[sessionId]?txn=[transactionId]&path=[selectedPath]
```
- `path` values: impulse, deliberate, deal, gift, maintenance
- Chat starts with Fixed Q2 (NOT Fixed Q1)

**Food Check-In:**
```
/check-in/[sessionId]?category=food&guess=[dollarAmount]
```
- `guess` is user's guess in dollars
- Chat starts with calibration result + feeling question

**Coffee Check-In:**
```
/check-in/[sessionId]?category=coffee&guessCount=[count]
```
- `guessCount` is user's guess in number of purchases
- Chat starts with calibration result + feeling question

### Calibration Phase State Machine

```typescript
type CalibrationPhase = 
  | "awaiting_guess"        // Initial state (but guess comes from URL)
  | "awaiting_feeling"      // After showing result, waiting for feeling response
  | "awaiting_breakdown"    // Asked if they want breakdown (only if way off)
  | "complete";             // Ready for Layer 2 or exit
```

### Actual Category Totals (for comparison)

- **Food:** $251 total, 9 orders
- **Coffee:** ~$112 total, 18 purchases

### Feeling Options After Calibration

```typescript
const FEELING_OPTIONS = [
  { id: "ok_with_it", label: "I'm ok with it", emoji: "👍" },
  { id: "could_be_better", label: "Feel like it could be better", emoji: "🤔" },
];
```

### When to Offer Breakdown

Offer breakdown if BOTH:
1. User's guess was "way off" (>20% difference AND $75+ difference)
2. User selected "Feel like it could be better"

---

## Technical Notes

### Files to Modify

| File | Changes |
|------|---------|
| `lib/data/synthetic-transactions.ts` | Reduce to 4 items, add aggregate functions |
| `app/page.tsx` | Remove header, add new card components |
| `app/check-in/[sessionId]/page.tsx` | Read URL params, fix calibration flow |
| `lib/hooks/use-check-in-session.ts` | Add calibrationPhase state |
| `lib/llm/prompts.ts` | Add tone guidelines, stricter probing |
| `app/api/chat/route.ts` | Update system prompt construction |

### New Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| `ShoppingTransactionCard` | `components/transaction-card.tsx` | Shopping card with inline options |
| `CategoryCheckInCard` | `components/category-card.tsx` | Food/Coffee card with guess input |

---

## Ralph Instructions

1. Read ALL docs in `docs/` folder before starting (especially the iteration 2 docs)
2. Start with Phase A (data layer) - it unblocks everything else
3. Work through phases in order: A → B → C → D → E → F
4. Run `npm run dev` after each phase to verify
5. For Phase C, carefully follow the state machine in `BUG_DIAGNOSIS_CALIBRATION_LOOP.md`
6. Commit after completing each numbered criterion
7. When ALL criteria are [x], output: `<ralph>COMPLETE</ralph>`
8. If stuck on the same issue 3+ times, output: `<ralph>GUTTER</ralph>`

---

## Previous Iteration (v1) - COMPLETED

<details>
<summary>Click to expand v1 criteria</summary>

### Phase 1: Foundation
1. [x] Create TypeScript interfaces in `lib/types/index.ts`
2. [x] Create synthetic transaction data in `lib/data/synthetic-transactions.ts`
3. [x] Create LLM wrapper in `lib/llm/client.ts`
4. [x] Build basic dashboard page with weekly spend summary

### Phase 2: Chat Infrastructure
5. [x] Create chat components
6. [x] Create check-in session state management
7. [x] Create `/check-in/[sessionId]/page.tsx`
8. [x] Connect transaction tap to check-in flow

### Phase 3: Gemini Integration
9. [x] Create API route at `/api/chat/route.ts`
10. [x] Build system prompt construction
11. [x] Handle streaming responses
12. [x] Add error handling

### Phase 4-8: All Complete
[All 31 criteria completed in v1]

</details>
