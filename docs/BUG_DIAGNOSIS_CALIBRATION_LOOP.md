# Bug Diagnosis: Awareness Calibration Loop

> **Status:** To Fix  
> **Severity:** Critical  
> **Affected:** Food Check-In, Coffee Check-In

---

## Symptom

When a user clicks on a Food or Coffee transaction and goes through the awareness calibration, the chat gets stuck in a loop and doesn't advance to the feeling question or Layer 2.

---

## Expected Flow

```
1. User taps Food transaction card
2. Chat shows: "How much do you think you spent on food delivery this month?"
   Options: [~$100] [~$175] [~$251] [~$300+]
3. User selects an option
4. Chat shows: "Nice awareness! You spent $251..." + "How do you feel about this?"
   Options: [I'm ok with it] [Not great, honestly]
5. User selects → Flow continues to Layer 2 or exit
```

## Actual Behavior

```
1. User taps Food transaction card
2. Chat shows: "How much do you think you spent..."
   Options: [~$100] [~$175] [~$251] [~$300+]
3. User selects an option
4. Chat shows... the SAME question again, or stops responding
```

---

## Root Cause Analysis

### Issue 1: Layer Not Transitioning

In `app/check-in/[sessionId]/page.tsx`, the food handler:

```typescript
} else if (transaction.category === "food") {
  if (currentLayer === 1) {
    // User just made their guess - calculate and reveal actual
    // ...
    addAssistantMessage(revealMessage, feelingOptions, true);
  } else if (currentLayer === 2) {
    // Handle Layer 2 responses
```

**Problem:** After showing the reveal message, `currentLayer` is never updated. The code stays at Layer 1, so when the user responds to the feeling question, the condition `currentLayer === 1` is still true, but none of the handling logic matches.

### Issue 2: Wrong Response Value Matching

The feeling question options have values:
- `"ok_with_it"`
- `"not_great"`

But the Layer 2 handler checks:
```typescript
if (value === "ok_with_it") { ... }
else if (value === "not_great") { ... }
```

This is in the `else if (currentLayer === 2)` block, which never runs because we're still at Layer 1.

### Issue 3: Missing Sub-Phase Tracking

The code doesn't track which phase of Layer 1 we're in:
- Phase A: User makes guess
- Phase B: User answers feeling question
- Phase C: User answers breakdown offer (if applicable)

Without this, there's no way to know what the user is responding to.

---

## Fix

### Option A: Track Sub-Phase (Recommended)

Add a `calibrationPhase` state:

```typescript
// In useCheckInSession hook:
const [calibrationPhase, setCalibrationPhase] = useState<
  | "awaiting_guess"
  | "awaiting_feeling"
  | "awaiting_breakdown_decision"
  | "complete"
>("awaiting_guess");
```

Then in the handler:

```typescript
if (transaction.category === "food") {
  if (currentLayer === 1) {
    if (calibrationPhase === "awaiting_guess") {
      // User submitted guess → show result + feeling question
      // ...
      setCalibrationPhase("awaiting_feeling");
      
    } else if (calibrationPhase === "awaiting_feeling") {
      if (value === "ok_with_it") {
        // Exit flow
        setCalibrationPhase("complete");
      } else if (value === "not_great") {
        if (isWayOff) {
          // Offer breakdown
          setCalibrationPhase("awaiting_breakdown_decision");
        } else {
          // Go straight to Layer 2
          setCalibrationPhase("complete");
          setLayer(2);
        }
      }
      
    } else if (calibrationPhase === "awaiting_breakdown_decision") {
      // Handle yes/no for breakdown
      setCalibrationPhase("complete");
      setLayer(2);
    }
  }
  
  if (currentLayer === 2) {
    // Handle Layer 2 (diagnosis/motivation question)
  }
}
```

### Option B: Use Response Value Detection

Check what the user's response is to determine which phase:

```typescript
const guessValues = ["low", "medium", "high", ...];
const feelingValues = ["ok_with_it", "not_great"];
const breakdownValues = ["yes", "no"];

if (guessValues.includes(value)) {
  // This is a guess response
} else if (feelingValues.includes(value)) {
  // This is a feeling response
} else if (breakdownValues.includes(value)) {
  // This is a breakdown decision
}
```

**Problem:** Less robust, could have value collisions.

---

## Additional Issue: Entry Question on Home Card

With the new design, the guess happens on the HOME CARD, not in the chat. This means:

1. Chat URL will include `?guess=[amount]`
2. First chat message should be the RESULT, not the guess question
3. Initial `calibrationPhase` should be `"awaiting_feeling"` (guess already done)

```typescript
// In useEffect for session initialization:
useEffect(() => {
  if (messages.length === 0) {
    const guessFromUrl = searchParams.get("guess");
    
    if (transaction.category === "food" && guessFromUrl) {
      // Guess was submitted on home card
      const guess = parseInt(guessFromUrl, 10);
      const actual = getMonthlyFoodSpend();
      
      // Show result + feeling question as first message
      const resultMessage = getCalibrationResultMessage(guess, actual);
      const feelingQ = getFoodFeelingQuestion();
      
      addAssistantMessage(
        `${resultMessage}\n\n${feelingQ.content}`,
        feelingQ.options,
        true
      );
      
      setCalibrationPhase("awaiting_feeling");
    }
  }
}, []);
```

---

## Files to Modify

1. `lib/hooks/use-check-in-session.ts`
   - Add `calibrationPhase` state
   - Add `setCalibrationPhase` action

2. `app/check-in/[sessionId]/page.tsx`
   - Update `getInitialMessage` to handle guess from URL
   - Update `handleOptionSelect` to use calibration phase tracking
   - Fix Layer 2 transition logic

3. `app/page.tsx`
   - Add text input to Food/Coffee cards
   - Navigate with guess in URL params

---

## Test Cases

After fix, verify:

1. **Food: Happy path**
   - Enter guess on home card → Chat shows result + feeling
   - Select "I'm ok with it" → Graceful exit
   
2. **Food: Exploration path**
   - Enter guess (way off) → Chat shows result + feeling
   - Select "Not great" → Offers breakdown
   - Select "Yes" → Shows breakdown
   - Chat transitions to Layer 2 motivation question
   
3. **Coffee: Same flows as Food** (with count instead of amount)

4. **No loops** — Each response advances the conversation

