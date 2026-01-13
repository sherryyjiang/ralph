# Peek Check-In Chat App Specification

> A mock-up chat application for therapy-like reflections around spending behavior, powered by Gemini Flash.

---

## Overview

Build a conversational check-in app that helps users understand their spending patterns through guided reflection. The app follows the question tree system defined in `PEEK_QUESTION_TREES.md`.

### Core Features

1. **Chat Interface** - Conversational UI for check-in sessions
2. **Three Check-In Types** - Shopping, Food, Coffee/Treats
3. **Synthetic Transaction Data** - Pre-populated for demo purposes
4. **AI Orchestration** - Gemini Flash drives conversation flow
5. **Mode Detection** - Behavioral profiles assigned based on responses

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | Tailwind CSS 4 + Shadcn UI |
| AI | Google Gemini Flash (via @google/genai) |
| State | React hooks (useState, useReducer) |
| Testing | Jest + React Testing Library |

### LLM Wrapper Pattern

**CRITICAL**: All LLM calls must go through a wrapper that allows model switching via environment variable:

```typescript
// lib/llm/client.ts
const MODEL_ID = process.env.NEXT_PUBLIC_LLM_MODEL || "gemini-2.5-flash";
```

---

## UI Design (Based on Screenshot)

### Color Palette

```css
:root {
  --bg-primary: #1a0a2e;      /* Deep purple-black */
  --bg-card: #2d1b4e;          /* Muted purple */
  --accent-orange: #ff7b00;    /* Peek branding */
  --accent-yellow: #ffd700;    /* Amounts, emphasis */
  --text-primary: #ffffff;
  --text-muted: #a89cc0;
  --text-secondary: #7a6b8a;
}
```

### Key Components

1. **Header** - Weekly spend summary with comparison
2. **Peek Badge** - Notification count for pending check-ins
3. **Transaction Cards** - Individual transactions with check-in prompts
4. **Quick Reply Chips** - Pre-defined response options
5. **Chat Bubble** - For open-ended AI responses
6. **Custom Input** - Free-text entry option

---

## Data Models

### Transaction

```typescript
interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  category: "shopping" | "food" | "coffee";
  date: Date;
  isFirstTime: boolean;        // First time at this merchant
  frequencyThisWeek?: number;  // For pattern detection
  frequencyThisMonth?: number;
}
```

### CheckInSession

> ⚠️ **Low Priority for MVP**: Session persistence is not critical for the initial mock-up. Focus on the chat flow first.

```typescript
interface CheckInSession {
  id: string;
  transactionId: string;
  type: "shopping" | "food" | "coffee";
  status: "pending" | "in_progress" | "completed" | "dismissed";
  currentLayer: 1 | 2 | 3;
  path?: string;               // e.g., "impulse", "deliberate", "deal"
  mode?: string;               // e.g., "#comfort-driven-spender"
  messages: Message[];
  metadata: {
    startedAt?: Date;
    completedAt?: Date;
    tags: string[];
  };
}
```

### Message

```typescript
interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  options?: QuickReplyOption[];  // For structured responses
  isFixedQuestion?: boolean;     // Layer 1-2 fixed questions
}

interface QuickReplyOption {
  id: string;
  label: string;
  emoji?: string;
  value: string;
  color?: "yellow" | "white";   // Yellow = less intentional, needs probing
}
```

---

## Synthetic Data Coverage

Based on `PEEK_QUESTION_TREES.md`, we need transactions that can trigger:

### Shopping Check-In Paths

| Path | Example Transaction | Triggers |
|------|---------------------|----------|
| Impulse | $45 at Zara | "Saw it and bought it" |
| Deliberate | $98 at Nuuly | "Been thinking about this" |
| Deal/Scarcity | $29 at Urban Outfitters | "Good deal made me go for it" |
| Gift | $55 at Anthropologie | "Bought for someone else" |
| Maintenance | $22 at Target | "Restocking/replacing" |

### Food Check-In Scenarios

