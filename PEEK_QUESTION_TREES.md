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

- **Modes**: Behavioral profiles assigned based on user responses (e.g., `#autopilot-drift`, `#comfort-driven-spender`)
- **Blindspots**: Gaps in user awareness (frequency, timing, merchant concentration)
- **Counter-profiles**: Escape routes for users whose behavior is actually intentional/healthy
- **Tags**: Metadata for categorizing responses (`#purchase-awareness`, `#impulse-driven`, etc.)

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

##### "The price felt right" → `#price-sensitivity-driven`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #price-sensitivity-driven                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  Understand their internal price threshold around "reasonable" to justify               │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "What price did you get it for?"                                                      │
│  • "What price would've made you pause?"                                                 │
│  • "Do things under $X usually feel like a no-brainer for you?"                          │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "Treating myself" → `#self-reward-driven`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #self-reward-driven                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  What triggered the need for reward?                                                     │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "What were you treating yourself for?"                                                │
│  • "Was it tied to something or more of a random mood?"                                  │
│  • "Do you just enjoy shopping as a fun activity?"                                       │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "Just caught my eye" → `#visual-impulse-driven`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #visual-impulse-driven                                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  Where/how did they encounter it? Is this a pattern (scroll, in-store, etc)?            │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "Where did you see it?"                                                               │
│  • "What caught your eye about it?"                                                      │
│  • "Is this similar to things you already own?"                                          │
│  • "How many similar items do you have?"                                                 │
│  • "Is trying new stuff kind of the fun part for you?"                                   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

##### "It's been trending lately" → `#trend-susceptibility-driven`

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MODE: #trend-susceptibility-driven                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  🔵 EXPLORATION GOAL:                                                                    │
│  How susceptible are they to trends, especially trend-following that leads them         │
│  to purchases that don't fit them                                                        │
│                                                                                          │
│  🟢 PROBING QUESTION HINTS:                                                              │
│  • "Where have you been seeing it?"                                                      │
│  • "Do you feel like it's you or more of a trend buy?"                                   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

#### Deliberate Path Probing Details

These paths require **lighter probing** because the purchase was intentional. Modes are still assigned for pattern tracking, but exploration is minimal.

##### "Been thinking about this for a while" → Sub-selections

| User Response | Mode | Exploration Goal | Probing Question(s) |
|---------------|------|------------------|---------------------|
| "waiting until I could afford it" | `#budget-conscious` | Were they saving toward a goal or waiting for cash flow to clear? | "What changed that made it feel okay to buy?" |
| "waiting for the right price/deal" | `#deal-patient` | Understand their deal-seeking patience—how do they track prices or find deals? | "What deal did you find?" |
| "waiting for the right one" | `#researcher` | Understand their research/standards process—what made this the "right" one? | "Where did you go for your research?" / "Where did you end up finding it?" |
| "letting it sit to see if I still wanted it" | `#impulse-aware` | Validate their intentional pause—how long did they sit with it? Did the desire persist? | "How long was it on your radar?" |
| "finally got around to it" | `#low-urgency` | Understand what was creating the delay—friction, low priority, or just life? | "What finally made you do it?" |

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
│  ├─ #price-sensitivity-driven    ← "the price felt right"                               │
│  ├─ #self-reward-driven          ← "treating myself"                                    │
│  ├─ #visual-impulse-driven       ← "just caught my eye"                                 │
│  └─ #trend-susceptibility-driven ← "it's been trending lately"                          │
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
│  Light exploration • Informational modes                                                 │
│  ══════════════════════════════════════════════════════════════════════════════════════  │
│  ├─ #budget-conscious            ← "waiting until I could afford it"                    │
│  ├─ #deal-patient                ← "waiting for the right price/deal"                   │
│  ├─ #researcher                  ← "waiting for the right one"                          │
│  ├─ #impulse-aware               ← "letting it sit to see if I still wanted it"         │
│  └─ #low-urgency                 ← "finally got around to it"                           │
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

```
                    ┌─────────────────────────────────────────────────────────┐
                    │  "When you think about why you order food, what feels   │
                    │   most true?"                                           │
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
                                                                  Exit
```

### Food Modes

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    FOOD MODES                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  #autopilot-from-stress                                                                  │
│  ├─ Under cognitive load or stress, food purchases become automatic self-care            │
│  └─ Signals: "when I'm stressed I just order" / "busy week so I didn't cook"             │
│                                                                                          │
│  #convenience-driven                                                                     │
│  ├─ Orders because it's path of least resistance (no negative feelings about cooking)   │
│  └─ Signals: "it's just easier" / "it shows up at my door" / "I don't have to do anything" │
│                                                                                          │
│  #lack-of-pre-planning                                                                   │
│  ├─ Each purchase feels like reasonable one-off because user didn't plan ahead          │
│  └─ Signals: "got home late" / "forgot to bring lunch" / "didn't have time to prep"      │
│                                                                                          │
│  #intentional-treat [COUNTER-PROFILE]                                                    │
│  ├─ User made conscious choice to order a specific meal (intentional, not autopilot)    │
│  └─ Signals: "I was craving it" / "planned treat" / "wanted that specific thing"         │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Layer 3: Reflection

