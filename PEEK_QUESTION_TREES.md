# Peek Check-Ins: Question Tree System

> A conversational framework for helping users understand their spending behavior through guided reflection.

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

## Shopping Check-In

> **Type:** Transaction Debrief  
> **Focus:** Single purchase psychology—understanding *why* users buy things

Shopping is the most complex check-in because it has the most modes and the richest variation in single-purchase motivations. The flow has **two fixed question sets** before LLM probing begins.

---

### Layer 1: Orientation (Two Fixed Question Sets)

#### Fixed Question 1: "When you bought this, were you..."

```
                              ┌─────────────────────────────────────────┐
                              │  "When you bought this, were you..."    │
                              │                                         │
                              │  #tag: purchase-context                 │
                              └─────────────────────┬───────────────────┘
                                                    │
        ┌──────────────┬──────────────┬─────────────┼─────────────┬──────────────┬──────────────┐
        │              │              │             │             │              │              │
        ▼              ▼              ▼             ▼             ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐   ┌──────────────┐
   │ Saw it  │   │ Been    │   │ A good   │   │ Bought   │   │Restocking│   │   Other/     │
   │ and     │   │thinking │   │ deal/    │   │ it for   │   │   or     │   │   Custom     │
   │ bought  │   │ about   │   │ discount │   │ someone  │   │replacing │   │              │
   │ it in   │   │ this    │   │ or       │   │ else     │   │          │   │              │
   │ the     │   │ for a   │   │ limited  │   │          │   │          │   │              │
   │ moment  │   │ while   │   │ drop     │   │          │   │          │   │              │
   │         │   │         │   │ made me  │   │          │   │          │   │              │
   │ [YELLOW]│   │         │   │ go for it│   │          │   │          │   │              │
   │         │   │         │   │ [YELLOW] │   │          │   │          │   │              │
   └────┬────┘   └────┬────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘   └──────────────┘
        │             │             │              │              │
        ▼             ▼             ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ Fixed   │   │ Fixed   │   │ Fixed    │   │ "Who was │   │ "Did you │
   │ Q2:     │   │ Q2:     │   │ Q2:      │   │  it for?"│   │ get the  │
   │ "What   │   │ "What   │   │ "Tell me │   │          │   │ same     │
   │ made    │   │ were    │   │ more     │   │ [Light   │   │ thing or │
   │ you go  │   │ you     │   │ about    │   │  probing]│   │ switched │
   │ for it?"│   │ waiting │   │ the deal,│   │          │   │ it up?"  │
   │         │   │ for?"   │   │ discount │   │          │   │          │
   │ [YELLOW]│   │         │   │ or event"│   │          │   │ [Light   │
   │         │   │         │   │          │   │          │   │  probing]│
   │         │   │         │   │ [YELLOW] │   │          │   │          │
   └────┬────┘   └────┬────┘   └────┬─────┘   └──────────┘   └──────────┘
        │             │             │
        ▼             ▼             ▼
   [IMPULSE      [DELIBERATE   [DEAL/SCARCITY
    PATH]          PATH]          PATH]
```

**[YELLOW]** = Less intentional spending → requires deeper exploration (two fixed questions + LLM probing)  
**[WHITE]** = More deliberate spending → lighter probing, may exit earlier

---

#### Fixed Question 2A: Impulse Path — "What made you go for it?"

When user selects **"Saw it and bought it in the moment"**, ask:

```
                    ┌───────────────────────────────────────────────────┐
                    │  BQ1 - Diagnosis Question:                        │
                    │  "What made you go for it?"                       │
                    │                                                   │
                    │  #tag: #purchase-justification #impulse-driven    │
                    └─────────────────────────┬─────────────────────────┘
                                              │
            ┌─────────────────┬───────────────┼───────────────┬─────────────────┐
            │                 │               │               │                 │
            ▼                 ▼               ▼               ▼                 ▼
     ┌─────────────┐   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ┌─────────────┐
     │ "the price  │   │ "treating   │ │ "just       │ │ "it's been  │   │   Other/    │
     │  felt right"│   │  myself"    │ │  caught my  │ │  trending   │   │   Custom    │
     │             │   │             │ │  eye"       │ │  lately"    │   │             │
     └──────┬──────┘   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘   └─────────────┘
            │                 │               │               │
            ▼                 ▼               ▼               ▼
       #price-           #self-          #visual-       #trend-
       sensitivity-      reward-         impulse-       susceptibility-
       driven            driven          driven         driven
            │                 │               │               │
            ▼                 ▼               ▼               ▼
       [LLM PROBING]    [LLM PROBING]   [LLM PROBING]  [LLM PROBING]
```

---

#### Fixed Question 2B: Deliberate Path — "What were you waiting for?"

When user selects **"Been thinking about this for a while"**, ask:

```
                    ┌───────────────────────────────────────────────────┐
                    │  "What were you waiting for?"                     │
                    │                                                   │
                    │  #tag: #purchase-justification deliberate-purchase│
                    └─────────────────────────┬─────────────────────────┘
                                              │
     ┌────────────────┬────────────────┬──────┴──────┬────────────────┬────────────────┐
     │                │                │             │                │                │
     ▼                ▼                ▼             ▼                ▼                ▼
┌──────────┐   ┌──────────┐   ┌──────────────┐ ┌──────────┐   ┌──────────────┐  ┌──────────┐
│"waiting  │   │"waiting  │   │"waiting for  │ │"letting  │   │"finally got  │  │ Other/   │
│ until I  │   │ for the  │   │ the right    │ │ it sit   │   │ around to it"│  │ Custom   │
│ could    │   │ right    │   │ one"         │ │ to see   │   │              │  │          │
│ afford   │   │ price/   │   │              │ │ if I     │   │              │  │          │
│ it"      │   │ deal"    │   │              │ │ still    │   │              │  │          │
│          │   │          │   │              │ │ wanted   │   │              │  │          │
│          │   │          │   │              │ │ it"      │   │              │  │          │
└────┬─────┘   └────┬─────┘   └──────┬───────┘ └────┬─────┘   └──────┬───────┘  └──────────┘
     │              │                │              │                │
     ▼              ▼                ▼              ▼                ▼
 [LIGHT        [LIGHT           [LIGHT         [LIGHT          [LIGHT
  PROBING]      PROBING]         PROBING]       PROBING]        PROBING]
```

These are **deliberate** purchases—the user already thought about it, so probing is lighter.

---

#### Fixed Question 2C: Deal/Scarcity Path — "Tell me more about the deal..."

When user selects **"A good deal/discount or limited drop made me go for it"**, ask:

```
                    ┌───────────────────────────────────────────────────┐
                    │  BQ1: "Tell me more about the deal, discount      │
                    │        or limited event?"                         │
                    │                                                   │
                    │  #tag: #purchase-justification #deal-driven       │
                    └─────────────────────────┬─────────────────────────┘
                                              │
            ┌─────────────────────────────────┼─────────────────────────────────┐
            │                                 │                                 │
            ▼                                 ▼                                 ▼
     ┌─────────────────────┐        ┌─────────────────────┐        ┌─────────────────────────┐
     │ "limited edition    │        │ "it was a good      │        │ "hit free shipping      │
     │  or drop that is    │        │  sale, deal or      │        │  threshold or got a     │
     │  running out"       │        │  discount"          │        │  bonus/sample with      │
     │                     │        │                     │        │  purchase"              │
     └──────────┬──────────┘        └──────────┬──────────┘        └────────────┬────────────┘
                │                              │                                │
                ▼                              ▼                                ▼
           #scarcity-driven             #deal-driven               #threshold-spending-driven
                │                              │                                │
                ▼                              ▼                                ▼
           [LLM PROBING]               [LLM PROBING]                    [LLM PROBING]
```

