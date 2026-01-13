# Skill: Question Tree Design and Testing

> A comprehensive guide for designing, implementing, and testing Peek Check-In question trees.

---

## 1. Understanding Question Tree Files

Question trees are documented in `docs/question-trees/` as markdown files with ASCII diagrams. Each file represents a complete check-in flow.

### File Structure

| File | Check-In Type | Focus |
|------|---------------|-------|
| `shopping-check-in.md` | Transaction Debrief | Single purchase psychology |
| `food-check-in.md` | Pattern Check-In | Takeout/delivery patterns |
| `coffee-check-in.md` | Pattern Check-In | Small recurring purchases |
| `artifact-mapping.md` | Reference | Memory → Artifact mapping |

### Reading ASCII Tree Diagrams

Each tree follows a **3-layer architecture**:

```
LAYER 1: Orientation/Awareness Calibration
    ↓
LAYER 2: Diagnosis/Mode Assignment (LLM Probing)
    ↓
LAYER 3: Reflection/Evaluation
```

#### Diagram Element Key

```
┌─────────────────┐
│  BOX = Question │    Boxes represent questions asked to users
│  or Node        │
└────────┬────────┘
         │
         ▼              Arrows show flow direction
    ┌─────────┐
    │ OPTION  │         Option boxes represent user choices (quick replies)
    └────┬────┘
         │
         ▼
    [MODE ASSIGNMENT]   Square brackets = mode/outcome assignment
    
    [YELLOW]            Yellow = less intentional, needs probing
    [WHITE]             White = more intentional, lighter probing
    
    #mode-name          Hashtag prefix = behavioral mode (e.g., #comfort-driven-spender)
    tag: name           Tag prefix (no #) = metadata for categorization
```

#### Example: Reading a Branch

From `shopping-check-in.md`:

```
┌─────────────────────────────────────────┐
│  "When you bought this, were you..."    │  ← Fixed Question 1
└─────────────────────┬───────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    ▼                 ▼                 ▼
┌─────────┐     ┌─────────┐      ┌──────────┐
│ Saw it  │     │ Been    │      │ A good   │
│ and     │     │thinking │      │ deal     │
│ bought  │     │ about   │      │ made me  │
│ it      │     │ this    │      │ go for it│
│[YELLOW] │     │         │      │ [YELLOW] │
└────┬────┘     └────┬────┘      └────┬─────┘
     │               │                │
     ▼               ▼                ▼
[IMPULSE PATH]  [DELIBERATE PATH]  [DEAL PATH]
```

**Interpretation:**
- User is asked "When you bought this, were you..."
- Three options shown (more exist in full diagram)
- YELLOW boxes need deeper probing (less intentional behavior)
- Each option routes to a different exploration path

---

## 2. Question Tree Data Structures

Question trees are implemented in `lib/llm/question-trees.ts`. Key data structures:

### Fixed Question Response

```typescript
interface FixedQuestionResponse {
  content: string;           // The question text
  options: QuickReplyOption[];
}

interface QuickReplyOption {
  id: string;
  label: string;
  emoji?: string;
  value: string;
  color?: "yellow" | "white";  // Yellow = needs probing
}
```

### Exploration Goals (for LLM context)

```typescript
interface ExplorationGoal {
  path: string;
  goal: string;                           // What the LLM should understand
  probingHints: string[];                 // SPECIFIC questions to ask
  modeIndicators: Record<string, string[]>; // Mode → signals mapping
  counterProfilePatterns: string[];       // Exit ramps for intentional users
}
```

### Sub-Path Probing (Layer 2 detail)

```typescript
interface SubPathProbing {
  subPath: string;
  explorationGoal: string;
  probingHints: string[];        // REQUIRED probing questions
  targetModes: string[];         // Modes this path can assign
  modeSignals: Record<string, string[]>;  // What signals map to which mode
  counterProfileExit?: string;   // Graceful exit message
  lightProbing?: boolean;        // True for deliberate paths (1 question max)
}
```

---

## 3. Creating New Branches

### Step 1: Design in Markdown First

Create the ASCII diagram in the appropriate `docs/question-trees/` file:

```markdown
### New Sub-Path: "your new option" → `#your-mode-name`

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #your-mode-name                                                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  What are you trying to understand about this behavior pattern?                          │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "Specific question 1?"                                                                │
│  • "Specific question 2?"                                                                │
│                                                                                          │
│  KEY SIGNALS:                                                                            │
│  • "signal phrase 1"                                                                     │
│  • "signal phrase 2"                                                                     │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Step 2: Implement in question-trees.ts

Add the sub-path to the appropriate record:

```typescript
export const yourPathSubPathGoals: Record<string, SubPathExplorationGoal> = {
  // ... existing sub-paths ...
  
  your_new_option: {
    subPath: "your_new_option",
    mode: "#your-mode-name",
    explorationGoal: "What are you trying to understand about this behavior pattern?",
    probingHints: [
      "Specific question 1?",
      "Specific question 2?",
    ],
    keySignals: [
      "signal phrase 1",
      "signal phrase 2",
    ],
    lightProbing: false,  // or true for deliberate paths
  },
};
```

