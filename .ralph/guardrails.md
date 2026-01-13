# Guardrails (Signs)

> Lessons learned from previous failures - read these before each iteration.

---

## 🚨 CRITICAL: Context Window Management

### ⛔ NEVER READ THESE FILES (Too Large)
- `lib/llm/question-trees.ts` (2071 lines) - Use split modules instead
- `app/check-in/[sessionId]/page.tsx` (1363 lines) - Use grep/search instead
- `.ralph/activity.log` - Don't read, just append
- `RALPH_ITERATION_3.md` (904 lines) - All info is now in RALPH_TASK.md
- `docs/question-trees/shopping-check-in.md` (865 lines) - All info is now in RALPH_TASK.md

### ✅ READ THESE INSTEAD (Small Modules)
- `lib/llm/question-trees/shopping.ts` (~233 lines)
- `lib/llm/question-trees/reflection.ts` (~138 lines)
- `lib/llm/question-trees/modes.ts` (~55 lines)
- `lib/llm/question-trees/types.ts` (~68 lines)
- `lib/llm/prompts.ts` (check size first with `wc -l`)

### 📍 FOR LARGE UI FILES: Use Targeted Reading
Instead of reading entire large files, use:
1. `grep` to find specific functions/components
2. `read_file` with `offset` and `limit` to read only relevant sections
3. Search for the function name, then read just that section

Example for `app/check-in/[sessionId]/page.tsx`:
```bash
# Find where a function is defined
grep -n "function handlePathSelect" app/check-in/[sessionId]/page.tsx
# Then read just lines 150-200
```

---

## Signs for Peek Check-In App

### ⚠️ Sign 1: Follow Question Trees Exactly
The question trees define EXACT options for Layer 1 questions. Do not paraphrase.

### ⚠️ Sign 2: LLM Wrapper is Critical
ALL LLM calls go through `lib/llm/client.ts` which reads from `NEXT_PUBLIC_LLM_MODEL` env var.

### ⚠️ Sign 3: Mode Assignment Timing
Modes are assigned AFTER Layer 2 probing completes, not before.

### ⚠️ Sign 4: Counter-Profiles Exit Early
When counter-profile signals are detected, exit gracefully.

### ⚠️ Sign 5: Yellow vs White Options
YELLOW = deeper probing (2-3 turns), WHITE = light probing (1 turn).

---

## General Signs

### ⚠️ Run Linting
Run `pnpm run lint` after code changes.

### ⚠️ Commit Frequently
Make small, focused commits. Git is the memory.

### ⚠️ Check File Size Before Reading
Run `wc -l <file>` before reading. If > 300 lines, use grep or read specific sections.