| Scenario | Data Required |
|----------|---------------|
| Guess vs Actual | Monthly food spend: $450 (user guesses $300) |
| Frequency Blind | 12 DoorDash orders this month |
| Timing Blind | 8 orders on Fridays |
| Merchant Concentration | 6 orders from same restaurant |

### Coffee/Treats Check-In Scenarios

| Scenario | Data Required |
|----------|---------------|
| Autopilot Routine | 18 Starbucks visits this month |
| Environment Triggered | Coffee shop near work |
| Emotional Coping | Purchases after work hours |
| Productivity Justification | Morning coffee runs |

---

## Synthetic Data Set

> 📋 **Implementation Note**: Generate a comprehensive set of 15-20+ transactions covering all check-in paths and scenarios. The examples below show the pattern—extend to cover every path documented in `PEEK_QUESTION_TREES.md`.

```typescript
export const syntheticTransactions: Transaction[] = [
  // ═══════════════════════════════════════════════════════════════
  // SHOPPING TRANSACTIONS - Cover all 5 paths
  // ═══════════════════════════════════════════════════════════════
  
  // Impulse path triggers
  {
    id: "txn_001",
    merchant: "Zara",
    amount: 45.00,
    category: "shopping",
    date: new Date("2024-12-19"),
    isFirstTime: true,
  },
  {
    id: "txn_002",
    merchant: "H&M",
    amount: 32.50,
    category: "shopping",
    date: new Date("2024-12-18"),
    isFirstTime: false,
  },
  
  // Deliberate path triggers
  {
    id: "txn_003",
    merchant: "Nuuly",
    amount: 98.00,
    category: "shopping",
    date: new Date("2024-12-17"),
    isFirstTime: true,
  },
  {
    id: "txn_004",
    merchant: "Everlane",
    amount: 128.00,
    category: "shopping",
    date: new Date("2024-12-15"),
    isFirstTime: false,
  },
  
  // Deal/Scarcity path triggers
  {
    id: "txn_005",
    merchant: "Urban Outfitters",
    amount: 29.00,
    category: "shopping",
    date: new Date("2024-12-16"),
    isFirstTime: true,
  },
  {
    id: "txn_006",
    merchant: "Nordstrom Rack",
    amount: 55.00,
    category: "shopping",
    date: new Date("2024-12-14"),
    isFirstTime: false,
  },
  
  // Gift path triggers
  {
    id: "txn_007",
    merchant: "Anthropologie",
    amount: 55.00,
    category: "shopping",
    date: new Date("2024-12-13"),
    isFirstTime: false,
  },
  
  // Maintenance path triggers
  {
    id: "txn_008",
    merchant: "Target",
    amount: 22.00,
    category: "shopping",
    date: new Date("2024-12-12"),
    isFirstTime: false,
    frequencyThisMonth: 4,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // FOOD TRANSACTIONS - For pattern detection
  // ═══════════════════════════════════════════════════════════════
  
  // DoorDash frequency pattern (user underestimates)
  {
    id: "txn_009",
    merchant: "DoorDash",
    amount: 28.50,
    category: "food",
    date: new Date("2024-12-19"),
    isFirstTime: false,
    frequencyThisWeek: 3,
    frequencyThisMonth: 12,
  },
  {
    id: "txn_010",
    merchant: "DoorDash",
    amount: 35.00,
    category: "food",
    date: new Date("2024-12-17"),
    isFirstTime: false,
    frequencyThisWeek: 3,
    frequencyThisMonth: 12,
  },
  {
    id: "txn_011",
    merchant: "Uber Eats",
    amount: 42.00,
    category: "food",
    date: new Date("2024-12-15"),
    isFirstTime: false,
    frequencyThisMonth: 5,
  },
  
  // Timing pattern (Friday concentration)
  {
    id: "txn_012",
    merchant: "Chipotle",
    amount: 15.50,
    category: "food",
    date: new Date("2024-12-13"), // Friday
    isFirstTime: false,
    frequencyThisMonth: 8,
  },
  
  // Merchant concentration
  {
    id: "txn_013",
    merchant: "Sweetgreen",
    amount: 18.00,
    category: "food",
    date: new Date("2024-12-18"),
    isFirstTime: false,
    frequencyThisMonth: 6,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // COFFEE/TREATS TRANSACTIONS - For habit detection
  // ═══════════════════════════════════════════════════════════════
  
  // Autopilot routine (high frequency)
  {
    id: "txn_014",
    merchant: "Starbucks",
    amount: 6.75,
    category: "coffee",
    date: new Date("2024-12-19"),
    isFirstTime: false,
    frequencyThisWeek: 5,
    frequencyThisMonth: 18,
  },
  {
    id: "txn_015",
    merchant: "Starbucks",
    amount: 7.25,
    category: "coffee",
    date: new Date("2024-12-18"),
    isFirstTime: false,
    frequencyThisWeek: 5,
    frequencyThisMonth: 18,
  },
  
  // Environment triggered (near work)
  {
    id: "txn_016",
    merchant: "Fount Coffee Kitchen",
    amount: 19.78,
    category: "coffee",
    date: new Date("2024-12-17"),
    isFirstTime: false,
    frequencyThisWeek: 3,
  },
  
  // Afternoon pick-me-up pattern
  {
    id: "txn_017",
    merchant: "Blue Bottle Coffee",
    amount: 8.50,
    category: "coffee",
    date: new Date("2024-12-16"),
    isFirstTime: true,
  },
  
  // Treat/emotional pattern
  {
    id: "txn_018",
    merchant: "Levain Bakery",
    amount: 12.00,
    category: "coffee",
    date: new Date("2024-12-14"),
    isFirstTime: false,
    frequencyThisMonth: 3,
  },
  
  // Local cafe habit
  {
    id: "txn_019",
    merchant: "Philz Coffee",
    amount: 6.50,
    category: "coffee",
    date: new Date("2024-12-13"),
    isFirstTime: false,
    frequencyThisMonth: 4,
  },
];
```

