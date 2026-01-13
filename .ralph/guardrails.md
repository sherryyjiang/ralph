# Guardrails (Signs)

> Lessons learned from previous failures - read these before each iteration.

---

## 🚨 CRITICAL: Context Window Management

### ⛔ NEVER READ THESE FILES (Will Cause Context Rotation)

**Code Files (> 500 lines):**
| File | Lines | Alternative |
|------|-------|-------------|
| `lib/llm/question-trees.ts` | 2071 | Use `lib/llm/question-trees/*.ts` modules |
| `lib/llm/prompts.ts` | 839 | Use `lib/llm/prompts/*.ts` modules |
| `app/check-in/[sessionId]/page.tsx` | 1363 | Use grep to find specific sections |
| `__tests__/shopping-flow.test.ts` | 1337 | Use grep to find specific tests |
| `__tests__/integration-flows.test.ts` | 712 | Use grep to find specific tests |
| `lib/hooks/use-check-in-session.ts` | 642 | Use grep to find specific sections |
| `app/api/chat/route.ts` | 640 | Use grep to find specific sections |

**Doc Files (> 500 lines):**
| File | Lines | Alternative |
|------|-------|-------------|
| `PEEK_QUESTION_TREES.md` | 1903 | Info consolidated in RALPH_TASK.md |
| `RALPH_ITERATION_3.md` | 903 | Info consolidated in RALPH_TASK.md |
| `docs/question-trees/shopping-check-in.md` | 864 | Info consolidated in RALPH_TASK.md |
| `PEEK_CHECKIN_SPEC.md` | 706 | Only read if absolutely needed |
| `RALPH_ITERATION_2.md` | 564 | Historical, don't read |
| `.cursorrules/*` | 527 | Don't read |

**State Files:**
| File | Alternative |
|------|-------------|
| `.ralph/activity.log` | Don't read, just append |
| `.ralph/archive/*` | Never read |

### ✅ SAFE TO READ (< 300 lines)

**Question Tree Modules:**
- `lib/llm/question-trees/shopping.ts` (233 lines)
- `lib/llm/question-trees/reflection.ts` (137 lines)
- `lib/llm/question-trees/modes.ts` (55 lines)
- `lib/llm/question-trees/types.ts` (68 lines)
- `lib/llm/question-trees/food.ts` (152 lines)
- `lib/llm/question-trees/coffee.ts` (251 lines)

**Prompt Modules (NEW):**
- `lib/llm/prompts/fixed-questions.ts` (96 lines) - Q1/Q2 options
- `lib/llm/prompts/system-prompts.ts` (78 lines) - Base prompts
- `lib/llm/prompts/layer2-probing.ts` (111 lines) - Probing logic
- `lib/llm/prompts/layer3-reflection.ts` (275 lines) - Reflection prompts
- `lib/llm/prompts/category-prompts.ts` (137 lines) - Food/Coffee prompts
- `lib/llm/prompts/exploration-goals.ts` (35 lines) - Goals
- `lib/llm/prompts/index.ts` (42 lines) - Re-exports

**Other Small Files:**
- `lib/types/index.ts` (221 lines)
- `lib/hooks/use-chat-api.ts` (182 lines)
- `lib/llm/client.ts` (157 lines)
- `components/chat/chat-container.tsx` (159 lines)
- `lib/api/chat-client.ts` (129 lines)
- `app/page.tsx` (314 lines) - OK to read

### 📍 FOR LARGE FILES: Use Targeted Reading

**Step 1: Find what you need**
```bash
# Find function/component location
grep -n "functionName" path/to/file.tsx

# Find all exports
grep -n "^export" path/to/file.ts
```

**Step 2: Read just that section**
```bash
# If grep shows line 450, read lines 445-500
# Use read_file with offset=445, limit=55
```

**Step 3: Before ANY file read**
```bash
wc -l path/to/file.ts
# If > 300 lines, use grep first
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