---

### Layer 2: LLM Probing (Mode Assignment)

After the two fixed questions, the LLM probes deeper using:
- **🔵 Blue boxes**: Exploration goals (context for the LLM)
- **🟢 Green boxes**: Probing question hints (specific questions to ask)

The mode is assigned AFTER probing is complete.

---

#### Impulse Path Probing Details

##### "The price felt right" → `#intuitive-threshold-spender`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  ┌─────────────────┐      ┌─────────────────────────────────┐      ┌─────────────────┐  │
│  │  "the price     │      │  🔵 EXPLORATION GOAL:           │      │  🟢 PROBING     │  │
│  │   felt right"   │ ───▶ │  Understand their internal      │ ───▶ │  QUESTIONS:     │  │
│  │                 │      │  price threshold around         │      │                 │  │
│  │  [YELLOW]       │      │  "reasonable" to justify        │      │  [BLUE]         │  │
│  └─────────────────┘      │                                 │      └─────────────────┘  │
│                           │                                 │                           │
│                           │  [GREEN]                        │                           │
│                           └─────────────────────────────────┘                           │
│                                                                                          │
│  MODE: #intuitive-threshold-spender                                                      │
│  Buys on impulse but has invisible price ceilings that act as automatic guardrails      │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "What price did you get it for?"                                                      │
│  • "What price would've made you pause?"                                                 │
│  • "Do things under $X usually feel like a no-brainer for you?"                          │
│                                                                                          │
│  KEY SIGNALS:                                                                            │
│  • "saw it, wanted it, bought it"                                                        │
│  • "the price felt right"                                                                │
│  • Clear mental threshold around price                                                   │
│  • Low cognitive load purchases dominate - "don't think about it as much"                │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "Treating myself" → Leads to ONE of THREE modes

> **Note:** "Treating myself" is NOT a single mode—it's a path that branches to one of three modes based on what probing reveals about WHY they're treating themselves.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  ┌─────────────────┐      ┌─────────────────────────────────┐                           │
│  │  "treating      │      │  🔵 EXPLORATION GOAL:           │                           │
│  │   myself"       │ ───▶ │  What triggered the need for    │                           │
│  │                 │      │  reward/treat? Is it tied to    │                           │
│  │  [YELLOW]       │      │  an event, emotion, or habit?   │                           │
│  └─────────────────┘      │                                 │                           │
│                           │  tag: #self-treat               │                           │
│                           │  [GREEN]                        │                           │
│                           └───────────────┬─────────────────┘                           │
│                                           │                                              │
│                                           ▼                                              │
│                           ┌───────────────────────────────────┐                          │
│                           │  🟢 PROBING QUESTIONS:            │                          │
│                           │  • "What were you treating        │                          │
│                           │     yourself for?"                │                          │
│                           │  • "Was it tied to something or   │                          │
│                           │     more of a random mood?"       │                          │
│                           │  • "Do you just enjoy shopping    │                          │
│                           │     as a fun activity?"           │                          │
│                           └───────────────┬─────────────────┘                           │
│                                           │                                              │
│                    ┌──────────────────────┼──────────────────────┐                       │
│                    │                      │                      │                       │
│                    ▼                      ▼                      ▼                       │
│  ┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐    │
│  │ #reward-driven-spender  │ │ #comfort-driven-spender │ │ #routine-treat-spender  │    │
│  │                         │ │                         │ │                         │    │
│  │ Buys to celebrate wins  │ │ Buys to soothe stress,  │ │ Regular self-treating   │    │
│  │ or accomplishments      │ │ sadness, boredom        │ │ as habit — not tied to  │    │
│  │ "I earned this"         │ │ — retail therapy        │ │ specific trigger        │    │
│  └─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘    │
│                                                                                          │
│  KEY SIGNALS BY MODE:                                                                    │
│                                                                                          │
│  #reward-driven-spender:                                                                 │
│  • "I hit my goal"                                                                       │
│  • "finished a hard week"                                                                │
│  • "got a promotion"                                                                     │
│                                                                                          │
│  #comfort-driven-spender:                                                                │
│  • "rough week"                                                                          │
│  • "felt down"                                                                           │
│  • "needed a pick-me-up"                                                                 │
│                                                                                          │
│  #routine-treat-spender:                                                                 │
│  • "I always do this on Fridays"                                                         │
│  • "it's just my thing"                                                                  │
│  • no specific reason                                                                    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "Just caught my eye" → `#visual-impulse-driven`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  ┌─────────────────┐      ┌─────────────────────────────────┐      ┌─────────────────┐  │
│  │  "just caught   │      │  🔵 EXPLORATION GOAL:           │      │  🟢 PROBING     │  │
│  │   my eye"       │ ───▶ │  Where/how did they encounter   │ ───▶ │  QUESTIONS:     │  │
│  │                 │      │  it? Is this a pattern          │      │                 │  │
│  │  [YELLOW]       │      │  (scroll, in-store, etc)?       │      │  [BLUE]         │  │
│  └─────────────────┘      │                                 │      └─────────────────┘  │
│                           │  tag: #visual-impulse-driven    │                           │
│                           │  [GREEN]                        │                           │
│                           └─────────────────────────────────┘                           │
│                                                                                          │
│  MODE: #visual-impulse-driven                                                            │
│  Gets caught by things visually — either online or in physical stores                   │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "Where did you see it?"                                                               │
│  • "What caught your eye about it?"                                                      │
│  • "Is this similar to things you already own?"                                          │
│  • "How many similar items do you have?"                                                 │
│  • "Is trying new stuff kind of the fun part for you?"                                   │
│                                                                                          │
│  KEY SIGNALS:                                                                            │
│  • "I was scrolling and saw it" / "it came up in my feed"                                │
│  • "I was just walking by" / "it was right there"                                        │
│  • "it was so pretty" / "I loved the packaging" / "the color got me"                     │
│                                                                                          │
│  NOTE: Based on probing, may refine to sub-modes:                                        │
│  • #scroll-triggered — caught while browsing online                                      │
│  • #in-store-wanderer — caught while physically shopping                                 │
│  • #aesthetic-driven — drawn to how things look                                          │
│  • #duplicate-collector — "I have like 5 of these already"                               │
│  • #exploration-hobbyist — "I like trying new things"                                    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "It's been trending lately" → `#trend-susceptibility-driven`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│  ┌─────────────────┐      ┌─────────────────────────────────┐      ┌─────────────────┐  │
│  │  "it's been     │      │  🔵 EXPLORATION GOAL:           │      │  🟢 PROBING     │  │
│  │   trending      │ ───▶ │  How susceptible are they to    │ ───▶ │  QUESTIONS:     │  │
│  │   lately"       │      │  trends, especially trend-      │      │                 │  │
│  │                 │      │  following that leads them to   │      │  [BLUE]         │  │
│  │  [YELLOW]       │      │  purchases that don't fit them  │      └─────────────────┘  │
│  └─────────────────┘      │                                 │                           │
│                           │  tag: #trend-susceptibility-    │                           │
│                           │       driven                    │                           │
│                           │  [GREEN]                        │                           │
│                           └─────────────────────────────────┘                           │
│                                                                                          │
│  MODE: #trend-susceptibility-driven                                                      │
│  Buys things because they're popular or trending                                        │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "Where have you been seeing it?"                                                      │
│  • "Do you feel like it's you or more of a trend buy?"                                   │
│                                                                                          │
│  KEY SIGNALS:                                                                            │
│  • "I saw it on TikTok" / "everyone's posting about it"                                  │
│  • "a creator I follow had it"                                                           │
│  • "my friend got one" / "everyone at work has it"                                       │
│                                                                                          │
│  NOTE: Based on probing, may refine to sub-modes:                                        │
│  • #social-media-influenced — saw it on TikTok/Instagram/YouTube                         │
│  • #friend-peer-influenced — someone they know has it or recommended it                  │
│                                                                                          │
│  COUNTER-PROFILE: #trend-but-fits-me                                                     │
│  User confirms "it's me" when asked if it's them or a trend buy → exit gracefully       │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### Deliberate Path Probing Details

