---
task: Fix Shopping Question Tree Logic - Iteration 3
test_command: "pnpm test shopping-flow"
---

# Task: Fix Shopping Question Tree Logic - Iteration 3

Complete the remaining phases to align shopping check-in flow with spec.

## Code Files

### ✅ SAFE TO READ (Small Files < 300 lines)

**Question Tree Modules:**
- `lib/llm/question-trees/shopping.ts` (233 lines) - Shopping Q1/Q2 logic
- `lib/llm/question-trees/reflection.ts` (137 lines) - Layer 3 reflection
- `lib/llm/question-trees/modes.ts` (55 lines) - Mode definitions
- `lib/llm/question-trees/types.ts` (68 lines) - Shared types

**Prompt Modules:**
- `lib/llm/prompts/fixed-questions.ts` (96 lines) - Q1/Q2 options
- `lib/llm/prompts/layer2-probing.ts` (111 lines) - Probing logic
- `lib/llm/prompts/layer3-reflection.ts` (275 lines) - Reflection prompts
- `lib/llm/prompts/system-prompts.ts` (78 lines) - Base prompts

### ⛔ NEVER READ (Will Cause Context Rotation)
- `lib/llm/question-trees.ts` (2071 lines) - Use modules above
- `lib/llm/prompts.ts` (839 lines) - Use modules above
- `app/check-in/[sessionId]/page.tsx` (1363 lines) - Use grep
- `__tests__/shopping-flow.test.ts` (1337 lines) - Use grep
- `lib/hooks/use-check-in-session.ts` (642 lines) - Use grep
- `app/api/chat/route.ts` (640 lines) - Use grep
- `RALPH_ITERATION_3.md` (904 lines) - All info is in this file
- `docs/question-trees/*.md` - All info is in this file

### 📍 FOR LARGE FILES: Use Targeted Reading
```bash
# Step 1: Check size
wc -l path/to/file.ts

# Step 2: Find function location
grep -n "functionName" path/to/file.tsx

# Step 3: Read just that section (lines 445-500)
# Use read_file with offset=445, limit=55
```

## Success Criteria