---

## Chat Orchestration Flow

> 🔗 **IMPORTANT**: This is a high-level summary only. All implementation details—exact question wording, response options, path routing, mode definitions, probing hints, and counter-profile detection—are defined in **`PEEK_QUESTION_TREES.md`**. That document is the source of truth for orchestration logic.

### Layer 1: Entry (Fixed Questions)

> 📖 See `PEEK_QUESTION_TREES.md` for exact Fixed Question wording and all response options per category.

```
┌─────────────────────────────────────────────────────────────────┐
│  1. User taps transaction → Check-in starts                     │
│  2. Display Fixed Question 1 (based on category)                │
│     → Shopping: "What's the story behind this purchase?"        │
│     → Food: Awareness calibration (guess vs actual)             │
│     → Coffee: Frequency calibration                             │
│  3. User selects option → Route to appropriate path             │
│  4. Display Fixed Question 2 (path-specific)                    │
│  5. User responds → Pass to LLM for probing                     │
└─────────────────────────────────────────────────────────────────┘
```

### Layer 2: LLM Probing

> 📖 See `PEEK_QUESTION_TREES.md` for exploration goals, probing hints, mode definitions, and counter-profile patterns per path.

```
┌─────────────────────────────────────────────────────────────────┐
│  1. LLM receives (pull from PEEK_QUESTION_TREES.md):            │
│     - Transaction context (amount, merchant, patterns)          │
│     - User's Layer 1 responses                                  │
│     - Path (impulse/deliberate/deal/gift/maintenance)           │
│     - Exploration goal for this path                            │
│     - Probing hints specific to this path                       │
│     - Mode definitions to match against                         │
│     - Counter-profile patterns for graceful exit                │
│                                                                 │
│  2. LLM asks 2-3 probing questions                              │
│  3. Based on responses, LLM assigns MODE from tree definitions  │
│  4. Transition to Layer 3                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Layer 3: Reflection

> 📖 See `PEEK_QUESTION_TREES.md` for reflection path details and mode-specific guidance.

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Display reflection options:                                 │
│     - "Is this a problem?"                                      │
│     - "How do I feel about this?"                               │
│     - "Is this a good use of money?"                            │
│     - "I have a different question"                             │
│     - "I'm good for now"                                        │
│                                                                 │
│  2. LLM guides reflection based on assigned mode                │
│  3. Session concludes with graceful exit                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## System Prompt Template

> 🔗 **CRITICAL**: The `${relevantQuestionTreeSection}` variable below should inject the **full, verbatim section** from `PEEK_QUESTION_TREES.md` for the current path—including exploration goals, probing hints, mode definitions, and counter-profiles. Do NOT summarize or abbreviate.

```markdown
You are Peek, a friendly financial companion helping users understand their spending patterns.