These paths require **lighter probing** because the purchase was intentional. Modes are still assigned for pattern tracking, but exploration is minimal.

##### "Been thinking about this for a while" → Sub-selections

> **Note:** All modes in this path are prefixed with `deliberate-` to distinguish them from impulse-related modes on other branches.

| User Response | Mode | Exploration Goal | Probing Question(s) |
|---------------|------|------------------|---------------------|
| "waiting until I could afford it" | `#deliberate-budget-saver` | Were they saving toward a goal or waiting for cash flow to clear? | "What changed that made it feel okay to buy?" |
| "waiting for the right price/deal" | `#deliberate-deal-hunter` | Understand their deal-seeking patience—how do they track prices or find deals? | "What deal did you find?" |
| "waiting for the right one" | `#deliberate-researcher` | Understand their research/standards process—what made this the "right" one? | "Where did you go for your research?" / "Where did you end up finding it?" |
| "letting it sit to see if I still wanted it" | `#deliberate-pause-tester` | Validate their intentional pause—how long did they sit with it? Did the desire persist? | "How long was it on your radar?" |
| "finally got around to it" | `#deliberate-low-priority` | Understand what was creating the delay—friction, low priority, or just life? | "What finally made you do it?" |

##### "Bought it for someone else" → Gift Path

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  "bought it for someone else"                                                            │
│                                                                                          │
│  Fixed Q2: "What did you get them?"                                                      │
│  Follow-up: "Who was it for?"                                                            │
│                                                                                          │
│  #tag: #purchase-justification deliberate-purchase                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  MODE: #gift-giver                                                                       │
│  └─ Sub-tags based on probing:                                                           │
│     • #planned-gift - "I knew what I wanted to get them"                                 │
│     • #spontaneous-gift - "I saw it and thought of them"                                 │
│                                                                                          │
│  🟢 LIGHT PROBING (optional):                                                            │
│  • "Special occasion or just because?"                                                   │
│  • "How did you know they'd like it?"                                                    │
│                                                                                          │
│  💡 ARTIFACT POTENTIAL:                                                                  │
│  • Person Artifact: Who they buy gifts for                                               │
│  • Thing Artifact: Types of gifts they give                                              │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "Restocking or replacing, ran out or wore out" → Maintenance Path

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  "restocking or replacing, ran out or wore out"                                          │
│                                                                                          │
│  Fixed Q2: "What were you replacing?"                                                    │
│  Follow-up: "Did you get the same thing or switched it up?"                              │
│                                                                                          │
│  #tag: #purchase-justification deliberate-purchase                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  MODE: #maintenance-buyer                                                                │
│  └─ Sub-tags based on follow-up answer:                                                  │
│     • #loyal-repurchaser - "Same thing, it works"                                        │
│     • #upgrader - "Switched to something better"                                         │
│     • #brand-switcher - "Tried something new"                                            │
│                                                                                          │
│  🟢 LIGHT PROBING (optional):                                                            │
│  • "What made you switch?" (if they switched)                                            │
│  • "How long have you been using that?" (if same thing)                                  │
│                                                                                          │
│  💡 ARTIFACT POTENTIAL:                                                                  │
│  • Thing Artifact: Products they're loyal to                                             │
│  • Place Artifact: Where they restock                                                    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### Deal/Scarcity Path Probing Details

##### "Limited edition or drop that is running out" → `#scarcity-driven`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #scarcity-driven                                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  Exploration: susceptibility to FOMO—do they buy because something is special,          │
│  or does "running out" create urgency that overrides their judgment?                     │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "Tell me more about the limited edition event or drop"                                │
│  • "Would you have bought it if it wasn't running out?"                                  │
│  • "First one or adding to the collection?"                                              │
│  • "What would've happened if you missed it?"                                            │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "It was a good sale, deal or discount" → `#deal-driven`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #deal-driven                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  Do they buy things they already wanted at a better price, or does the deal             │
│  itself create the want?                                                                 │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "Tell me more about the sale, deal or discount"                                       │
│  • "What amount made it feel like the deal was worth it?"                                │
│  • "Were you already looking for this or the deal caught your eye?"                      │
│  • "Would you have bought it at full price?"                                             │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "Hit free shipping threshold or got a bonus/sample" → `#threshold-spending-driven`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #threshold-spending-driven                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  Understand if they bought more than they needed to hit a threshold or get a bonus—     │
│  did the "free" thing cost them more than they realize?                                  │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "Was this online or in-store?"                                                        │
│  • "Did you add any items to the cart or your purchase that you didn't originally       │
│     intend to buy? What were they?"                                                      │
│  • "Would you have bought just the original item without the bonus?"                     │
│  • "Was it worth what you added?"                                                        │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Shopping Mode Reference (Complete List)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SHOPPING MODES - FULL REFERENCE                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ══════════════════════════════════════════════════════════════════════════════════════  │
│  IMPULSE PATH ("Saw it and bought it in the moment")                                     │
│  Deep exploration required • High artifact potential                                     │
│  ══════════════════════════════════════════════════════════════════════════════════════  │
│                                                                                          │
│  FROM "the price felt right":                                                            │
│  └─ #intuitive-threshold-spender                                                         │
│                                                                                          │
│  FROM "treating myself" (branches to ONE of three):                                      │
│  ├─ #reward-driven-spender       ← celebrating wins/accomplishments                     │
│  ├─ #comfort-driven-spender      ← retail therapy (stress, sadness, boredom)            │
│  └─ #routine-treat-spender       ← habitual treating (no specific trigger)              │
│                                                                                          │
│  FROM "just caught my eye" (may refine to sub-modes):                                    │
│  ├─ #visual-impulse-driven       ← base mode                                            │
│  ├─ #scroll-triggered            ← caught while browsing online                         │
│  ├─ #in-store-wanderer           ← caught while physically shopping                     │
│  ├─ #aesthetic-driven            ← drawn to how things look                             │
│  ├─ #duplicate-collector         ← already owns similar items                           │
│  └─ #exploration-hobbyist        ← likes trying new things                              │
│                                                                                          │
│  FROM "it's been trending lately" (may refine to sub-modes):                             │
│  ├─ #trend-susceptibility-driven ← base mode                                            │
│  ├─ #social-media-influenced     ← saw it on TikTok/Instagram/YouTube                   │
│  └─ #friend-peer-influenced      ← someone they know has/recommended it                 │
│                                                                                          │
│  ══════════════════════════════════════════════════════════════════════════════════════  │
│  DEAL/SCARCITY PATH ("A good deal/discount or limited drop")                             │
│  Moderate exploration • Pattern Artifact potential                                       │
│  ══════════════════════════════════════════════════════════════════════════════════════  │
│  ├─ #scarcity-driven             ← "limited edition or drop that is running out"        │
│  ├─ #deal-driven                 ← "it was a good sale, deal or discount"               │
│  └─ #threshold-spending-driven   ← "hit free shipping threshold or got a bonus"         │
│                                                                                          │
│  ══════════════════════════════════════════════════════════════════════════════════════  │
│  DELIBERATE PATH ("Been thinking about this for a while")                                │
│  Light exploration • Informational modes • All prefixed with "deliberate-"               │
│  ══════════════════════════════════════════════════════════════════════════════════════  │
│  ├─ #deliberate-budget-saver     ← "waiting until I could afford it"                    │
│  ├─ #deliberate-deal-hunter      ← "waiting for the right price/deal"                   │
│  ├─ #deliberate-researcher       ← "waiting for the right one"                          │
│  ├─ #deliberate-pause-tester     ← "letting it sit to see if I still wanted it"         │
│  └─ #deliberate-low-priority     ← "finally got around to it"                           │
│                                                                                          │
│  ══════════════════════════════════════════════════════════════════════════════════════  │
│  GIFT PATH ("Bought it for someone else")                                                │
│  Light exploration • Person Artifact potential                                           │
│  ══════════════════════════════════════════════════════════════════════════════════════  │
│  ├─ #gift-giver                                                                          │
│  │   ├─ #planned-gift            ← knew what to get                                     │
│  │   └─ #spontaneous-gift        ← saw it and thought of them                           │
│                                                                                          │
│  ══════════════════════════════════════════════════════════════════════════════════════  │
│  MAINTENANCE PATH ("Restocking or replacing, ran out or wore out")                       │
│  Minimal exploration • Thing/Place Artifact potential                                    │
│  ══════════════════════════════════════════════════════════════════════════════════════  │
│  ├─ #maintenance-buyer                                                                   │
│  │   ├─ #loyal-repurchaser       ← same thing, it works                                 │
│  │   ├─ #upgrader                ← switched to something better                         │
│  │   └─ #brand-switcher          ← tried something new                                  │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Shopping Counter-Profiles (Exit Ramps)

