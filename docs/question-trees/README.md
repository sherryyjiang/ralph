# Peek Check-Ins: Question Tree System

> A conversational framework for helping users understand their spending behavior through guided reflection.

---

## Documentation Structure

This documentation is split into focused files for easier navigation:

| File | Description |
|------|-------------|
| [shopping-check-in.md](./shopping-check-in.md) | Shopping question trees, modes, and counter-profiles |
| [food-check-in.md](./food-check-in.md) | Food/takeout question trees and modes |
| [coffee-check-in.md](./coffee-check-in.md) | Coffee & treats question trees and modes |
| [reflection-paths.md](./reflection-paths.md) | Layer 3 reflection paths (shared across check-ins) |
| [artifact-mapping.md](./artifact-mapping.md) | Memory → Artifact mapping system |

---

## System Overview

Peek Check-Ins uses **question trees** to guide users through structured conversations about their spending. Each conversation follows a three-layer architecture:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PEEK CHECK-IN ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────────┐                                                   │
│   │  LAYER 1         │  Orientation / Awareness Calibration              │
│   │  Entry Point     │  → Establish context, compare guess to reality    │
│   └────────┬─────────┘                                                   │
│            │                                                             │
│            ▼                                                             │
│   ┌──────────────────┐                                                   │
│   │  LAYER 2         │  Diagnosis / Mode Assignment                      │
│   │  Understanding   │  → Identify behavioral patterns and triggers      │
│   └────────┬─────────┘                                                   │
│            │                                                             │
│            ▼                                                             │
│   ┌──────────────────┐                                                   │
│   │  LAYER 3         │  Reflection / Evaluation                          │
│   │  Action          │  → Help user evaluate tradeoffs, decide next step │
│   └──────────────────┘                                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Two Check-In Types

| Type | Categories | Entry Point | Focus |
|------|------------|-------------|-------|
| **Pattern Check-In** | Food, Coffee/Treats | "How much/many did you spend?" | Recurring behavior patterns |
| **Transaction Debrief** | Shopping | "What was happening when you bought this?" | Single purchase psychology |

### Core Concepts

- **Modes** (`#mode-name`): Behavioral profiles assigned based on user responses. Only modes use the `#` prefix.
  - Examples: `#comfort-driven-spender`, `#intuitive-threshold-spender`, `#scroll-triggered`
- **Tags** (`tag: name`): Metadata for categorizing questions and responses. No `#` prefix.
  - Examples: `tag: purchase-context`, `tag: purchase-justification`, `tag: impulse-driven`
- **Blindspots**: Gaps in user awareness (frequency, timing, merchant concentration)
- **Counter-profiles**: Escape routes for users whose behavior is actually intentional/healthy

---

## System Comparison

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          CHECK-IN TYPE COMPARISON                                        │
├──────────────────┬─────────────────────┬─────────────────────┬──────────────────────────┤
│                  │      SHOPPING       │        FOOD         │    COFFEE/TREATS         │
├──────────────────┼─────────────────────┼─────────────────────┼──────────────────────────┤
│ Type             │ Transaction Debrief │ Pattern Check-In    │ Pattern Check-In         │
├──────────────────┼─────────────────────┼─────────────────────┼──────────────────────────┤
│ Entry Question   │ "When you bought    │ "How much did you   │ "How many times did      │
│                  │ this, were you..."  │ spend on takeout?"  │ you buy coffee?"         │
├──────────────────┼─────────────────────┼─────────────────────┼──────────────────────────┤
│ Focus            │ Single purchase     │ Monthly spending    │ Monthly frequency        │
│                  │ psychology          │ patterns            │ patterns                 │
├──────────────────┼─────────────────────┼─────────────────────┼──────────────────────────┤
│ # of Modes       │ ~15+                │ ~4                  │ ~4                       │
├──────────────────┼─────────────────────┼─────────────────────┼──────────────────────────┤
│ Mode Clusters    │ Impulse, Emotional, │ Stress, Convenience,│ Routine, Environment,   │
│                  │ External, Social,   │ Planning, Intentional│ Emotional, Productivity│
│                  │ Pattern             │                     │                          │
├──────────────────┼─────────────────────┼─────────────────────┼──────────────────────────┤
│ Awareness        │ Not applicable      │ Guess vs Actual $   │ Guess vs Actual count   │
│ Calibration      │ (starts from txn)   │                     │                          │
├──────────────────┼─────────────────────┼─────────────────────┼──────────────────────────┤
│ Key Blindspots   │ N/A                 │ Frequency, Timing,  │ Frequency, Timing,      │
│                  │                     │ Merchant            │ Merchant                 │
└──────────────────┴─────────────────────┴─────────────────────┴──────────────────────────┘
```

---

## Implementation Notes

### Tag System

All questions and responses are tagged for:
- **Analytics**: Track which modes are most common
- **Personalization**: Tailor future check-ins
- **LLM Context**: Help AI understand conversation state

Common tags:
- `#purchase-awareness` - Entry-level awareness questions
- `#purchase-justification` - Why questions
- `#impulse-driven` / `#deliberate-purchase` - Purchase intent
- `#frequency-blind` / `#aware-but-wants-change` - Blindspot types

### LLM Flexibility

The question trees are **guides, not scripts**. The LLM should:
- Allow users to exit at any point
- Let users clarify their thinking
- Explore other branches when user response doesn't fit
- Recognize counter-profiles and gracefully exit

### Dynamic Variables

Use placeholders that get filled with real data:
- `{x}` - Count or amount
- `{day}` / `{days}` - Day(s) of week
- `{merchant}` - Store/restaurant name
- `{emotion}` - Detected emotional state
- `{mode-benefit}` - Mode-specific benefit phrase

---

## Next Steps: Chat App Implementation

To build a chat app that implements these question trees, we need:

1. **Data Models**
   - Question tree structure (nodes, edges, conditions)
   - User session state (current node, mode, blindspots, tags)
   - Transaction data (for dynamic variable population)

2. **Conversation Engine**
   - State machine for tree traversal
   - LLM integration for natural responses
   - Mode detection from user responses

3. **UI Components**
   - Chat interface with message bubbles
   - Quick-reply buttons for options
   - Progress indicators

4. **Backend Services**
   - Session management
   - Transaction data API
   - Analytics/logging

