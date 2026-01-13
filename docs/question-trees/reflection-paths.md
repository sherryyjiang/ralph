# Layer 3: Reflection Paths

> **Shared across all check-in types**  
> After mode assignment, users choose how they want to explore their behavior. This is **user-directed**—they pick what resonates.

---

## Reflection Options

```
                              ┌─────────────────────────────────┐
                              │    "Want to dig deeper?"         │
                              └────────────────┬────────────────┘
                                               │
          ┌────────────────┬───────────────────┼───────────────────┬────────────────┐
          │                │                   │                   │                │
          ▼                ▼                   ▼                   ▼                ▼
   ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
   │"Is this a    │ │"How do I     │ │"Is this a good  │ │"I have a     │ │"I'm good     │
   │ problem?"    │ │ feel about   │ │ use of money?"  │ │ different    │ │ for now"     │
   │              │ │ this?"       │ │                 │ │ question"    │ │              │
   └──────┬───────┘ └──────┬───────┘ └───────┬─────────┘ └──────┬───────┘ └──────┬───────┘
          │                │                 │                  │                │
          ▼                ▼                 ▼                  ▼                ▼
    Behavioral       Emotional          Cost                Open-ended        [EXIT]
    Excavation       Reflection         Comparison          Exploration
       Path             Path               Path
```

---

## Path 1: "Is this a problem?" — Behavioral Excavation

> **Exploration Goal:** Surface how often autopilot behavior kicks in, and whether the user is actually using what they buy or it's piling up.

**V1 Approach (No Historical Data):** Since we only have threshold data on day 1 (e.g., purchases <$50), we use a **no-data fallback** that asks users to recall patterns from memory rather than showing them aggregated transaction history.

### Mode-Based Entry Questions

The entry question is **dynamically generated based on the assigned mode**:

| Mode | Entry Question |
|------|----------------|
| `#intuitive-threshold-spender` | "can you think of another time you bought something just because the price felt right?" |
| `#reward-driven-spender` | "can you think of another time you bought something to celebrate or reward yourself?" |
| `#comfort-driven-spender` | "can you think of another time you shopped because you were stressed or needed a pick-me-up?" |
| `#routine-treat-spender` | "can you think of another time you treated yourself as part of your regular routine?" |
| `#visual-impulse-driven` / `#scroll-triggered` / `#in-store-wanderer` | "can you think of another time something just caught your eye and you went for it?" |
| `#trend-susceptibility-driven` / `#social-media-influenced` | "can you think of another time you bought something because everyone seemed to have it?" |
| `#scarcity-driven` | "can you think of another time you bought something because it was running out or limited?" |
| `#deal-driven` | "can you think of another time a sale or deal made you go for something?" |
| `#threshold-spending-driven` | "can you think of another time you added stuff to hit free shipping or get a bonus?" |

### Probing Question Hints

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  🔵 EXPLORATION GOAL:                                                                    │
│  How often does this autopilot behavior kick in? Are they using the items or are        │
│  they piling up?                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│                                                                                          │
│  FREQUENCY CHECK:                                                                        │
│  • "does this feel like something that happens a lot, sometimes, or rarely?"             │
│                                                                                          │
│  USAGE/OUTCOME CHECK:                                                                    │
│  • "what usually happens with the stuff that slides through — do you end up using it?"  │
│                                                                                          │
│  COMFORT CHECK (Transition to Emotional):                                                │
│  • "does that sit okay with you or is there something about it that bugs you?"           │
│                                                                                          │
│  ROOT CAUSE (If it bugs them):                                                           │
│  • "if it doesn't feel great, what do you think is behind that?"                         │
│                                                                                          │
│  BARRIER EXPLORATION (If pattern persists):                                              │
│  • "you said it bugs you but it keeps happening — what do you think gets in the way?"   │
│                                                                                          │
│  CONTEXT MEMORY HOOKS (use info from Layer 2):                                           │
│  • Reference {place}: "does this happen more at {merchant} specifically?"                │
│  • Reference {item}: "do you have a lot of {category} already?"                          │
│  • Reference {timing}: "is this usually a {day of week} thing?"                          │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Path 2: "How do I feel about this?" — Emotional Reflection

> **Exploration Goal:** Surface the gut reaction to seeing the amount spent on autopilot and help the user name why they feel that tension.

```
┌───────────────────────────────────────┐
│  "how do i feel about this?"           │
│                                        │
│  (LLM adapts based on mode)            │
└─────────────────┬─────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────┐
│  ENTRY:                                │
│  "you spent ${price} on {item} —       │
│   how does that land for you?"         │
└─────────────────┬─────────────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
  ┌─────────┐          ┌─────────────┐
  │  "meh"  │          │ "bothers me"│
  └────┬────┘          └──────┬──────┘
       │                      │
       ▼                      ▼
  [Light check]         [Tension exploration]
  "want to explore       "is it the amount,
   anyway?"               the frequency, or
                          something else?"
                              │
                              ▼
                    [Values alignment]
                    "does this line up with
                     how you want to spend?"
```

### Mode-Aware Question Adaptation

The questions are **structurally the same** but the LLM should **incorporate mode context**:

| Mode | Generic Question | Mode-Adapted Question |
|------|------------------|----------------------|
| `#comfort-driven-spender` | "does this sit well with you?" | "does spending money shopping because you're stressed sit well with you?" |
| `#routine-treat-spender` | "does this sit well with you?" | "does spending money on these regular treats sit well with you?" |
| `#visual-impulse-driven` | "does this sit well with you?" | "does buying things just because they caught your eye sit well with you?" |
| `#deal-driven` | "does this sit well with you?" | "does buying things because they were on sale sit well with you?" |

### Probing Question Hints

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  🔵 EXPLORATION GOAL:                                                                    │
│  Surface gut reaction to spending. Help user name the tension they feel.                │
│  This path is for users who aren't sure if it's a "problem" but know something          │
│  feels off.                                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ENTRY APPROACH:                                                                         │
│  Reflect back what we know:                                                              │
│  • "you mentioned you spent ${price} on {item} — how does that number land for you?"     │
│  • "when you think about this purchase, what comes up?"                                  │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│                                                                                          │
│  NAMING THE FEELING:                                                                     │
│  • "is it more of a 'meh' or does it actually bother you?"                               │
│  • "if you had to name what you're feeling, what would it be?"                           │
│                                                                                          │
│  TENSION EXPLORATION:                                                                    │
│  • "what is it about this that's creating the tension?"                                  │
│  • "is it the amount, the frequency, or something else?"                                 │
│                                                                                          │
│  VALUES ALIGNMENT:                                                                       │
│  • "does this feel like it lines up with how you want to spend?"                         │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Path 3: "Is this a good use of money?" — Cost Comparison

> **Exploration Goal:** Compare to benchmarks, evaluate tradeoffs, surface opportunity cost.

```
┌───────────────────────────────────────┐
│  "is this a good use of money?"        │
│                                        │
│  (LLM adapts based on mode)            │
└─────────────────┬─────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────┐
│  COMPARISON FRAMING:                   │
│  "you spent ${price} on {item} —       │
│   that's the equivalent of             │
│   {other item}"                        │
└─────────────────┬─────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────┐
│  "which one feels like a better        │
│   use of money?"                       │
└─────────────────┬─────────────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
  ┌──────────┐         ┌──────────┐
  │ This one │         │ The other│
  └────┬─────┘         └────┬─────┘
       │                    │
       ▼                    ▼
  [Utility check]     [Regret test]
  "will you get       "if you had to
   a lot of use        spend that again,
   out of it?"         would you?"
```

### Mode-Aware Question Adaptation

| Mode | Generic Question | Mode-Adapted Question |
|------|------------------|----------------------|
| `#threshold-spending-driven` | "is this a good use of money?" | "was adding those extra items to hit free shipping worth the ${X} you spent?" |
| `#scarcity-driven` | "if you had to spend that again, would you?" | "if that limited drop came back, would you buy it again at ${price}?" |
| `#reward-driven-spender` | "is this something you'll get a lot of use out of?" | "is this reward something you'll get a lot of use out of?" |

### Probing Question Hints

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  🔵 EXPLORATION GOAL:                                                                    │
│  Make abstract spending concrete through comparisons. Surface opportunity cost          │
│  by showing what else the money could have been.                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│                                                                                          │
│  ITEM-TO-ITEM COMPARISON:                                                                │
│  • "you spent ${price} on {item} — that's the equivalent of {other item}.               │
│     which one feels like a better use of money?"                                         │
│     🔧 V1 NOTE: May need hardcoded comparisons by price tier until we have user data    │
│                                                                                          │
│  UTILITY/VALUE CHECK:                                                                    │
│  • "is this something you'll get a lot of use out of?"                                   │
│                                                                                          │
│  REGRET TEST:                                                                            │
│  • "if you had to spend that ${price} again, would you?"                                 │
│                                                                                          │
│  COST-PER-USE (for durable goods):                                                       │
│  • "if you use this {X times}, that's about ${Y} per use — does that feel worth it?"    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Path 4: "I have a different question" — Open-Ended

> **Exploration Goal:** Let user drive. They may have something specific on their mind.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  🔵 EXPLORATION GOAL:                                                                    │
│  User-directed exploration. Meet them where they are.                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ENTRY:                                                                                  │
│  • "what's on your mind?"                                                                │
│  • "what are you curious about?"                                                         │
│                                                                                          │
│  LLM BEHAVIOR:                                                                           │
│  • Listen for keywords that map to other reflection paths                                │
│  • If they ask about frequency → route to Behavioral Excavation                          │
│  • If they express feelings → route to Emotional Reflection                              │
│  • If they ask about value/worth → route to Cost Comparison                              │
│  • If novel question → answer directly and offer to continue                             │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Path 5: "I'm good for now" — Exit

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXIT GRACEFULLY                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RESPONSES:                                                                              │
│  • "got it — thanks for walking through this with me."                                   │
│  • "cool, we can always pick this up later if something comes up."                       │
│                                                                                          │
│  OPTIONAL (if mode was assigned):                                                        │
│  • "i'll keep an eye on this pattern and check in if i notice it happening again."       │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Related Documentation

- [Shopping Check-In](./shopping-check-in.md)
- [Food Check-In](./food-check-in.md)
- [Coffee Check-In](./coffee-check-in.md)
- [Artifact Mapping](./artifact-mapping.md)