Counter-profiles are escape routes for users whose behavior is actually intentional or healthy. When detected, the LLM should allow users to end the conversation having clarified their thinking.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  COUNTER-PROFILES                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  • intentional-collector                                                                 │
│    └─ "I collect these" / "I've been waiting for this drop" / "adding to my collection"  │
│    └─ "I would've bought this anyway"                                                    │
│                                                                                          │
│  • trend-but-fits-me                                                                     │
│    └─ User confirms "it's me" when asked "do you feel like it's you or more of a        │
│       trend buy?"                                                                        │
│                                                                                          │
│  • deal-assisted-intentional                                                             │
│    └─ "I was waiting for it to go on sale" / "I'd been eyeing it"                        │
│                                                                                          │
│  • no-clear-threshold                                                                    │
│    └─ Can't name a price threshold, no pattern, or price wasn't the real reason         │
│    └─ Suggests mode misassignment → explore other branches                               │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Layer 3: Reflection

After mode assignment, users choose how they want to explore their behavior. This is **user-directed**—they pick what resonates.

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

#### Reflection Path 1: "Is this a problem?" — Behavioral Excavation

> **Exploration Goal:** Surface how often autopilot behavior kicks in, and whether the user is actually using what they buy or it's piling up.

**V1 Approach (No Historical Data):** Since we only have threshold data on day 1 (e.g., purchases <$50), we use a **no-data fallback** that asks users to recall patterns from memory rather than showing them aggregated transaction history.

##### Mode-Based Entry Questions

The entry question is **dynamically generated based on the assigned mode**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE-BASED ENTRY QUESTIONS (No-Data Fallback)                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  #intuitive-threshold-spender                                                            │
│  └─ "can you think of another time you bought something just because the price          │
│      felt right?"                                                                        │
│                                                                                          │
│  #reward-driven-spender                                                                  │
│  └─ "can you think of another time you bought something to celebrate or reward          │
│      yourself?"                                                                          │
│                                                                                          │
│  #comfort-driven-spender                                                                 │
│  └─ "can you think of another time you shopped because you were stressed or             │
│      needed a pick-me-up?"                                                               │
│                                                                                          │
│  #routine-treat-spender                                                                  │
│  └─ "can you think of another time you treated yourself as part of your regular         │
│      routine?"                                                                           │
│                                                                                          │
│  #visual-impulse-driven / #scroll-triggered / #in-store-wanderer                         │
│  └─ "can you think of another time something just caught your eye and you went          │
│      for it?"                                                                            │
│                                                                                          │
│  #trend-susceptibility-driven / #social-media-influenced                                 │
│  └─ "can you think of another time you bought something because everyone seemed         │
│      to have it?"                                                                        │
│                                                                                          │
│  #scarcity-driven                                                                        │
│  └─ "can you think of another time you bought something because it was running          │
│      out or limited?"                                                                    │
│                                                                                          │
│  #deal-driven                                                                            │
│  └─ "can you think of another time a sale or deal made you go for something?"           │
│                                                                                          │
│  #threshold-spending-driven                                                              │
│  └─ "can you think of another time you added stuff to hit free shipping or get          │
│      a bonus?"                                                                           │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### Probing Question Hints (Behavioral Excavation)

These are **loose questions** the LLM can draw from—not a rigid script:

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

#### Reflection Path 2: "How do I feel about this?" — Emotional Reflection

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

##### LLM Instruction: Mode-Aware Question Adaptation

The questions below are **structurally the same** but the LLM should **incorporate mode context** to make them feel personal and specific to the user's situation.

**Example adaptations:**
| Mode | Generic Question | Mode-Adapted Question |
|------|------------------|----------------------|
| `#comfort-driven-spender` | "does this sit well with you?" | "does spending money shopping because you're stressed sit well with you?" |
| `#routine-treat-spender` | "does this sit well with you?" | "does spending money on these regular treats sit well with you?" |
| `#visual-impulse-driven` | "does this sit well with you?" | "does buying things just because they caught your eye sit well with you?" |
| `#deal-driven` | "does this sit well with you?" | "does buying things because they were on sale sit well with you?" |

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

#### Reflection Path 3: "Is this a good use of money?" — Cost Comparison

> **Exploration Goal:** Compare to benchmarks, evaluate tradeoffs, surface opportunity cost. Help user see the same money through a different lens.

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

##### LLM Instruction: Mode-Aware Question Adaptation

Same principle as Emotional Reflection—**incorporate mode context** into the questions.