```
                    ┌─────────────────────────────────────────────────────────┐
                    │  "Is the {mode-specific benefit} worth the ${X} spent?" │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
                    ┌────────────────────────────┴────────────────────────────┐
                    │                                                          │
                    ▼                                                          ▼
    ┌───────────────────────────────────┐              ┌───────────────────────────────────┐
    │             YES                   │              │              NO                   │
    │                                   │              │                                   │
    │   "Got it—sounds like it's        │              │   They've admitted the tradeoff   │
    │    working for you."              │              │   isn't worth it. Help them       │
    │                                   │              │   figure out what to do.          │
    │         [EXIT or explore]         │              │                                   │
    └───────────────────────────────────┘              └────────────────┬──────────────────┘
                                                                        │
                                                                        ▼
                                                       ┌────────────────────────────────────┐
                                                       │   "Let's explore what's blocking   │
                                                       │    change..."                      │
                                                       └────────────────┬───────────────────┘
                                                                        │
                              ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
                              │                                         │                                         │
                              ▼                                         ▼                                         ▼
               ┌─────────────────────────────┐       ┌─────────────────────────────┐       ┌─────────────────────────────┐
               │"What gets in the way of     │       │"Is there something you'd    │       │"What would make it easier   │
               │ changing it?"               │       │ rather that money go toward?"│       │ to change?"                 │
               └──────────────┬──────────────┘       └──────────────┬──────────────┘       └──────────────┬──────────────┘
                              │                                      │                                      │
                              ▼                                      ▼                                      ▼
               "Is it more about not          "What would that be?             "If you could change one
                knowing how, or not            And how much of your             thing about your setup,
                getting around to it?"         food spending would              what would it be?"
                                               you want to redirect?"
```

**Mode-Specific Reflection Questions:**

| Mode | Reflection Question |
|------|---------------------|
| `#autopilot-from-stress` | "Is the **relief** worth $X?" |
| `#convenience-driven` | "Is the **ease** worth $X?" |
| `#lack-of-pre-planning` | "Is **not having to plan** worth $X?" |

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

```
                    ┌─────────────────────────────────────────────────────────┐
                    │  "What's the main reason you buy these?"                │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
             ┌─────────────────┬─────────────────┼─────────────────┬─────────────────┐
             │                 │                 │                 │                 │
             ▼                 ▼                 ▼                 ▼                 ▼
      ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
      │"It's become │   │"When I      │   │"When I need │   │"Helps me    │   │ [Other/     │
      │ a routine"  │   │ happen to   │   │ a pick-me-up│   │ focus or    │   │  Custom]    │
      │             │   │ be nearby"  │   │ or break"   │   │ get things  │   │             │
      │             │   │             │   │             │   │ done"       │   │             │
      └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
             │                 │                 │                 │                 │
             ▼                 ▼                 ▼                 ▼                 ▼
      #autopilot-        #environment-     #emotional-       #productivity-    → Explore
       routine            triggered          coping           justification
```

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
│  • intentional-ritual                                                                    │
│    └─ User intentionally chose to go to coffee X times a week                            │
│                                                                                          │
│  • productive-coffee-drinker                                                             │
│    └─ User says they actually get productive work done                                   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Layer 3: Reflection

```
                    ┌─────────────────────────────────────────────────────────┐
                    │  "Do you think spending $X on {mode-benefit} is worth   │
                    │   it?"                                                  │
                    └────────────────────────────┬────────────────────────────┘
                                                 │
                    ┌────────────────────────────┴────────────────────────────┐
                    │                                                          │
                    ▼                                                          ▼
    ┌───────────────────────────────────┐              ┌───────────────────────────────────┐
    │             YES                   │              │              NO                   │
    │                                   │              │                                   │
    │   "Got it—sounds like it's        │              │   Surface what's blocking change  │
    │    working for you."              │              │   and whether they're ready to    │
    │                                   │              │   act.                            │
    │         [EXIT or explore]         │              │                                   │
    └───────────────────────────────────┘              └────────────────┬──────────────────┘
                                                                        │
                                                                        ▼
                                                       [Same exploration flow as Food]
```

**Mode-Specific Reflection Questions:**

| Mode | Reflection Question |
|------|---------------------|
| `#autopilot-routine` | "Do you think spending $X on **this routine** is worth it?" |
| `#environment-triggered` | "Would you still go here if it **wasn't close by**?" |
| `#emotional-coping` | "Do you think spending $X on **{stress relief/break}** is worth it?" |
| `#productivity-justification` | "Do you think spending $X on **{productivity outcome}** is worth it?" |

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