### Phase A-E: COMPLETE ✅
1. [x] Add `other` option to `getShoppingFixedQuestion1` options array
2. [x] Remove "base mode" concept - all modes are flat
3. [x] Update `shoppingExplorationGoals` to use exploration TAGS
4. [x] Fix `getFixedQuestion2Options` to use correct variable names
5. [x] Add Q2 question text mapping
6. [x] Impulse Q2: question = "What made you go for it?"
7. [x] Deliberate Q2: question = "What were you waiting for?"
8. [x] Deal Q2: question = "Tell me more about the deal?"
9. [x] Gift Q2: question = "Who was it for?"
10. [x] Maintenance Q2: question = "Did you get the same thing or switched it up?"
11. [x] Remove `#visual-impulse-driven` as a mode (it's only a TAG)
12. [x] Remove `#trend-susceptibility-driven` as a mode (it's only a TAG)
13. [x] Ensure all modes are flat
14. [x] Update `targetModes` to list only actual modes
15. [x] Add `intentional-collector` counter-profile
16. [x] Add `trend-but-fits-me` counter-profile
17. [x] Add `deal-assisted-intentional` counter-profile
18. [x] Add `no-clear-threshold` counter-profile
19. [x] Implement reflection option routing (problem, feel, worth, different, done)
20. [x] Add mode-based entry questions for Behavioral Excavation
21. [x] Add mode-aware question adaptation for Emotional Reflection
22. [x] Add mode-aware question adaptation for Cost Comparison
23. [x] Add probing hints for each reflection path
24. [x] Implement graceful exit messages

### Phase F: Update prompts.ts to Align
25. [ ] Update `getFixedQuestion2Options` to return both question text AND options
26. [ ] Update mode indicators to use only flat modes (not exploration tags)
27. [ ] Add reflection path prompts

### Phase G: Probing Turn Limits
28. [ ] Verify `lightProbing: true` is set on ALL deliberate sub-paths
29. [ ] Verify `lightProbing: true` is set on ALL gift sub-paths
30. [ ] Verify `lightProbing: true` is set on ALL maintenance sub-paths
31. [ ] Verify impulse sub-paths have `lightProbing: false` or undefined (defaults to 2-3)
32. [ ] Verify deal sub-paths have `lightProbing: false` or undefined (defaults to 2-3)
33. [ ] Add `maxProbingTurns` to SubPathProbing interface for explicit control
34. [ ] Update prompt to tell LLM exactly when to transition based on turn count
35. [ ] Verify `probingTurn` is tracked in session state and incremented on each LLM response

### Phase H: Testing
36. [ ] Create `__tests__/shopping-flow.test.ts` with Q1 → Q2 mapping tests
37. [ ] Add Q2 options tests for each path
38. [ ] Add mode assignment tests (flat modes only)
39. [ ] Add counter-profile detection tests
40. [ ] Add reflection path routing tests
41. [ ] Add probing turn limit tests (verify lightProbing = 1 turn, default = 2-3 turns)
42. [ ] Run all tests: `pnpm test shopping-flow`

---

## Reference Data (Inline - DO NOT read external docs)

### Q1 → Q2 Mapping
| Q1 Response | Q2 Question |
|-------------|-------------|
| impulse | "What made you go for it?" |
| deliberate | "What were you waiting for?" |
| deal | "Tell me more about the deal, discount or limited event?" |
| gift | "Who was it for?" |
| maintenance | "Did you get the same thing or switched it up?" |

### Q2 Options Per Path

**Impulse Q2 Options:**
- `price_felt_right` → "the price felt right"
- `treating_myself` → "treating myself"
- `caught_eye` → "just caught my eye"
- `trending` → "it's been trending lately"
- `other` → Other/Custom

**Deliberate Q2 Options:**
- `afford_it` → "waiting until I could afford it"
- `right_price` → "waiting for the right price/deal"
- `right_one` → "waiting for the right one"
- `still_wanted` → "letting it sit to see if I still wanted it"
- `got_around` → "finally got around to it"
- `other` → Other/Custom

**Deal Q2 Options:**
- `limited_edition` → "limited edition or drop that is running out"
- `sale_discount` → "it was a good sale, deal or discount"
- `free_shipping` → "hit free shipping threshold or got a bonus"

**Gift Q2 Options:**
- `family`, `friend`, `partner`, `coworker`, `other`

**Maintenance Q2 Options:**
- `same_thing` → "Got the same thing"
- `switched_up` → "Switched it up"
- `upgraded` → "Upgraded"

### Flat Modes (No Hierarchy)
All modes are equal-level. NO "base modes" or "submodes".

**From Impulse Path:**
- `#intuitive-threshold-spender` (from price_felt_right)
- `#reward-driven-spender`, `#comfort-driven-spender`, `#routine-treat-spender` (from treating_myself)
- `#scroll-triggered`, `#in-store-wanderer`, `#aesthetic-driven`, `#duplicate-collector`, `#exploration-hobbyist` (from caught_eye)
- `#social-media-influenced`, `#friend-peer-influenced` (from trending)

**From Deal Path:**
- `#scarcity-driven`, `#deal-driven`, `#threshold-spending-driven`

**From Deliberate Path:**
- `#deliberate-budget-saver`, `#deliberate-deal-hunter`, `#deliberate-researcher`, `#deliberate-pause-tester`, `#deliberate-low-priority`

**From Gift/Maintenance:**
- `#gift-giver`, `#loyal-repurchaser`, `#brand-switcher`, `#upgrader`

### Probing Turn Limits
| Path Type | lightProbing | Max Questions |
|-----------|--------------|---------------|
| Impulse (YELLOW) | false | 2-3 |
| Deal (YELLOW) | false | 2-3 |
| Deliberate (WHITE) | true | 1 |
| Gift (WHITE) | true | 1 |
| Maintenance (WHITE) | true | 1 |

### Reflection Paths (Layer 3)
| Option | Path | Entry Question |
|--------|------|----------------|
| `problem` | Behavioral Excavation | Mode-specific: "can you think of another time you {mode behavior}?" |
| `feel` | Emotional Reflection | "you spent ${price} on {item} — how does that land for you?" |
| `worth` | Cost Comparison | "you spent ${price} on {item} — that's the equivalent of {other item}. which feels like a better use?" |
| `different` | Open-Ended | "what's on your mind?" |
| `done` | Exit | "got it — thanks for walking through this with me." |

---

## Ralph Instructions

1. Read `.ralph/guardrails.md` FIRST for file size warnings
2. Read `lib/llm/question-trees/shopping.ts` (small, safe)
3. Read `lib/llm/prompts.ts` (check size with `wc -l` first)
4. Work through phases F → G → H in order
5. Run `pnpm test shopping-flow` after each criterion
6. Commit after completing each numbered criterion
7. When ALL criteria are `[x]`, output: `<ralph>COMPLETE</ralph>`
8. If stuck on same issue 3+ times, output: `<ralph>GUTTER</ralph>`

### ⚠️ Context Management Rules
- ALWAYS run `wc -l <file>` before reading any file
- If file > 300 lines, use `grep -n` to find the section you need
- NEVER read `lib/llm/question-trees.ts` (use split modules)
- NEVER read `app/check-in/[sessionId]/page.tsx` entirely (use grep)