**Example adaptations:**
| Mode | Generic Question | Mode-Adapted Question |
|------|------------------|----------------------|
| `#threshold-spending-driven` | "is this a good use of money?" | "was adding those extra items to hit free shipping worth the ${X} you spent?" |
| `#scarcity-driven` | "if you had to spend that again, would you?" | "if that limited drop came back, would you buy it again at ${price}?" |
| `#reward-driven-spender` | "is this something you'll get a lot of use out of?" | "is this reward something you'll get a lot of use out of?" |

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
│  AGGREGATE COMPARISON (V2):                                                              │
│  • "you spent $X on Y items that are <$Z — that's the equivalent of {other things}.    │
│     how does that make you feel?"                                                        │
│     🔧 V1 NOTE: Skip for V1 since we don't have aggregate data                          │
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

#### Reflection Path 4: "I have a different question" — Open-Ended

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

#### Reflection Path 5: "I'm good for now" — Exit

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

## Food Check-In

> **Type:** Pattern Check-In  
> **Focus:** Takeout/delivery patterns—understanding frequency and situational triggers

### Layer 1: Awareness Calibration

```
                    ┌─────────────────────────────────────────────────────────┐
                    │  "How much do you think you spent on takeout/delivery   │
                    │   this month?"                                          │
                    │                                                         │
                    │   User guesses: $___                                    │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    │   Compare to actual     │
                                    └────────────┬────────────┘
                                                 │
                    ┌────────────────────────────┴────────────────────────────┐
                    │                                                          │
                    ▼                                                          ▼
    ┌───────────────────────────────────┐              ┌───────────────────────────────────┐
    │   CLOSE (within 20%)              │              │   WAY OFF (>20%, $75+ diff)       │
    │                                   │              │                                   │
    │   ✓ Affirm awareness              │              │   "Would you like to see what's   │
    │   ✓ Share high-level numbers      │              │    behind this amount?"           │
    │   ✓ Award green flag/magnets      │              │                                   │
    │                                   │              │         ┌─────┴─────┐             │
    └────────────────┬──────────────────┘              │         │           │             │
                     │                                 │        YES          NO            │
                     │                                 │         │           │             │
                     │                                 │         ▼           ▼             │
                     │                                 │   Reveal data   Respect          │
                     │                                 │   with examples  boundary         │
                     │                                 └─────────┬───────────────────────┘
                     │                                           │
                     └─────────────────────┬─────────────────────┘
                                           │
                                           ▼
                              ┌────────────────────────────┐
                              │"How do you feel about this │
                              │ number?"                   │
                              └──────────────┬─────────────┘
                                             │
                           ┌─────────────────┴─────────────────┐
                           │                                   │
                           ▼                                   ▼
                    ┌─────────────┐                     ┌─────────────┐
                    │ "Ok with it"│                     │ "Not great" │
                    └──────┬──────┘                     └──────┬──────┘
                           │                                   │
                           ▼                                   ▼
                    Light reflection                    → Layer 2
                    or exit                             (Diagnosis)
```

**Blindspot Detection (when guess is way off):**

```
┌─────────────────────────────────────────────────────────────────┐
│  "What didn't you see coming?"                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • "Didn't realize I ordered that often"     → #frequency-blind  │
│  • "Didn't realize I was doing it on {days}" → #timing-blind     │
│  • "Didn't realize I was spending so much    → #merchant-blind   │
│     at {merchant}"                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Layer 2: Diagnosis (Mode Assignment)

Unlike Shopping (which has complex branching), Food uses **direct mode assignment**—the user's response maps straight to a mode. Probing is for gathering context, not determining sub-modes.

```
                    ┌─────────────────────────────────────────────────────────┐
                    │  "When you think about why you order food, what feels   │
                    │   most true?"                                           │
                    │                                                         │
                    │  tag: #food-motivation                                  │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
         ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
         │                   │                   │                   │                   │
         ▼                   ▼                   ▼                   ▼                   ▼
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │"I'm usually │     │"It's just   │     │"I keep      │     │"I actually  │     │"I'm too     │
  │ too drained │     │ easier to   │     │ meaning to  │     │ wanted that │     │ busy to     │
  │ to cook"    │     │ order"      │     │ cook but    │     │ specific    │     │ plan"       │
  │             │     │             │     │ never plan" │     │ meal"       │     │             │
  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
         │                   │                   │                   │                   │
         ▼                   ▼                   ▼                   ▼                   ▼
   #autopilot-         #convenience-        #lack-of-           [COUNTER-          #lack-of-
   from-stress          driven              pre-planning         PROFILE]           pre-planning
         │                   │                   │                  Exit                 │
         ▼                   ▼                   ▼                                       ▼
   [LIGHT PROBING]    [LIGHT PROBING]     [LIGHT PROBING]                         [LIGHT PROBING]
```

---

#### Mode Probing Details

##### "I'm usually too drained to cook" → `#autopilot-from-stress`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #autopilot-from-stress                                                            │
│  Under cognitive load or stress, food purchases become automatic self-care               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  Understand what's driving the stress/drain. Is it work, life circumstances, or         │
│  something more chronic? Gather context for reflection.                                  │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "what's usually going on when you feel that way?"                                     │
│  • "is it more of a work thing or just life in general?"                                 │
│  • "does it tend to happen on certain days?"                                             │
│                                                                                          │
│  KEY SIGNALS:                                                                            │
│  • "when I'm stressed I just order"                                                      │
│  • "busy week so I didn't cook"                                                          │
│  • "I don't have the energy"                                                             │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "It's just easier to order" → `#convenience-driven`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #convenience-driven                                                               │
│  Orders because it's path of least resistance (no negative feelings about cooking)      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  Understand if this is a lifestyle choice or friction avoidance. Do they enjoy          │
│  cooking but find ordering easier? Or do they not cook at all?                           │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "do you cook at all, or is ordering kind of the default?"                             │
│  • "is it more about not wanting to deal with cleanup, or the whole thing?"              │
│  • "do you have go-to orders or do you mix it up?"                                       │
│                                                                                          │
│  KEY SIGNALS:                                                                            │
│  • "it's just easier"                                                                    │
│  • "it shows up at my door"                                                              │
│  • "I don't have to do anything"                                                         │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "I keep meaning to cook but never plan" → `#lack-of-pre-planning`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #lack-of-pre-planning                                                             │
│  Each purchase feels like reasonable one-off because user didn't plan ahead             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  Understand where the planning breaks down. Is it grocery shopping? Meal prep?          │
│  Time management? This mode often has a "I'll do better next week" pattern.             │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "what usually gets in the way of planning?"                                           │
│  • "do you end up ordering because there's nothing in the fridge, or because you        │
│     ran out of time?"                                                                    │
│  • "have you tried meal prepping or is that not your thing?"                             │
│                                                                                          │
│  KEY SIGNALS:                                                                            │
│  • "got home late"                                                                       │
│  • "forgot to bring lunch"                                                               │
│  • "didn't have time to prep"                                                            │
│  • "there was nothing in the fridge"                                                     │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "I'm too busy to plan" → `#lack-of-pre-planning`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #lack-of-pre-planning (same as above)                                             │
│  Maps to same mode but with different framing                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  Similar to "never plan" — understand if "busy" is temporary or permanent.              │
│  Is this a season of life or an ongoing pattern?                                         │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "is this a particularly busy stretch or kind of how things are?"                      │
│  • "do you see that changing anytime soon?"                                              │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "I actually wanted that specific meal" → `#intentional-treat` [COUNTER-PROFILE]

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  COUNTER-PROFILE: #intentional-treat                                                     │
│  User made conscious choice to order a specific meal (intentional, not autopilot)       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  Validate that this was intentional. Light probing only — if confirmed, exit            │
│  gracefully. This isn't a pattern to surface.                                            │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "nice — what did you get?"                                                            │
│  • "was it a planned treat or more of a craving?"                                        │
│                                                                                          │
│  EXIT RESPONSES:                                                                         │
│  • "sounds like you knew what you wanted — enjoy!"                                       │
│  • "nothing wrong with treating yourself intentionally."                                 │
│                                                                                          │
│  KEY SIGNALS:                                                                            │
│  • "I was craving it"                                                                    │
│  • "planned treat"                                                                       │
│  • "wanted that specific thing"                                                          │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Layer 3: Reflection (Economic Evaluation)

