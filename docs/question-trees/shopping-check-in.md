# Shopping Check-In

> **Type:** Transaction Debrief  
> **Focus:** Single purchase psychology—understanding *why* users buy things

Shopping is the most complex check-in because it has the most modes and the richest variation in single-purchase motivations. The flow has **two fixed question sets** before LLM probing begins.

---

## Layer 1: Orientation (Two Fixed Question Sets)

### Fixed Question 1: "When you bought this, were you..."

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

### Fixed Question 2A: Impulse Path — "What made you go for it?"

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

### Fixed Question 2B: Deliberate Path — "What were you waiting for?"

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

### Fixed Question 2C: Deal/Scarcity Path — "Tell me more about the deal..."

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

## Layer 2: LLM Probing (Mode Assignment)

After the two fixed questions, the LLM probes deeper using:
- **🔵 Blue boxes**: Exploration goals (context for the LLM)
- **🟢 Green boxes**: Probing question hints (specific questions to ask)

The mode is assigned AFTER probing is complete.

---

### Impulse Path Probing Details

#### "The price felt right" → `#intuitive-threshold-spender`

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

#### "Treating myself" → Leads to ONE of THREE modes

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

#### "Just caught my eye" → `#visual-impulse-driven`

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

#### "It's been trending lately" → `#trend-susceptibility-driven`

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

### Deliberate Path Probing Details

These paths require **lighter probing** because the purchase was intentional. Modes are still assigned for pattern tracking, but exploration is minimal.

#### "Been thinking about this for a while" → Sub-selections

> **Note:** All modes in this path are prefixed with `deliberate-` to distinguish them from impulse-related modes on other branches.

| User Response | Mode | Exploration Goal | Probing Question(s) |
|---------------|------|------------------|---------------------|
| "waiting until I could afford it" | `#deliberate-budget-saver` | Were they saving toward a goal or waiting for cash flow to clear? | "What changed that made it feel okay to buy?" |
| "waiting for the right price/deal" | `#deliberate-deal-hunter` | Understand their deal-seeking patience—how do they track prices or find deals? | "What deal did you find?" |
| "waiting for the right one" | `#deliberate-researcher` | Understand their research/standards process—what made this the "right" one? | "Where did you go for your research?" / "Where did you end up finding it?" |
| "letting it sit to see if I still wanted it" | `#deliberate-pause-tester` | Validate their intentional pause—how long did they sit with it? Did the desire persist? | "How long was it on your radar?" |
| "finally got around to it" | `#deliberate-low-priority` | Understand what was creating the delay—friction, low priority, or just life? | "What finally made you do it?" |

#### "Bought it for someone else" → Gift Path

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

#### "Restocking or replacing, ran out or wore out" → Maintenance Path

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

### Deal/Scarcity Path Probing Details

#### "Limited edition or drop that is running out" → `#scarcity-driven`

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

#### "It was a good sale, deal or discount" → `#deal-driven`

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

#### "Hit free shipping threshold or got a bonus/sample" → `#threshold-spending-driven`

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

## Shopping Mode Reference (Complete List)

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

## Shopping Counter-Profiles (Exit Ramps)

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

## Layer 3: Reflection

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

### Reflection Path 1: "Is this a problem?" — Behavioral Excavation

> **Exploration Goal:** Surface how often autopilot behavior kicks in, and whether the user is actually using what they buy or it's piling up.

**V1 Approach (No Historical Data):** Since we only have threshold data on day 1 (e.g., purchases <$50), we use a **no-data fallback** that asks users to recall patterns from memory rather than showing them aggregated transaction history.

#### Mode-Based Entry Questions

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

#### Probing Question Hints

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

### Reflection Path 2: "How do I feel about this?" — Emotional Reflection

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

#### Mode-Aware Question Adaptation

The questions are **structurally the same** but the LLM should **incorporate mode context**:

| Mode | Generic Question | Mode-Adapted Question |
|------|------------------|----------------------|
| `#comfort-driven-spender` | "does this sit well with you?" | "does spending money shopping because you're stressed sit well with you?" |
| `#routine-treat-spender` | "does this sit well with you?" | "does spending money on these regular treats sit well with you?" |
| `#visual-impulse-driven` | "does this sit well with you?" | "does buying things just because they caught your eye sit well with you?" |
| `#deal-driven` | "does this sit well with you?" | "does buying things because they were on sale sit well with you?" |

#### Probing Question Hints

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

### Reflection Path 3: "Is this a good use of money?" — Cost Comparison

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

#### Mode-Aware Question Adaptation

| Mode | Generic Question | Mode-Adapted Question |
|------|------------------|----------------------|
| `#threshold-spending-driven` | "is this a good use of money?" | "was adding those extra items to hit free shipping worth the ${X} you spent?" |
| `#scarcity-driven` | "if you had to spend that again, would you?" | "if that limited drop came back, would you buy it again at ${price}?" |
| `#reward-driven-spender` | "is this something you'll get a lot of use out of?" | "is this reward something you'll get a lot of use out of?" |

#### Probing Question Hints

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

### Reflection Path 4: "I have a different question" — Open-Ended

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

### Reflection Path 5: "I'm good for now" — Exit

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

- [Artifact Mapping](./artifact-mapping.md) - How shopping modes map to artifacts

