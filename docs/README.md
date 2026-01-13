# Peek Check-In Documentation

> **Iteration 2 Documentation**  
> Updated: 2026-01-13

---

## Document Index

### Main Task Files

| File | Description |
|------|-------------|
| [RALPH_TASK.md](../RALPH_TASK.md) | Main task file with success criteria |
| [RALPH_ITERATION_2.md](../RALPH_ITERATION_2.md) | Detailed implementation instructions for iteration 2 |

### Core Specifications

| File | Description |
|------|-------------|
| [PEEK_QUESTION_TREES.md](../PEEK_QUESTION_TREES.md) | Complete question tree logic (source of truth) |
| [PEEK_CHECKIN_SPEC.md](../PEEK_CHECKIN_SPEC.md) | Technical spec and data models |

### Iteration 2 Specs

| File | Description |
|------|-------------|
| [HOME_PAGE_REDESIGN.md](./HOME_PAGE_REDESIGN.md) | Transaction card redesign with inline entry questions |
| [AWARENESS_CALIBRATION_FLOW.md](./AWARENESS_CALIBRATION_FLOW.md) | Food/Coffee guess → result → feeling → breakdown flow |
| [BUG_DIAGNOSIS_CALIBRATION_LOOP.md](./BUG_DIAGNOSIS_CALIBRATION_LOOP.md) | Analysis of the calibration loop bug and fix |
| [GRACEFUL_EXIT_PATTERNS.md](./GRACEFUL_EXIT_PATTERNS.md) | Exit flows for deliberate/intentional behavior |
| [AI_TONE_GUIDELINES.md](./AI_TONE_GUIDELINES.md) | Warmth, validation, and mirroring guidelines |
| [LLM_PROBING_ADHERENCE.md](./LLM_PROBING_ADHERENCE.md) | Making LLM follow probing hints from spec |
| [SYNTHETIC_TRANSACTIONS_V2.md](./SYNTHETIC_TRANSACTIONS_V2.md) | Reduced transaction set (4 items) |

### Existing Question Tree Docs

| File | Description |
|------|-------------|
| [question-trees/food-check-in.md](./question-trees/food-check-in.md) | Food check-in specific flows |
| [question-trees/coffee-check-in.md](./question-trees/coffee-check-in.md) | Coffee check-in specific flows |

---

## Quick Reference

### Iteration 2 Goals

1. **Home Page Redesign** - Remove weekly summary, add inline entry questions to cards
2. **Fix Calibration Bug** - Food/Coffee check-ins were looping instead of advancing
3. **Reduce Transactions** - Only 4 cards: Zara, H&M, Food (category), Coffee (category)
4. **Graceful Exits** - Better experience for deliberate/intentional behavior
5. **AI Tone** - More warmth, validation, mirroring
6. **LLM Quality** - Better adherence to probing hints

### Key Files to Modify

```
lib/data/synthetic-transactions.ts  → Reduce to 4 items, add aggregates
app/page.tsx                        → Remove header, new card components
app/check-in/[sessionId]/page.tsx   → Read URL params, fix calibration
lib/hooks/use-check-in-session.ts   → Add calibrationPhase state
lib/llm/prompts.ts                  → Tone guidelines, stricter probing
app/api/chat/route.ts               → Update system prompt
```

### Execution Order

1. Phase A: Data Layer (transactions, aggregates)
2. Phase B: Home Page (remove header, new cards)
3. Phase C: Fix Calibration Loop (critical bug)
4. Phase D: Exit Experience (X button, magnets)
5. Phase E: AI Quality (tone, probing)
6. Phase F: Testing

---

## Reading Order for New Contributors

1. Start with [RALPH_TASK.md](../RALPH_TASK.md) - understand the goals
2. Read [PEEK_QUESTION_TREES.md](../PEEK_QUESTION_TREES.md) - understand the conversation logic
3. Review [BUG_DIAGNOSIS_CALIBRATION_LOOP.md](./BUG_DIAGNOSIS_CALIBRATION_LOOP.md) - understand the main bug
4. Check [HOME_PAGE_REDESIGN.md](./HOME_PAGE_REDESIGN.md) - understand the UI changes
5. Reference other docs as needed during implementation