### Step 3: Add Mode Definition

```typescript
export const modeDefinitions: Record<string, ModeDefinition> = {
  // ... existing modes ...
  
  "#your-mode-name": {
    id: "#your-mode-name",
    name: "Your Mode Display Name",
    description: "One sentence describing this behavioral pattern",
    indicators: [
      "signal phrase 1",
      "signal phrase 2",
    ],
    reflectionGuidance: "How to help users reflect on this pattern",
  },
};
```

### Step 4: Update Fixed Question Options (if adding new Q1/Q2 option)

In `lib/llm/prompts.ts`:

```typescript
export function getFixedQuestion2Options(category: TransactionCategory, path: string): QuickReplyOption[] | undefined {
  const q2Options: Record<string, QuickReplyOption[]> = {
    your_path: [
      // ... existing options ...
      { 
        id: "your_new_option", 
        label: "Your option label", 
        emoji: "🎯", 
        value: "your_new_option", 
        color: "yellow"  // or "white" for deliberate
      },
    ],
  };
}
```

---

## 4. LLM Probing Rules

### REQUIRED: Use Specific Probing Hints

The LLM MUST use questions from `probingHints` array. Generic questions are PROHIBITED.

**✅ GOOD (from spec):**
- "What price did you get it for?"
- "What price would've made you pause?"
- "Where did you go for your research?"

**❌ BAD (generic):**
- "Can you tell me more about that?"
- "What factors did you consider?"
- "How did that make you feel?"
- "Can you elaborate on that?"

### Probing Depth by Path Type

| Path Type | Probing Depth | Max Exchanges |
|-----------|---------------|---------------|
| Impulse (YELLOW) | Deep | 2-3 |
| Deal (YELLOW) | Moderate | 2-3 |
| Deliberate (WHITE) | Light | 1 |
| Gift | Light | 1 |
| Maintenance | Light | 1 |

### Counter-Profile Detection (Exit Ramps)

When user shows intentional behavior on an impulse/deal path, exit gracefully:

```typescript
counterProfilePatterns: [
  "Actually had this on my list for a while",
  "I would have bought it anyway",
  "It's something I've been researching",
]
```

Exit response example:
```
"It sounds like this was actually more planned — that's great! 
Nothing wrong with a deliberate purchase."
```

---

## 5. Testing Question Trees

### Test Categories

1. **Fixed Question Tests**: Verify options, colors, and structure
2. **Path Routing Tests**: Verify correct sub-path routing
3. **Mode Assignment Tests**: Verify correct mode → signals mapping
4. **Probing Adherence Tests**: Verify specific questions are used
5. **Graceful Exit Tests**: Verify counter-profile detection

### Test File Structure

Tests live in `__tests__/`:
- `shopping-flow.test.ts` - Shopping question tree tests
- `mode-detection.test.ts` - Mode indicator pattern tests
- `integration-flows.test.ts` - Full flow integration tests

### Essential Test Patterns

#### 1. Fixed Question Option Tests

```typescript
describe("Shopping Fixed Question 1", () => {
  const options = getFixedQuestion1Options("shopping");

  it("should have exactly 5 path options", () => {
    expect(options).toHaveLength(5);
  });

  it("should include all required paths", () => {
    const values = options.map(o => o.value);
    expect(values).toContain("impulse");
    expect(values).toContain("deliberate");
    expect(values).toContain("deal");
    expect(values).toContain("gift");
    expect(values).toContain("maintenance");
  });

  it("should mark impulse and deal as yellow (less intentional)", () => {
    const impulse = options.find(o => o.value === "impulse");
    const deal = options.find(o => o.value === "deal");
    expect(impulse?.color).toBe("yellow");
    expect(deal?.color).toBe("yellow");
  });
});
```

#### 2. Sub-Path Routing Tests

```typescript
describe("Impulse Sub-Path Exploration Goals", () => {
  it("should have exploration goals for all impulse sub-paths", () => {
    expect(impulseSubPathGoals.price_felt_right).toBeDefined();
    expect(impulseSubPathGoals.treating_myself).toBeDefined();
    expect(impulseSubPathGoals.caught_eye).toBeDefined();
    expect(impulseSubPathGoals.trending).toBeDefined();
  });

  it("price_felt_right should target #intuitive-threshold-spender mode", () => {
    const goal = impulseSubPathGoals.price_felt_right;
    expect(goal.mode).toBe("#intuitive-threshold-spender");
  });
});
```

#### 3. Probing Adherence Tests

```typescript
describe("Probing Adherence - right_one Path", () => {
  it("should have REQUIRED probing hints", () => {
    const goal = deliberateSubPathGoals.right_one;
    expect(goal.probingHints.length).toBeGreaterThan(0);
    
    // Check for specific required questions
    expect(goal.probingHints[0]).toContain("Where did you go for your research");
    expect(goal.probingHints[1]).toContain("Where did you end up finding it");
  });

  it("should NOT use generic questions", () => {
    const hints = goal.probingHints.join(" ").toLowerCase();
    expect(hints).not.toContain("can you tell me more");
    expect(hints).not.toContain("what factors did you consider");
    expect(hints).not.toContain("can you elaborate");
  });
});
```

