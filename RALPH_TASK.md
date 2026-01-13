---
task: Fix Shopping Question Tree Logic - Iteration 3
test_command: "pnpm test shopping-flow"
---

# Task: Fix Shopping Question Tree Logic - Iteration 3

Align shopping check-in flow precisely with `docs/question-trees/shopping-check-in.md` specification. The current implementation has drifted from the spec with incorrect Q1→Q2 mappings, "base mode" concepts that shouldn't exist, probing turn limit gaps, and missing Layer 3 reflection logic.

## Reference Documents

### Core Specs
- **RALPH_ITERATION_3.md** - Detailed implementation guide and success criteria
- **docs/question-trees/shopping-check-in.md** - Authoritative spec for shopping flow
- **.cursorrules/question-tree-design-and-testing.md** - Testing skill guide

### Previous Iterations
- **RALPH_ITERATION_2.md** - Previous iteration (inline entry questions, calibration fixes)
- **PEEK_CHECKIN_SPEC.md** - Original technical specification

---

## Success Criteria

### Phase A: Fix Core Data Structures
1. [x] Add `other` option to `getShoppingFixedQuestion1` options array
2. [ ] Remove "base mode" concept - all modes are flat (no `#visual-impulse-driven` as parent)
3. [ ] Update `shoppingExplorationGoals` to use exploration TAGS (not modes)
4. [ ] Fix `getFixedQuestion2Options` to use correct variable names (`*SubPathProbing`)
5. [ ] Add Q2 question text mapping (Q1 response → specific Q2 question)

### Phase B: Fix Fixed Q2 Options and Labels
6. [ ] Impulse Q2: question = "What made you go for it?", options = price_felt_right, treating_myself, caught_eye, trending, other
7. [ ] Deliberate Q2: question = "What were you waiting for?", options = afford_it, right_price, right_one, still_wanted, got_around, other
8. [ ] Deal Q2: question = "Tell me more about the deal, discount or limited event?", options = limited_edition, sale_discount, free_shipping
9. [ ] Gift Q2: question = "Who was it for?", options = family, friend, partner, coworker, other
10. [ ] Maintenance Q2: question = "Did you get the same thing or switched it up?", options = same_thing, switched_up, upgraded

### Phase C: Fix Mode Definitions (Flat, No Hierarchy)
11. [ ] Remove `#visual-impulse-driven` as a mode - it's only an exploration TAG
12. [ ] Remove `#trend-susceptibility-driven` as a mode - it's only an exploration TAG
13. [ ] Ensure all modes are flat: `#scroll-triggered`, `#in-store-wanderer`, `#aesthetic-driven`, etc.
14. [ ] Update `targetModes` in all SubPathProbing to list only actual modes

### Phase D: Add Counter-Profiles
15. [ ] Add `intentional-collector` counter-profile with patterns and exit message
16. [ ] Add `trend-but-fits-me` counter-profile with patterns and exit message
17. [ ] Add `deal-assisted-intentional` counter-profile with patterns and exit message
18. [ ] Add `no-clear-threshold` counter-profile with reroute logic

### Phase E: Add Layer 3 Reflection Logic
19. [ ] Implement reflection option routing (problem, feel, worth, different, done)
20. [ ] Add mode-based entry questions for Behavioral Excavation
21. [ ] Add mode-aware question adaptation for Emotional Reflection
22. [ ] Add mode-aware question adaptation for Cost Comparison
23. [ ] Add probing hints for each reflection path
24. [ ] Implement graceful exit messages

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

## Key Concepts

### Q1 → Q2 Mapping (Fixed Questions)
| Q1 Response | Q2 Question |
|-------------|-------------|
| "Saw it and bought it in the moment" | "What made you go for it?" |
| "Been thinking about this for a while" | "What were you waiting for?" |
| "A good deal/discount or limited drop made me go for it" | "Tell me more about the deal, discount or limited event?" |
| "Bought it for someone else" | "Who was it for?" |
| "Restocking or replacing" | "Did you get the same thing or switched it up?" |

### Probing Turn Limits
| Path Type | Probing Depth | Max Questions |
|-----------|---------------|---------------|
| Impulse (YELLOW) | Deep | 2-3 |
| Deal (YELLOW) | Moderate | 2-3 |
| Deliberate (WHITE) | Light | 1 |
| Gift (WHITE) | Light | 1 |
| Maintenance (WHITE) | Light | 1 |

### Modes Are FLAT (No Hierarchy)
- ❌ WRONG: `#visual-impulse-driven` as base mode with `#scroll-triggered` as submode
- ✅ CORRECT: `#scroll-triggered`, `#in-store-wanderer`, `#aesthetic-driven` are all equal-level modes

### Exploration Tags vs Modes
- **Tags** (used for categorization only): `#price-sensitivity-driven`, `#self-reward-driven`, `#visual-impulse-driven`, `#trend-susceptibility-driven`
- **Modes** (assigned after probing): `#intuitive-threshold-spender`, `#scroll-triggered`, `#social-media-influenced`, etc.

---

## Ralph Instructions

1. Read `RALPH_ITERATION_3.md` for full implementation details
2. Read `docs/question-trees/shopping-check-in.md` line by line
3. Work through phases in order: A → B → C → D → E → F → G → H
4. Run `pnpm test shopping-flow` after each phase
5. Commit after completing each numbered criterion
6. When ALL criteria are `[x]`, output: `<ralph>COMPLETE</ralph>`
7. If stuck on same issue 3+ times, output: `<ralph>GUTTER</ralph>`

