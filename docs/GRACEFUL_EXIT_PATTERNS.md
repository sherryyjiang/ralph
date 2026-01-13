# Graceful Exit Patterns

> **Purpose:** Define how conversations end for different user behaviors  
> **Updated:** 2026-01-13

---

## Overview

Not every check-in needs deep exploration. When users show intentional, deliberate, or counter-profile behavior, we should:
1. Validate their behavior
2. Save the pattern to their "Magnets"
3. Offer freeform follow-up (optional)
4. Exit gracefully

---

## Exit Trigger: Deliberate Path (Shopping)

When user selects **"Been thinking about this for a while"** and answers Fixed Q2:

### "Waiting until I could afford it" → `#deliberate-budget-saver`

```
That's really thoughtful — waiting until the timing was right financially 
shows solid awareness of your budget. 

I'm saving this as one of your spending patterns in Magnets. 🧲

Is there anything else about this purchase you'd like to explore?

[I'm good for now ✓]
[Free-form text input...]
```

### "Waiting for the right price/deal" → `#deliberate-deal-hunter`

```
Nice! Being patient for the right deal takes discipline. That kind of 
intentional waiting usually pays off.

I'm noting this pattern in your Magnets. 🧲

Anything else on your mind about this purchase?

[I'm good for now ✓]
[Free-form text input...]
```

### "Waiting for the right one" → `#deliberate-researcher`

```
It sounds like you really put thought into this — doing your research 
and finding exactly what works for you. That's a great way to shop!

Saving this to your Magnets. 🧲

Is there anything else you'd like to explore about this purchase?

[I'm good for now ✓]
[Free-form text input...]
```

### "Letting it sit to see if I still wanted it" → `#deliberate-pause-tester`

```
That's a smart approach — giving yourself time to make sure it wasn't 
just a passing want. The fact that you still wanted it says something!

I'm adding this to your Magnets. 🧲

Anything else you're curious about?

[I'm good for now ✓]
[Free-form text input...]
```

### "Finally got around to it" → `#deliberate-low-priority`

```
Got it — sometimes things just take a while to bubble up the priority 
list. At least it's done now!

Noting this in your Magnets. 🧲

Anything else about this purchase?

[I'm good for now ✓]
[Free-form text input...]
```

---

## Exit Trigger: Gift Path (Shopping)

When user selects **"Bought it for someone else"**:

```
That's thoughtful! Gift-giving is one of those spending categories 
that's hard to evaluate on dollars alone.

I'm saving this as a gift purchase in your Magnets. 🧲

Is there anything about your gift-giving patterns you'd like to explore?

[I'm good for now ✓]
[Free-form text input...]
```

---

## Exit Trigger: Maintenance Path (Shopping)

When user selects **"Restocking or replacing"**:

```
Makes sense — we all need to replace things eventually! This is the 
kind of spending that's easy to overlook but adds up.

Logging this in your Magnets. 🧲

Anything else about this purchase?

[I'm good for now ✓]
[Free-form text input...]
```

---

## Exit Trigger: Counter-Profiles

### Food: "I actually wanted that specific meal" → `#intentional-treat`

```
Sounds like you knew exactly what you wanted — nothing wrong with 
treating yourself intentionally! Enjoy 🍕

[I'm good for now ✓]
```

### Coffee: "Yeah, intentional" (routine was chosen) → `#intentional-ritual`

```
Sounds like you've got it dialed in! An intentional daily ritual 
can be a great part of your routine. ☕✨

[I'm good for now ✓]
```

### Coffee: "Yeah, I notice a real difference" (productivity) → `#productive-coffee-drinker`

```
Sounds like it's working for you! If coffee genuinely helps your 
productivity, that's a worthwhile investment. ☕💪

[I'm good for now ✓]
```

### Shopping: User confirms "it's me" on trend question → `#trend-but-fits-me`

```
Got it — sounds like this trend actually fits your style! That's 
the best kind of trend buy. 

[I'm good for now ✓]
```

---

## Exit Trigger: Awareness OK (Food/Coffee)

When user says **"I'm ok with it"** after seeing their spending:

```
Got it — sounds like it's working for you! We can always revisit 
if anything changes. 

Is there anything else about your [food/coffee] habits you'd like 
to explore, or are we good?

[I'm good for now ✓]
[Actually, I'm curious about something...]
```

---

## Exit Trigger: Layer 3 Complete (Any)

After behavioral excavation, emotional reflection, or cost comparison:

```
Thanks for reflecting on this with me. I've saved some patterns 
from our chat to your Magnets.

[Close ✕]
```

**Note:** No forced "Thanks for the reflection!" message. Just let the conversation end naturally with the X button.

---

## "Magnets" Explanation

When we mention "Magnets," we're telling the user that their patterns are being saved for personalization. This builds trust and shows value.

**What gets saved:**
- Mode assignments (e.g., `#deliberate-researcher`)
- Behavioral patterns (e.g., "waits for deals")
- Counter-profile confirmations (e.g., "intentional gift giver")

**Future use:**
- Personalize future check-ins
- Show pattern summaries
- Avoid re-asking same questions

---

## Implementation Notes

### Adding Magnet Mention

In `lib/llm/prompts.ts`, add to deliberate path handling:

```typescript
const MAGNET_MENTION = `I'm saving this as a pattern in your Magnets. 🧲`;

const DELIBERATE_EXIT_MESSAGES: Record<string, string> = {
  afford_it: `That's really thoughtful — waiting until the timing was right 
financially shows solid awareness of your budget.\n\n${MAGNET_MENTION}`,
  // ... etc
};
```

### Freeform Follow-Up

After the exit message, always show:
1. Text input for freeform questions
2. "I'm good for now" button

```tsx
<QuickReply
  options={[
    { id: "done", label: "I'm good for now", emoji: "✓", value: "done" }
  ]}
  onSelect={handleOptionSelect}
/>
<CustomInput
  placeholder="Or type a question..."
  onSend={handleSendMessage}
/>
```

### No Exit Prompt After Layer 3

In `handleOptionSelect`, when `value === "done"` or `value === "close"`:
- Call `completeSession()`
- Navigate back to home
- Do NOT add a "Thanks for the reflection!" message

---

## Related Files

- `app/check-in/[sessionId]/page.tsx` — Exit handling
- `lib/llm/prompts.ts` — Exit message templates
- `lib/hooks/use-check-in-session.ts` — Session completion