#### 4. Mode Signal Tests

```typescript
describe("Mode Indicator Coverage", () => {
  it("should detect comfort-driven-spender from impulse path", () => {
    const indicators = explorationGoals.impulse.modeIndicators;
    const hasComfort = indicators.some(i => i.toLowerCase().includes("comfort"));
    expect(hasComfort).toBe(true);
  });
});
```

#### 5. Graceful Exit Tests

```typescript
describe("Graceful Exit Detection", () => {
  it("should mark deliberate sub-paths for light probing", () => {
    expect(getSubPathProbing("deliberate", "afford_it")?.lightProbing).toBe(true);
    expect(getSubPathProbing("deliberate", "right_one")?.lightProbing).toBe(true);
  });

  it("should have counter-profile patterns for impulse path", () => {
    expect(explorationGoals.impulse.counterProfilePatterns.length).toBeGreaterThan(0);
  });
});
```

### Running Tests

```bash
# Run all question tree tests
pnpm test shopping-flow
pnpm test mode-detection

# Run specific test file
pnpm test __tests__/shopping-flow.test.ts

# Run tests in watch mode
pnpm test --watch
```

---

## 6. Step-by-Step Testing Checklist

When adding or modifying a question tree path:

### Pre-Implementation Checklist

- [ ] ASCII diagram designed in `docs/question-trees/`
- [ ] Exploration goal documented (🔵 blue box)
- [ ] Probing hints documented (🟢 green box)  
- [ ] Key signals/mode indicators documented
- [ ] Counter-profile patterns identified (if applicable)
- [ ] Target mode identified with `#mode-name` format

### Implementation Checklist

- [ ] Sub-path added to appropriate `*SubPathGoals` record
- [ ] Mode definition added to `modeDefinitions`
- [ ] Quick reply option added to `getFixedQuestion2Options`
- [ ] Probing hints are SPECIFIC (not generic)

### Test Checklist

- [ ] Fixed question options test exists
- [ ] Sub-path routing test exists
- [ ] Mode assignment test exists
- [ ] Probing adherence test exists
- [ ] Light probing flag tested (if deliberate path)
- [ ] Counter-profile detection tested (if applicable)
- [ ] Graceful exit tested (if applicable)

### Validation Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No linting errors: `pnpm lint`
- [ ] Manual flow test in browser (optional but recommended)

---

## 7. Common Patterns & Gotchas

### Pattern: Mode Branching

Some sub-paths branch to multiple modes (e.g., "treating_myself" → 3 possible modes):

```typescript
treating_myself: {
  subPath: "treating_myself",
  mode: "",  // Determined by probing
  possibleModes: [
    "#reward-driven-spender",
    "#comfort-driven-spender",
    "#routine-treat-spender",
  ],
}
```

### Pattern: Counter-Profile Exit

For paths that might be intentional:

```typescript
trending: {
  // ...
  counterProfileExit: "If user confirms 'it's me' when asked if it's them or a trend buy, exit gracefully",
}
```

### Gotcha: Yellow vs White Colors

- **YELLOW** = Less intentional → needs probing → `lightProbing: false`
- **WHITE** = More intentional → light probing → `lightProbing: true`

### Gotcha: Mode Prefix

- Modes always use `#` prefix: `#comfort-driven-spender`
- Tags use `tag:` prefix without `#`: `tag: purchase-justification`

### Gotcha: Probing Depth

Deliberate paths should NEVER have deep probing. If a test shows `lightProbing: false` for a deliberate path, that's a bug.

---

## 8. Quick Reference: All Shopping Modes

### Impulse Path Modes
- `#intuitive-threshold-spender` - price_felt_right
- `#reward-driven-spender` - treating_myself (celebrating)
- `#comfort-driven-spender` - treating_myself (retail therapy)
- `#routine-treat-spender` - treating_myself (habitual)
- `#visual-impulse-driven` - caught_eye
- `#scroll-triggered` - caught_eye (online)
- `#in-store-wanderer` - caught_eye (physical)
- `#aesthetic-driven` - caught_eye (appearance)
- `#trend-susceptibility-driven` - trending
- `#social-media-influenced` - trending (TikTok/IG)
- `#friend-peer-influenced` - trending (recommendations)

### Deal Path Modes
- `#scarcity-driven` - limited_edition
- `#deal-driven` - sale_discount
- `#threshold-spending-driven` - free_shipping

### Deliberate Path Modes
- `#deliberate-budget-saver` - afford_it
- `#deliberate-deal-hunter` - right_price
- `#deliberate-researcher` - right_one
- `#deliberate-pause-tester` - still_wanted
- `#deliberate-low-priority` - got_around

### Gift Path Modes
- `#gift-giver`
- `#planned-gift`
- `#spontaneous-gift`

### Maintenance Path Modes
- `#maintenance-buyer`
- `#loyal-repurchaser`
- `#upgrader`
- `#brand-switcher`