Unlike Shopping, Food's Layer 3 is simpler because:
- **Emotional eval** → Already done in Layer 1 ("How do you feel about this number?")
- **Behavioral frequency** → Already covered in Layer 1 (full month view)
- **Food reasons are consistent** → Less mode variation than Shopping

So Food reflection focuses on **economic evaluation** — is the benefit worth the cost?

```
┌───────────────────────────────────────┐
│  "is the {benefit from ordering}       │
│   worth the ${X} spent?"               │
│                                        │
│  Mode-specific benefit:                │
│  • #autopilot-from-stress → "relief"   │
│  • #convenience-driven → "ease"        │
│  • #lack-of-pre-planning → "not        │
│    having to plan"                     │
└─────────────────┬─────────────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
  ┌─────────┐          ┌─────────┐
  │   YES   │          │   NO    │
  └────┬────┘          └────┬────┘
       │                    │
       ▼                    ▼
  [EXIT or light      [CHANGE EXPLORATION]
   exploration]        User said not worth it,
                       help them figure out
                       what to do about it
```

---

#### If YES — Exit Gracefully

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  USER SAYS IT'S WORTH IT                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RESPONSES:                                                                              │
│  • "got it — sounds like it's working for you."                                          │
│  • "makes sense. we can always revisit if anything changes."                             │
│                                                                                          │
│  OPTIONAL (light follow-up):                                                             │
│  • "is there anything about it you'd still want to tweak?"                               │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### If NO — Change Exploration

> **Exploration Goal:** User said not worth it, so help them figure out what to do about it.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  🔵 EXPLORATION GOAL:                                                                    │
│  User admitted the tradeoff isn't worth it. Help them identify barriers and             │
│  potential changes.                                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│                                                                                          │
│  BARRIER EXPLORATION:                                                                    │
│  • "what do you think gets in the way of changing it?"                                   │
│                                                                                          │
│  OPPORTUNITY COST:                                                                       │
│  • "is there something you'd rather that money go toward?"                               │
│                                                                                          │
│  CHANGE ENABLEMENT:                                                                      │
│  • "what would make it easier to change?"                                                │
│                                                                                          │
│  FOLLOW-UPS (based on response):                                                         │
│  • If barrier is time: "is it more about not knowing how, or not getting around to it?" │
│  • If they name an alternative: "how much of your food spending would you want to       │
│    redirect toward that?"                                                                │
│  • If they're unsure: "if you could change one thing about your setup, what would       │
│    it be?"                                                                               │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Coffee & Treats Check-In

> **Type:** Pattern Check-In  
> **Focus:** Small recurring purchases—understanding frequency and habitual triggers

### Layer 1: Awareness Calibration

```
                    ┌─────────────────────────────────────────────────────────┐
                    │  "How many times did you buy coffee or small treats     │
                    │   this month?"                                          │
                    │                                                         │
                    │   User guesses: ___ times                               │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    │   Compare to actual     │
                                    │   (count + total $)     │
                                    └────────────┬────────────┘
                                                 │
                    ┌────────────────────────────┴────────────────────────────┐
                    │                                                          │
                    ▼                                                          ▼
    ┌───────────────────────────────────┐              ┌───────────────────────────────────┐
    │   CLOSE (within 20%)              │              │   WAY OFF (>20%)                  │
    │                                   │              │                                   │
    │   "Pretty close—you made X        │              │   "Would you like to see what's   │
    │    purchases this month,          │              │    behind this amount?"           │
    │    totaling $Y."                  │              │                                   │
    │                                   │              │         ┌─────┴─────┐             │
    └────────────────┬──────────────────┘              │        YES          NO            │
                     │                                 │         │           │             │
                     │                                 │         ▼           ▼             │
                     │                                 │   "That's X total   Respect      │
                     │                                 │    orders, most on  boundary     │
                     │                                 │    {days} at                      │
                     │                                 │    {merchant}"                    │
                     │                                 └─────────┬───────────────────────┘
                     │                                           │
                     └─────────────────────┬─────────────────────┘
                                           │
                                           ▼
                              ┌────────────────────────────┐
                              │"How do you feel about that │
                              │ number?"                   │
                              └──────────────┬─────────────┘
                                             │
                           ┌─────────────────┴─────────────────┐
                           │                                   │
                           ▼                                   ▼
                    ┌─────────────┐                     ┌──────────────────┐
                    │ "Ok with it"│                     │"Feel like it     │
                    └──────┬──────┘                     │ could be better" │
                           │                            └──────┬───────────┘
                           ▼                                   │
                    Light reflection                           ▼
                    or exit                              → Layer 2
                                                        (Diagnosis)
```

---

### Layer 2: Diagnosis (Mode Assignment)

Coffee/Treats uses **fixed questions with fixed response options**. Each path leads to a mode.

```
                    ┌─────────────────────────────────────────────────────────┐
                    │  "What's the main reason you buy these?"                │
                    │                                                         │
                    │  tag: #coffee-motivation                                │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
             ┌─────────────────┬─────────────────┼─────────────────┬─────────────────┐
             │                 │                 │                 │                 │
             ▼                 ▼                 ▼                 ▼                 ▼
      ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
      │"it's become │   │"when i      │   │"when i need │   │"helps me    │   │ [Other/     │
      │ a routine"  │   │ happen to   │   │ a pick-me-up│   │ focus or    │   │  Custom]    │
      │             │   │ be nearby"  │   │ or take a   │   │ get things  │   │             │
      │             │   │             │   │ break"      │   │ done"       │   │             │
      └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
             │                 │                 │                 │                 │
             ▼                 ▼                 ▼                 ▼                 ▼
        [Fixed Q2]       [Fixed Q2]        [Fixed Q2]        [Fixed Q2]         → Explore
```

---

#### Fixed Question Flow: "it's become a routine" → `#autopilot-routine`

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│  Q2: "You've averaged {X} times a week — was that intentional or                      │
│       did it just kind of happen?"                                                     │
│                                                                                        │
│  tag: #autopilot-routine-driven                                                        │
└─────────────────────────────────────┬─────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
        ┌─────────────────────┐             ┌─────────────────────┐
        │ "just sort of       │             │ "yeah, intentional" │
        │  happened"          │             │                     │
        └──────────┬──────────┘             └──────────┬──────────┘
                   │                                   │
                   ▼                                   ▼
            #autopilot-routine                  [COUNTER-PROFILE]
                   │                            #intentional-ritual
                   ▼                                   │
            → Layer 3                                  ▼
                                                 [EXIT gracefully]
                                                 "sounds like you've
                                                  got it dialed in"
