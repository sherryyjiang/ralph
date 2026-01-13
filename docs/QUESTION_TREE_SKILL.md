# Question Tree Design and Testing Skill

> Quick reference for working with Peek Check-In question trees in Ralph.

---

## Quick Start

### Key Files

| Purpose | Location |
|---------|----------|
| **Design Specs** (ASCII diagrams) | `docs/question-trees/*.md` |
| **Implementation** | `lib/llm/question-trees.ts` |
| **LLM Prompts** | `lib/llm/prompts.ts` |
| **Tests** | `__tests__/shopping-flow.test.ts`, `__tests__/mode-detection.test.ts` |

---

## Reading Question Tree Diagrams

### 3-Layer Architecture

```
LAYER 1 → Entry/Calibration (Fixed questions with quick replies)
LAYER 2 → Diagnosis/Probing (LLM asks SPECIFIC questions, assigns mode)
LAYER 3 → Reflection (User-directed exploration)
```

### Diagram Key

| Symbol | Meaning |
|--------|---------|
| `[YELLOW]` | Less intentional → needs deep probing |
| `[WHITE]` | More intentional → light probing |
| `#mode-name` | Behavioral mode (always has `#` prefix) |
| `tag: name` | Metadata tag (no `#` prefix) |
| `🔵 EXPLORATION GOAL` | What LLM should understand |
| `🟢 PROBING HINTS` | SPECIFIC questions LLM must use |

---

## Creating New Paths

### 1. Design in Markdown
Add ASCII diagram to `docs/question-trees/[category]-check-in.md`

### 2. Implement in TypeScript
Add to `lib/llm/question-trees.ts`:

```typescript
your_path: {
  subPath: "your_path",
  mode: "#your-mode-name",
  explorationGoal: "What to understand",
  probingHints: ["Specific question 1?", "Specific question 2?"],
  keySignals: ["signal phrase 1", "signal phrase 2"],
  lightProbing: false,  // true for deliberate paths
}
```

### 3. Add Mode Definition

```typescript
"#your-mode-name": {
  id: "#your-mode-name",
  name: "Display Name",
  description: "One sentence description",
  indicators: ["signal 1", "signal 2"],
  reflectionGuidance: "How to help user reflect",
}
```

---

## LLM Probing Rules

### ✅ REQUIRED: Use Specific Hints
```
"What price did you get it for?"
"Where did you go for your research?"
"What were you treating yourself for?"
```

### ❌ PROHIBITED: Generic Questions
```
"Can you tell me more about that?"
"What factors did you consider?"
"How did that make you feel?"
```

### Probing Depth

| Path Type | Depth | Max Exchanges |
|-----------|-------|---------------|
| Impulse (YELLOW) | Deep | 2-3 |
| Deal (YELLOW) | Moderate | 2-3 |
| Deliberate | Light | 1 |
| Gift/Maintenance | Light | 1 |

---

## Testing Checklist

### Required Tests for Each Path

- [ ] **Options Test**: Fixed question has correct options
- [ ] **Routing Test**: Sub-path maps to correct mode
- [ ] **Probing Test**: Hints are specific, not generic
- [ ] **Mode Test**: Mode has indicators and reflection guidance
- [ ] **Light Probing Test**: Deliberate paths have `lightProbing: true`
- [ ] **Counter-Profile Test**: Exit ramps defined for YELLOW paths

### Run Tests

```bash
pnpm test shopping-flow      # Shopping flow tests
pnpm test mode-detection     # Mode indicator tests
pnpm test                    # All tests
```

---

## Shopping Modes Quick Reference

### Impulse Path (YELLOW - deep probing)
- `#intuitive-threshold-spender` ← "price felt right"
- `#comfort-driven-spender` ← "treating myself" (stress)
- `#reward-driven-spender` ← "treating myself" (celebration)
- `#routine-treat-spender` ← "treating myself" (habit)
- `#visual-impulse-driven` ← "caught my eye"
- `#trend-susceptibility-driven` ← "trending lately"

### Deal Path (YELLOW - moderate probing)
- `#scarcity-driven` ← "limited edition"
- `#deal-driven` ← "sale/discount"
- `#threshold-spending-driven` ← "free shipping"

### Deliberate Path (WHITE - light probing)
- `#deliberate-budget-saver` ← "afford it"
- `#deliberate-deal-hunter` ← "right price"
- `#deliberate-researcher` ← "right one"
- `#deliberate-pause-tester` ← "still wanted"
- `#deliberate-low-priority` ← "got around to it"

---

## Common Gotchas

1. **Mode prefix**: Always `#mode-name`, never just `mode-name`
2. **Deliberate paths**: Must have `lightProbing: true`
3. **Counter-profiles**: Only for YELLOW paths (impulse/deal)
4. **Probing hints**: Must be SPECIFIC, never generic

---

## Full Documentation

See `.cursorrules/question-tree-design-and-testing.md` for comprehensive guide.

