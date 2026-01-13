# Food Check-In

> **Type:** Pattern Check-In  
> **Focus:** Takeout/delivery patterns—understanding frequency and situational triggers

---

## Layer 1: Awareness Calibration

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

### Blindspot Detection (when guess is way off)

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

## Layer 2: Diagnosis (Mode Assignment)

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

## Mode Probing Details

### "I'm usually too drained to cook" → `#autopilot-from-stress`

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

### "It's just easier to order" → `#convenience-driven`

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

### "I keep meaning to cook but never plan" → `#lack-of-pre-planning`

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

### "I'm too busy to plan" → `#lack-of-pre-planning`

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

### "I actually wanted that specific meal" → `#intentional-treat` [COUNTER-PROFILE]

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

## Layer 3: Reflection (Economic Evaluation)

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

### If YES — Exit Gracefully

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

### If NO — Change Exploration

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

## Food Modes Summary

| Mode | Description | Key Signals |
|------|-------------|-------------|
| `#autopilot-from-stress` | Under cognitive load, food becomes automatic self-care | "stressed", "busy week", "no energy" |
| `#convenience-driven` | Orders because it's the path of least resistance | "easier", "shows up at my door" |
| `#lack-of-pre-planning` | Each purchase feels like a reasonable one-off | "nothing in the fridge", "got home late" |

### Counter-Profile

| Mode | Description | Key Signals |
|------|-------------|-------------|
| `#intentional-treat` | Conscious choice to order specific meal | "craving", "planned treat", "wanted that specific thing" |

---

## Related Documentation

- [Reflection Paths](./reflection-paths.md) - Layer 3 reflection options (shared)
- [Artifact Mapping](./artifact-mapping.md) - How food modes map to artifacts

