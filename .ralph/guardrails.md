# Guardrails (Signs)

> Lessons learned from previous failures - read these before each iteration.

---

## Signs for Peek Check-In App

### ⚠️ Sign 1: Follow Question Trees Exactly
The question trees in `PEEK_QUESTION_TREES.md` define EXACT options for Layer 1 questions. Do not paraphrase or change the wording.

### ⚠️ Sign 2: LLM Wrapper is Critical
ALL Gemini calls must go through `lib/llm/client.ts` which reads from `NEXT_PUBLIC_LLM_MODEL` env var. Never hardcode model names.

### ⚠️ Sign 3: Mode Assignment Timing
Modes are assigned AFTER Layer 2 probing completes, not before. The probing reveals which mode applies.

### ⚠️ Sign 4: Counter-Profiles Exit Early
When counter-profile signals are detected (intentional behavior), exit gracefully. Don't force users through full probing.

### ⚠️ Sign 5: Yellow vs White Options
In the spec, [YELLOW] options indicate less intentional spending that requires deeper probing. [WHITE] options are more deliberate and need lighter probing.

---

## General Signs (from previous tasks)

### ⚠️ Always Read Before Editing
Read the full file before making changes. Understand existing patterns.

### ⚠️ Run Linting
Run `npm run lint` after code changes to catch errors early.

### ⚠️ Commit Frequently
Make small, focused commits. Git is the memory.
