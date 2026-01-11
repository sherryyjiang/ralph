# Ralph Learnings Journal 📚

> A running log of what I'm learning about Ralph and autonomous coding agents.

---

## What is Ralph?

**Ralph Wiggum** is an autonomous development loop that uses AI agents to complete coding tasks with minimal supervision. The key insight:

> **Git is the memory, not the LLM context.**

When an AI agent runs out of context (token limit), Ralph "rotates" to a fresh agent that picks up from the last git commit.

---

## Core Concepts

### 1. The Task File (`RALPH_TASK.md`)
- Lives in the project root
- Contains the task description and **checkboxes** for success criteria
- Agent checks off `[ ]` → `[x]` as it completes work
- When ALL boxes are checked, task is COMPLETE

### 2. The State Directory (`.ralph/`)
- `progress.md` - What's been accomplished across sessions
- `guardrails.md` - "Signs" (lessons from failures) to avoid repeating mistakes
- `errors.log` - Failures detected during runs
- `activity.log` - Real-time tool call logging

### 3. The Scripts (`.cursor/ralph-scripts/`)
| Script | Purpose |
|--------|---------|
| `ralph-once.sh` | Run ONE iteration, then stop for review (best for learning!) |
| `ralph-setup.sh` | Interactive setup with model selection, branch options |
| `ralph-loop.sh` | CLI mode for power users and scripting |

---

## How Ralph Works (The Loop)

```
┌─────────────────────────────────────────────────────┐
│  1. Agent reads: RALPH_TASK.md, progress.md,        │
│     guardrails.md, errors.log                       │
├─────────────────────────────────────────────────────┤
│  2. Works on next unchecked criterion [ ]           │
├─────────────────────────────────────────────────────┤
│  3. Makes changes, commits frequently               │
├─────────────────────────────────────────────────────┤
│  4. Marks criterion complete [x]                    │
├─────────────────────────────────────────────────────┤
│  5. If context fills up → ROTATE to fresh agent     │
│     New agent reads progress from files + git       │
├─────────────────────────────────────────────────────┤
│  6. All criteria [x]? → COMPLETE! 🎉                │
└─────────────────────────────────────────────────────┘
```

---

## Session Log

### Session 1: 2026-01-11 — Setup & First Run

**What I did:**
- Created a new repo called `ralph`
- Set up a simple todo list task in `RALPH_TASK.md`
- Tried to run Ralph with `ralph-once.sh`

**What I learned:**
- Ralph requires the `agent` CLI to be installed and authenticated
- Run `agent login` to authenticate before using Ralph
- The agent CLI was installed via: `curl https://cursor.com/install -fsS | bash`

**Issue encountered:**
- Agent CLI was named `agent` not `cursor-agent` - had to update the scripts

**Status:** ✅ Agent CLI now authenticated and ready

---

### Session 2: 2026-01-11 — First Successful Ralph Run! 🎉

**What I did:**
1. Created a new task in `RALPH_TASK.md` for dark mode toggle
2. Reset `.ralph/progress.md` for the new task
3. Ran `ralph-once.sh` to let Ralph work on it

**Task Definition (how I wrote it):**
```markdown
---
task: Add dark mode toggle to the todo app
test_command: "npm run dev"
---

# Task: Dark Mode Toggle

## Success Criteria
1. [ ] Toggle button visible in top-right corner (sun/moon icon)
2. [ ] Clicking toggle switches between light and dark themes
... etc
```

**What Ralph did (from activity.log):**
1. Read all the state files (task, progress, guardrails, errors)
2. Read the existing `app/page.tsx` to understand current code
3. Made code changes to add the toggle
4. Ran linting to verify no errors
5. Committed with a descriptive message
6. Marked all criteria as `[x]` complete
7. Pushed to git

**Time to complete:** ~4 minutes for 5 criteria!

**Key insight:** Ralph read the existing code first, understood the structure, then made changes. It also ran linting multiple times to verify its work.

---

## Task Writing Template

```markdown
---
task: One-line description
test_command: "npm test" or "npm run dev"
---

# Task: Title

Brief description of what to build.

## Requirements
- Requirement 1
- Requirement 2

## Success Criteria
1. [ ] Specific, testable criterion
2. [ ] Another criterion
3. [ ] Each should be independently verifiable

## Technical Notes
- Helpful context for the agent
- What files to modify
- Any constraints or preferences

---

## Ralph Instructions
(Standard boilerplate - always include this)
```

---

## Tips & Best Practices

1. **Start with `ralph-once.sh`** - Run single iterations to learn how it works
2. **Keep tasks small** - Break big features into atomic criteria
3. **Write clear criteria** - Each `[ ]` should be testable
4. **Include a test command** - Put it in the YAML frontmatter
5. **Commit often** - Ralph's memory IS the git history
6. **Check guardrails** - Add "Signs" when things go wrong
7. **Include technical notes** - Help Ralph understand the codebase
8. **Reset progress.md** - When starting a new task, reset the progress file

---

## Command Reference

```bash
# Run single iteration (best for learning)
./.cursor/ralph-scripts/ralph-once.sh

# Interactive setup with options
./.cursor/ralph-scripts/ralph-setup.sh

# CLI mode (power users)
./.cursor/ralph-scripts/ralph-loop.sh -n 50 -m sonnet-4.5-thinking

# Watch Ralph work in real-time
tail -f .ralph/activity.log

# See what Ralph did
git log --oneline -10
```

---

## Next Steps

- [x] Create a new task for Ralph
- [x] Run Ralph and watch it work
- [ ] Learn about context rotation (happens with big tasks)
- [ ] Learn about guardrails and "Signs" (happens when things fail)
- [ ] Try a bigger multi-step task