## Current Context
- Transaction: ${merchant} for ${amount} on ${date}
- Category: ${category}
- User's frequency at this merchant: ${frequency}
- Current Layer: ${layer}
- Current Path: ${path}
- Assigned Mode: ${mode || "not yet assigned"}

## Your Role
${layerInstructions}

## Question Tree Reference (from PEEK_QUESTION_TREES.md)
${relevantQuestionTreeSection}

## Guidelines
- Keep responses concise (1-2 sentences for probing)
- Use casual, friendly tone
- Never lecture or judge
- Recognize counter-profiles and exit gracefully (see patterns in tree reference)
- Reference specific details from the transaction
- Match user responses to MODE definitions from the tree reference
- Use probing hints verbatim from the tree when appropriate

## Response Format
{
  "message": "your response text",
  "options": [{ "label": "Option 1", "value": "option1" }],  // optional
  "assignedMode": "#mode-name",  // only if assigning mode (use exact names from tree)
  "shouldTransition": false,  // true if moving to next layer
  "exitGracefully": false     // true for counter-profiles
}
```

---

## File Structure

```
app/
├── page.tsx                    # Main spending dashboard
├── check-in/
│   └── [sessionId]/
│       └── page.tsx            # Check-in chat interface
├── api/
│   └── chat/
│       └── route.ts            # Gemini API endpoint
├── globals.css

components/
├── ui/                         # Shadcn components
├── spending/
│   ├── transaction-card.tsx    # Individual transaction
│   ├── weekly-summary.tsx      # Header with totals
│   └── peek-badge.tsx          # Notification badge
├── chat/
│   ├── chat-container.tsx      # Main chat wrapper
│   ├── message-bubble.tsx      # Individual messages
│   ├── quick-reply.tsx         # Option chips
│   └── custom-input.tsx        # Free-text input

lib/
├── llm/
│   ├── client.ts               # LLM wrapper (model switching)
│   ├── prompts.ts              # System prompts
│   └── question-trees.ts       # Structured tree data
├── data/
│   ├── synthetic-transactions.ts
│   └── check-in-sessions.ts
├── types/
│   └── index.ts                # All TypeScript interfaces
└── utils.ts                    # Existing utilities

__tests__/
├── chat-logic.test.ts          # Core conversation logic
├── mode-detection.test.ts      # Mode assignment tests
└── question-tree.test.ts       # Tree traversal tests
```

---

## Environment Variables

```bash
# .env.local
GOOGLE_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_LLM_MODEL=gemini-2.5-flash  # Can switch to other models
```

---

## 🚨 Features Requiring Review

The following features are inferred/created beyond the spec and need your review:

### 1. Counter-Profile Detection Logic
**Inferred behavior**: When a user's responses match counter-profile patterns (e.g., "intentional-collector", "trend-but-fits-me"), the system should:
- Skip deeper probing
- Exit with affirming message
- NOT create pattern artifacts

**Question**: Should counter-profiles still be logged for analytics even if we don't probe deeper?

### 2. Session Persistence
**Inferred behavior**: Check-in sessions are stored in localStorage for the mock-up.
**Question**: Should incomplete sessions be resumable, or start fresh each time?

### 3. Mode Assignment Confidence
**Inferred behavior**: LLM assigns modes with a confidence score (high/medium/low).
**Question**: What threshold of confidence is needed before showing mode insights to users?

### 4. Multi-Transaction Check-Ins
**Inferred behavior**: For pattern check-ins (Food, Coffee), we show aggregated data.
**Question**: Should users be able to drill into individual transactions from the pattern view?

### 5. "Other/Custom" Responses
**Inferred behavior**: When user selects "Other" or types custom response, LLM attempts to route to closest matching path.
**Question**: If no path matches, should we default to open-ended exploration or ask clarifying question?

---

## Testing Strategy

### Unit Tests (Jest)

```typescript
// __tests__/question-tree.test.ts
describe("Question Tree Navigation", () => {
  it("routes impulse path correctly after Fixed Q1", () => {
    // Test that "Saw it and bought it" → impulse path
  });
  
  it("identifies counter-profiles for graceful exit", () => {
    // Test that intentional behavior triggers exit
  });
});

