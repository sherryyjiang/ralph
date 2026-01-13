# Coffee & Treats Check-In

> **Type:** Pattern Check-In  
> **Focus:** Small recurring purchases—understanding frequency and habitual triggers

---

## Layer 1: Awareness Calibration

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

## Layer 2: Diagnosis (Mode Assignment)

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

### Fixed Question Flow: "it's become a routine" → `#autopilot-routine`

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

### Fixed Question Flow: "when i happen to be nearby" → `#environment-triggered`

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

### Fixed Question Flow: "when i need a pick-me-up or take a break" → `#emotional-coping`

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

### Fixed Question Flow: "helps me focus or get things done" → `#productivity-justification`

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

## Coffee/Treats Modes

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

## Layer 3: Reflection

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

### Reflection Flow

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

## Coffee Modes Summary

| Mode | Description | Key Signals |
|------|-------------|-------------|
| `#autopilot-routine` | Habit formed without conscious decision | "just sort of happened", "didn't realize" |
| `#environment-triggered` | Driven by physical proximity | "near work", "on commute", "I walk past it" |
| `#emotional-coping` | Response to emotional states | "stressed", "needed a break", "bored" |
| `#productivity-justification` | Claims productivity benefits (uncertain) | "half the time", "hard to say" |

### Counter-Profiles

| Mode | Description | Key Signals |
|------|-------------|-------------|
| `#intentional-ritual` | Consciously chose this frequency | "yeah, intentional" |
| `#productive-coffee-drinker` | Actually notices real difference | "yeah, I notice a real difference" |

---

## Related Documentation

- [Reflection Paths](./reflection-paths.md) - Layer 3 reflection options (shared)
- [Artifact Mapping](./artifact-mapping.md) - How coffee modes map to artifacts