```

---

#### Fixed Question Flow: "when i happen to be nearby" → `#environment-triggered`

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│  Q2: "where does this usually happen?"                                                 │
│                                                                                        │
│  tag: #environment-driven                                                              │
└─────────────────────────────────────┬─────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
  │ "near work /        │ │ "near home"         │ │ "when i'm out       │
  │  on commute"        │ │                     │ │  doing other things"│
  └──────────┬──────────┘ └──────────┬──────────┘ └──────────┬──────────┘
             │                       │                       │
             └───────────────────────┴───────────────────────┘
                                     │
                                     ▼
                          #environment-triggered
                          (capture location context)
                                     │
                                     ▼
                               → Layer 3
```

---

#### Fixed Question Flow: "when i need a pick-me-up or take a break" → `#emotional-coping`

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│  Q2: "what's usually going on?"                                                        │
│                                                                                        │
│  tag: #emotionally-driven                                                              │
└─────────────────────────────────────┬─────────────────────────────────────────────────┘
                                      │
        ┌─────────────┬───────────────┼───────────────┬─────────────┐
        │             │               │               │             │
        ▼             ▼               ▼               ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│"work felt   │ │"bored or    │ │"stressed    │ │"just needed │
│ like a lot" │ │ stuck,      │ │ or anxious" │ │ to step     │
│             │ │ needed      │ │             │ │ away"       │
│             │ │ change of   │ │             │ │             │
│             │ │ scenery"    │ │             │ │             │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │               │
       └───────────────┴───────────────┴───────────────┘
                               │
                               ▼
                    #emotional-coping
                    (capture emotion context)
                               │
                               ▼
                         → Layer 3
```

---

#### Fixed Question Flow: "helps me focus or get things done" → `#productivity-justification`

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│  Q2: "You said it helps you focus — does it?"                                          │
│                                                                                        │
│  tag: #productivity-value-driven                                                       │
└─────────────────────────────────────┬─────────────────────────────────────────────────┘
                                      │
     ┌──────────────┬─────────────────┼─────────────────┬──────────────┐
     │              │                 │                 │              │
     ▼              ▼                 ▼                 ▼              ▼
┌──────────┐ ┌──────────┐ ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
│"yeah, I  │ │"half the │ │"think so?      │ │"honestly,    │ │"it's more    │
│ notice a │ │ time"    │ │ hard to say"   │ │ probably not"│ │ about the    │
│ real     │ │          │ │                │ │              │ │ ritual"      │
│difference│ │          │ │                │ │              │ │              │
└────┬─────┘ └────┬─────┘ └───────┬────────┘ └──────┬───────┘ └──────┬───────┘
     │            │               │                 │                │
     ▼            └───────────────┴─────────────────┴────────────────┘
[COUNTER-PROFILE]                         │
#productive-coffee-                       ▼
drinker                        #productivity-justification
     │                         (productivity claim is uncertain)
     ▼                                    │
[EXIT gracefully]                         ▼
"sounds like it's                   → Layer 3
 working for you"
```

---

### Coffee/Treats Modes

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              COFFEE & TREATS MODES                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  #autopilot-routine                                                                      │
│  ├─ Habit formed without conscious decision—it just accumulated over time                │
│  └─ Signals: "just sort of happened" / "didn't realize" / "not sure when it started"    │
│                                                                                          │
│  #environment-triggered                                                                  │
│  ├─ Purchases driven by physical proximity (environment makes the decision)             │
│  └─ Signals: "near work / on commute" / "it's right there" / "I walk past it"            │
│                                                                                          │
│  #emotional-coping                                                                       │
│  ├─ Coffee/treat is response to emotional states (stress, anxiety, boredom)             │
│  └─ Signals: "stressed or anxious" / "needed a break" / "rough day" / "bored, stuck"     │
│                                                                                          │
│  #productivity-justification                                                             │
│  ├─ User claims productivity benefits (though outcome may or may not be real)           │
│  └─ Signals: "half the time" / "think so? hard to say" / "maybe it's placebo"            │
│                                                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  COUNTER-PROFILES                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  • #intentional-ritual                                                                   │
│    └─ User intentionally chose to go to coffee X times a week                            │
│                                                                                          │
│  • #productive-coffee-drinker                                                            │
│    └─ User says they actually get productive work done ("yeah, I notice a real          │
│       difference")                                                                       │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Layer 3: Reflection

Each mode has a **unique reflection question** tailored to what was revealed in Layer 2.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE-SPECIFIC REFLECTION QUESTIONS                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  #autopilot-routine                                                                      │
│  └─ "how do you feel about spending ${X} to get coffee {Y times a week}?"               │
│                                                                                          │
│  #environment-triggered                                                                  │
│  └─ "would you still go here if it wasn't close by {location}?"                         │
│                                                                                          │
│  #emotional-coping                                                                       │
│  └─ "do you think spending ${X} on {emotion} is worth it?"                              │
│     (where {emotion} = the specific emotion captured in Layer 2)                        │
│                                                                                          │
│  #productivity-justification                                                             │
│  └─ "do you think spending ${X} on {productivity outcome} is worth it?"                 │
│     (where {productivity outcome} = what they said in Layer 2)                          │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

```
┌───────────────────────────────────────┐
│  Mode-Specific Reflection Question     │
└─────────────────┬─────────────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
  ┌─────────┐          ┌─────────┐
  │   YES   │          │   NO    │
  └────┬────┘          └────┬────┘
       │                    │
       ▼                    ▼
  [EXIT]               [CHANGE EXPLORATION]
  "Got it — sounds     "what do you think gets
   like it's working    in the way of changing it?"
   for you."
                       "is there something you'd
                        rather that money go toward?"

                       "what would make it easier
                        to change?"
