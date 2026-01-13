---
task: Build Peek Check-In Chat App - A therapy-like spending reflection tool
test_command: "npm run dev"
---

# Task: Peek Check-In Chat App

Build a mock-up chat application that helps users understand their spending behavior through guided reflection, following the question trees defined in `PEEK_QUESTION_TREES.md`.

## Reference Documents

- **PEEK_QUESTION_TREES.md** - Complete question tree logic (MUST follow exactly)
- **PEEK_CHECKIN_SPEC.md** - Technical specification and data models

## Success Criteria

### Phase 1: Foundation
1. [x] Create TypeScript interfaces in `lib/types/index.ts` (Transaction, CheckInSession, Message)
2. [x] Create synthetic transaction data in `lib/data/synthetic-transactions.ts` covering all check-in paths
3. [x] Create LLM wrapper in `lib/llm/client.ts` that reads model from `NEXT_PUBLIC_LLM_MODEL` env var
4. [x] Build basic dashboard page with weekly spend summary and transaction list

### Phase 2: Chat Infrastructure
5. [x] Create chat components: `chat-container.tsx`, `message-bubble.tsx`, `quick-reply.tsx`
6. [x] Create check-in session state management with useReducer
7. [x] Create `/check-in/[sessionId]/page.tsx` for chat interface
8. [x] Connect transaction tap to check-in flow

### Phase 3: Gemini Integration
9. [x] Create API route at `/api/chat/route.ts` for Gemini calls
10. [x] Build system prompt construction from question tree context
11. [x] Handle streaming responses and display in chat
12. [x] Add error handling and loading states

### Phase 4: Shopping Check-In (Most Complex)
13. [x] Implement Layer 1 Fixed Question 1: "When you bought this, were you..."
14. [x] Implement Layer 1 Fixed Question 2 for all paths (impulse, deliberate, deal, gift, maintenance)
15. [x] Implement Layer 2 LLM probing with mode-specific exploration goals
16. [x] Implement mode assignment after probing
17. [x] Write tests for shopping flow in `__tests__/shopping-flow.test.ts`

### Phase 5: Food Check-In
18. [x] Implement awareness calibration (guess vs actual spending)
19. [x] Implement Layer 2 mode assignment (stress, convenience, planning)
20. [x] Implement economic evaluation reflection

### Phase 6: Coffee/Treats Check-In
21. [ ] Implement frequency calibration (guess vs actual count)
22. [ ] Implement fixed question flows for all motivation paths
23. [ ] Implement mode-specific reflection questions

### Phase 7: Reflection Paths
24. [ ] Implement "Is this a problem?" behavioral excavation
25. [ ] Implement "How do I feel?" emotional reflection
26. [ ] Implement "Is this a good use?" cost comparison
27. [ ] Implement graceful exits and counter-profile handling

### Phase 8: Testing & Polish
28. [ ] Write integration tests for complete check-in flows
29. [ ] Test mode detection accuracy
30. [ ] Ensure mobile responsiveness
31. [ ] Final UI polish and error states

## Technical Notes

### Environment Setup
```bash
# Required env vars in .env.local
GOOGLE_API_KEY=<your_gemini_api_key>
NEXT_PUBLIC_LLM_MODEL=gemini-2.5-flash
```

### Key Files to Create/Modify
- `lib/types/index.ts` - All interfaces
- `lib/llm/client.ts` - LLM wrapper with model switching
- `lib/llm/prompts.ts` - System prompts from question trees
- `lib/data/synthetic-transactions.ts` - Test data
- `app/page.tsx` - Replace todo app with spending dashboard
- `app/check-in/[sessionId]/page.tsx` - Chat interface
- `app/api/chat/route.ts` - Gemini API endpoint

### LLM Wrapper Pattern (CRITICAL)
All Gemini calls MUST go through a wrapper that allows model switching:

```typescript
// lib/llm/client.ts
const MODEL_ID = process.env.NEXT_PUBLIC_LLM_MODEL || "gemini-2.5-flash";
export async function chat(messages: Message[], context: CheckInContext) {
  // Use MODEL_ID for all calls
}
```

### Question Tree Following Rules
1. Layer 1 questions are FIXED - display exact options from spec
2. Layer 2 probing is LLM-driven with exploration goals from spec
3. Mode assignment happens AFTER probing, not before
4. Counter-profiles allow graceful exit without deep probing
5. Layer 3 reflection is user-directed (they pick the path)

### UI Color Palette
```css
--bg-primary: #1a0a2e;      /* Deep purple-black */
--bg-card: #2d1b4e;          /* Muted purple */
--accent-orange: #ff7b00;    /* Peek branding */
--accent-yellow: #ffd700;    /* Amounts */
--text-primary: #ffffff;
--text-muted: #a89cc0;
```

---

## Ralph Instructions

1. Read `PEEK_QUESTION_TREES.md` and `PEEK_CHECKIN_SPEC.md` thoroughly before starting
2. Work through criteria in order - they have dependencies
3. After each phase, run `npm run dev` to verify the app works
4. Create tests as specified - they help verify question tree logic
5. Commit after completing each numbered criterion
6. For any ambiguous spec interpretation, add a note to `.ralph/design-decisions.md`
7. When ALL criteria are [x], output: `<ralph>COMPLETE</ralph>`
8. If stuck on the same issue 3+ times, output: `<ralph>GUTTER</ralph>`