// __tests__/mode-detection.test.ts
describe("Mode Assignment", () => {
  it("assigns #comfort-driven-spender from stress signals", () => {
    // Test mode detection from response patterns
  });
});
```

### Integration Tests

```typescript
// __tests__/chat-flow.test.ts
describe("Full Check-In Flow", () => {
  it("completes shopping impulse path end-to-end", async () => {
    // Simulate full conversation with mocked LLM
  });
});
```

---

## Implementation Iterations

### Iteration 1: Foundation (Est. 2-3 hours)
- [ ] Data models and TypeScript interfaces
- [ ] Synthetic transaction data
- [ ] Basic dashboard UI (spending summary + transaction list)
- [ ] LLM wrapper with env-var model switching

### Iteration 2: Chat Infrastructure (Est. 2-3 hours)
- [ ] Chat container and message components
- [ ] Quick reply chips
- [ ] Session state management
- [ ] Route to check-in page

### Iteration 3: Gemini Integration (Est. 2-3 hours)
- [ ] API route for chat
- [ ] System prompt construction
- [ ] Streaming response handling
- [ ] Error handling and fallbacks

### Iteration 4: Shopping Check-In Flow (Est. 3-4 hours)
- [ ] Layer 1 fixed questions (all paths)
- [ ] Layer 2 probing prompts
- [ ] Mode assignment logic
- [ ] Counter-profile detection
- [ ] Unit tests for shopping flow

### Iteration 5: Food Check-In Flow (Est. 2 hours)
- [ ] Awareness calibration (guess vs actual)
- [ ] Fixed question flow
- [ ] Mode assignment
- [ ] Economic evaluation reflection

### Iteration 6: Coffee/Treats Check-In Flow (Est. 2 hours)
- [ ] Frequency calibration
- [ ] Fixed question flow
- [ ] Mode-specific reflections

### Iteration 7: Reflection Paths (Est. 2-3 hours)
- [ ] "Is this a problem?" path
- [ ] "How do I feel?" path
- [ ] "Is this a good use?" path
- [ ] Open-ended exploration
- [ ] Graceful exits

### Iteration 8: Polish & Testing (Est. 2 hours)
- [ ] Full flow integration tests
- [ ] Error states and loading states
- [ ] Mobile responsiveness
- [ ] Final UI polish

---

## Quick Start

```bash
# Install dependencies
npm install @google/genai

# Add testing dependencies (dev)
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @types/jest ts-jest

# Add your API key to .env.local
echo "GOOGLE_API_KEY=your_key_here" >> .env.local
echo "NEXT_PUBLIC_LLM_MODEL=gemini-2.5-flash" >> .env.local

# Run development server
npm run dev

# Run tests
npm test
```

### Where to Put the API Key

Create a `.env.local` file in the project root with:

```bash
# .env.local
GOOGLE_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_LLM_MODEL=gemini-2.5-flash
```

The LLM client wrapper in `lib/llm/client.ts` will read from these variables.

---

## Notes

- The app uses **synthetic data only** for this mock-up phase
- User data upload functionality is planned for a future iteration
- **All conversation logic follows `PEEK_QUESTION_TREES.md` exactly**—that document contains the complete, detailed specifications for:
  - Fixed question wording and response options
  - Path routing logic
  - Exploration goals and probing hints per path
  - Mode definitions and matching criteria
  - Counter-profile patterns for graceful exits
  - Reflection path guidance
- LLM responses should feel conversational, not robotic
- When implementing, inject full verbatim sections from `PEEK_QUESTION_TREES.md` into prompts—do not summarize