```

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

## Memory → Artifact Mapping

Check-ins generate **memories** from user responses. These memories are processed and mapped to **artifacts**—persistent entities that represent patterns, preferences, and relationships in the user's financial life.

### Artifact Types

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           MEMORY → ARTIFACT MAPPING                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────────┐         ┌─────────────────────────────┐                │
│  │  purchasedItem + like/love  │ ──────▶ │      THING ARTIFACT         │                │
│  └─────────────────────────────┘         │      (olive/brown)          │                │
│                                          └─────────────────────────────┘                │
│                                                                                          │
│  ┌─────────────────────────────┐         ┌─────────────────────────────┐                │
│  │  merchant + frequency       │ ──────▶ │      PLACE ARTIFACT         │                │
│  └─────────────────────────────┘         │      (blue)                 │                │
│                                          └─────────────────────────────┘                │
│                                                                                          │
│  ┌─────────────────────────────┐         ┌─────────────────────────────┐                │
│  │  companions                 │ ──────▶ │      PERSON ARTIFACT        │                │
│  └─────────────────────────────┘         │      (purple)               │                │
│                                          └─────────────────────────────┘                │
│                                                                                          │
│  ┌─────────────────────────────┐         ┌─────────────────────────────┐                │
│  │  emotions + intents         │ ──────▶ │      PATTERN ARTIFACT       │                │
│  └─────────────────────────────┘         │      (green)                │                │
│                                          └─────────────────────────────┘                │
│                                                                                          │
│  ⚠️  Negative memories (sentiment: "dislike") never create artifacts                    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### How Check-Ins Feed Into Artifacts

#### Thing Artifact ← `purchasedItem + like/love`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  THING ARTIFACT                                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  SOURCES FROM CHECK-INS:                                                                 │
│  • "What did you get?" / "What did you grab?"                                            │
│  • "What were you replacing?"                                                            │
│  • "What did you get them?" (gift path)                                                  │
│  • Items mentioned during probing                                                        │
│                                                                                          │
│  POSITIVE SENTIMENT REQUIRED:                                                            │
│  • User expresses satisfaction, love, loyalty                                            │
│  • Repeated purchases of same item/brand                                                 │
│  • #loyal-repurchaser mode detected                                                      │
│                                                                                          │
│  EXAMPLE ARTIFACTS:                                                                      │
│  • "Loves Oatly oat milk" (from repeated coffee check-ins)                               │
│  • "Prefers Allbirds shoes" (from maintenance path)                                      │
│  • "Collects vinyl records" (from #intentional-collector counter-profile)                │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Place Artifact ← `merchant + frequency`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  PLACE ARTIFACT                                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  SOURCES FROM CHECK-INS:                                                                 │
│  • Transaction data (merchant field)                                                     │
│  • "Where did you see it?"                                                               │
│  • "Where do you usually go?" / "Where did you end up finding it?"                       │
│  • Pattern from #environment-triggered mode                                              │
│                                                                                          │
│  FREQUENCY SIGNALS:                                                                      │
│  • Multiple transactions at same merchant                                                │
│  • "I always go there" / "it's my spot"                                                  │
│  • Coffee check-in: specific shop mentioned repeatedly                                   │
│                                                                                          │
│  EXAMPLE ARTIFACTS:                                                                      │
│  • "Frequents Blue Bottle Coffee" (from coffee pattern check-in)                         │
│  • "Regular at Target for restocking" (from maintenance path)                            │
│  • "Goes to Sephora when stressed" (from #comfort-driven-spender + location)             │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Person Artifact ← `companions`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  PERSON ARTIFACT                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  SOURCES FROM CHECK-INS:                                                                 │
│  • "Who was it for?" (gift path)                                                         │
│  • "Who were you with?" (if asked during probing)                                        │
│  • Mentions of people in free-text responses                                             │
│                                                                                          │
│  RELATIONSHIP SIGNALS:                                                                   │
│  • Repeated gift-giving to same person                                                   │
│  • Shopping companion patterns                                                           │
│  • "My partner" / "My sister" / "My coworker"                                            │
│                                                                                          │
│  EXAMPLE ARTIFACTS:                                                                      │
│  • "Often buys gifts for sister"                                                         │
│  • "Shops with partner on weekends"                                                      │
│  • "Treats team at work occasionally"                                                    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Pattern Artifact ← `emotions + intents` ← **MODES GO HERE**

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  PATTERN ARTIFACT                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  SOURCES FROM CHECK-INS:                                                                 │
│  • All MODE assignments from question trees                                              │
│  • Emotional states detected during probing                                              │
│  • Recurring blindspots across check-ins                                                 │
│  • Trigger patterns (time of day, day of week, context)                                  │
│                                                                                          │
│  MODE → PATTERN ARTIFACT PIPELINE:                                                       │
│                                                                                          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────────────┐  │
│  │ Single Check-In │    │ Multiple        │    │ Pattern Artifact Created            │  │
│  │                 │ ─▶ │ Check-Ins       │ ─▶ │                                     │  │
│  │ Mode assigned:  │    │ Same mode 3x+   │    │ "When you've had a rough week,      │  │
│  │ #self-reward-   │    │ in 2 months     │    │  you tend to treat yourself with    │  │
│  │  driven         │    │                 │    │  beauty/skincare purchases"         │  │
│  │                 │    │ Context:        │    │                                     │  │
│  │ Context:        │    │ All after work  │    │                                     │  │
│  │ "hard week"     │    │ stress signals  │    │                                     │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────────────────┘  │
│                                                                                          │
│  HIGH-VALUE MODES FOR PATTERN ARTIFACTS:                                                 │
│  • #self-reward-driven → "Treats yourself after accomplishments"                         │
│  • #comfort-driven-spender → "Shops when stressed or down"                               │
│  • #autopilot-from-stress → "Orders food when overwhelmed"                               │
│  • #emotional-coping → "Coffee runs tied to anxiety"                                     │
│  • #scroll-triggered → "Susceptible to social media shopping"                            │
│  • #threshold-spending-driven → "Adds extras to hit free shipping"                       │
│                                                                                          │
│  EXAMPLE PATTERN ARTIFACTS:                                                              │
│  • "Tends to impulse buy when items are under $30"                                       │
│  • "Coffee is autopilot when passing Blue Bottle on commute"                             │
│  • "Orders delivery when work week is stressful"                                         │
│  • "Susceptible to limited drops and FOMO triggers"                                      │
│  • "Treats self on Fridays as weekly ritual"                                             │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Artifact Creation Rules

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  ARTIFACT CREATION RULES                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ✅ CREATE ARTIFACT WHEN:                                                                │
│  • Positive sentiment detected (like, love, satisfaction)                                │
│  • Pattern repeats across multiple check-ins (3+ occurrences)                            │
│  • User confirms behavior/preference ("yeah, that's me")                                 │
│  • Counter-profile detected (intentional behavior)                                       │
│                                                                                          │
│  ❌ DO NOT CREATE ARTIFACT WHEN:                                                         │
│  • Negative sentiment (dislike, regret, frustration)                                     │
│  • One-off occurrence (no pattern established)                                           │
│  • User disputes the observation                                                         │
│  • Counter-profile exit (behavior was intentional, not a pattern to surface)             │
│                                                                                          │
│  🔄 UPDATE EXISTING ARTIFACT WHEN:                                                       │
│  • New data reinforces existing pattern                                                  │
│  • User provides additional context                                                      │
│  • Frequency/intensity changes                                                           │
│                                                                                          │
│  🗑️ DEPRECATE ARTIFACT WHEN:                                                            │
│  • Pattern hasn't occurred in 3+ months                                                  │
│  • User explicitly says behavior has changed                                             │
│  • Conflicting data emerges                                                              │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Cross-Artifact Connections

Artifacts can connect to create richer insights:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  CONNECTED ARTIFACT EXAMPLES                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Pattern + Place:                                                                        │
│  "When stressed (#comfort-driven-spender), tends to go to Sephora (Place Artifact)"      │
│                                                                                          │
│  Pattern + Thing:                                                                        │
│  "Weekly ritual (#routine-treat-spender) involves oat milk latte (Thing Artifact)"       │
│                                                                                          │
│  Pattern + Person:                                                                       │
│  "Buys gifts for sister (Person Artifact) spontaneously (#spontaneous-gift)"             │
│                                                                                          │
│  Place + Thing:                                                                          │
│  "Gets matcha (Thing) from Blue Bottle (Place) on commute"                               │
│                                                                                          │
│  Full Connection:                                                                        │
│  "After hard weeks (#self-reward-driven), treats self to skincare (Thing)                │
│   at Sephora (Place), sometimes with partner (Person)"                                   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

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

