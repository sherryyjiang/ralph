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

## Tips & Best Practices

1. **Start with `ralph-once.sh`** - Run single iterations to learn how it works
2. **Keep tasks small** - Break big features into atomic criteria
3. **Write clear criteria** - Each `[ ]` should be testable
4. **Include a test command** - Put it in the YAML frontmatter
5. **Commit often** - Ralph's memory IS the git history
6. **Check guardrails** - Add "Signs" when things go wrong

---

## Next Steps

- [ ] Create a new task for Ralph
- [ ] Run Ralph and watch it work
- [ ] Learn about context rotation
- [ ] Learn about guardrails and "Signs"


