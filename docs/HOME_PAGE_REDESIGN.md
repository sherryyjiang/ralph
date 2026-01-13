# Home Page Redesign Specification

> **Purpose:** Inline entry questions on transaction cards  
> **Updated:** 2026-01-13

---

## Overview

The home page is being redesigned to:
1. Remove the weekly summary header
2. Show entry questions directly on transaction cards
3. Reduce the number of transactions to 4 key cards

---

## Layout Changes

### Before

```
┌─────────────────────────────────────────────────────────┐
│  Spending                          👀 28 peeks waiting  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │  This Week                                      │   │  ← REMOVE
│  │  $876.27        ↑18% vs last week               │   │  ← REMOVE
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [All] [Shopping] [Food] [Coffee]                       │
│                                                         │
│  RECENT TRANSACTIONS                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🛍️ Zara                              $45.00     │   │
│  │ Today · First time                              │   │
│  │ [💬 Quick check-in]                             │   │
│  └─────────────────────────────────────────────────┘   │
│  ... many more transactions ...                         │
└─────────────────────────────────────────────────────────┘
```

### After

```
┌─────────────────────────────────────────────────────────┐
│  Spending                          👀 4 peeks waiting   │
├─────────────────────────────────────────────────────────┤
│  [All] [Shopping] [Food] [Coffee]                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  SHOPPING CARD (with inline Fixed Q1)           │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  SHOPPING CARD (with inline Fixed Q1)           │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  FOOD CATEGORY CARD (with guess input)          │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  COFFEE CATEGORY CARD (with guess input)        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Card Type 1: Shopping Transaction Card

For individual shopping transactions (Zara, H&M).

### Design

```
┌─────────────────────────────────────────────────────────┐
│  🛍️ Zara                                      $45.00   │
│  Today · First time                                     │
│                                                         │
│  When you bought this, were you...                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⚡ Saw it and bought it in the moment           │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🎯 Been thinking about this for a while         │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🏷️ A good deal / discount made me go for it     │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🎁 Bought it for someone else                   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔄 Restocking or replacing                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Behavior

- On option click:
  1. Navigate to `/check-in/[sessionId]?txn=[id]&path=[selectedPath]`
  2. Chat starts with Fixed Q2 for that path (NOT Fixed Q1)

### Implementation

```tsx
function ShoppingTransactionCard({ transaction, onPathSelect }: Props) {
  const pathOptions = [
    { value: "impulse", label: "Saw it and bought it in the moment", emoji: "⚡" },
    { value: "deliberate", label: "Been thinking about this for a while", emoji: "🎯" },
    { value: "deal", label: "A good deal / discount made me go for it", emoji: "🏷️" },
    { value: "gift", label: "Bought it for someone else", emoji: "🎁" },
    { value: "maintenance", label: "Restocking or replacing", emoji: "🔄" },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-[#2d1b4e]/80 p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            🛍️
          </div>
          <div>
            <p className="font-medium text-white">{transaction.merchant}</p>
            <p className="text-sm text-[#a89cc0]">
              {formatDate(transaction.date)}
              {transaction.isFirstTime && " · First time"}
            </p>
          </div>
        </div>
        <p className="text-lg font-semibold text-[#ffd700]">
          {formatCurrency(transaction.amount)}
        </p>
      </div>

      {/* Entry Question */}
      <p className="mt-4 text-sm text-[#a89cc0]">
        When you bought this, were you...
      </p>

      {/* Path Options */}
      <div className="mt-3 space-y-2">
        {pathOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onPathSelect(transaction.id, option.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 
                       text-left text-sm text-white hover:bg-white/10 transition-colors"
          >
            <span className="mr-2">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Card Type 2: Category Check-In Card

For Food and Coffee categories (aggregated).

### Food Card Design

```
┌─────────────────────────────────────────────────────────┐
│  🍕 Food Delivery                              $251     │
│  9 orders this month                                    │
│                                                         │
│  How much do you think you spent on                     │
│  ordering food this month?                              │
│                                                         │
│  ┌───────────────────────────────────┬─────────────┐   │
│  │  $                                │     →       │   │
│  └───────────────────────────────────┴─────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Coffee Card Design

```
┌─────────────────────────────────────────────────────────┐
│  ☕ Coffee & Treats                            $102     │
│  18 purchases this month                                │
│                                                         │
│  How many times did you buy coffee or                   │
│  small treats this month?                               │
│                                                         │
│  ┌───────────────────────────────────┬─────────────┐   │
│  │                                   │     →       │   │
│  └───────────────────────────────────┴─────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Behavior

- On submit:
  1. Food: Navigate to `/check-in/[sessionId]?category=food&guess=[amount]`
  2. Coffee: Navigate to `/check-in/[sessionId]?category=coffee&guessCount=[count]`
  3. Chat starts with calibration RESULT (guess already captured)

### Implementation

```tsx
function CategoryCheckInCard({ 
  category, 
  totalSpend, 
  count, 
  onGuessSubmit 
}: Props) {
  const [guess, setGuess] = useState("");
  
  const isFood = category === "food";
  const icon = isFood ? "🍕" : "☕";
  const title = isFood ? "Food Delivery" : "Coffee & Treats";
  const question = isFood 
    ? "How much do you think you spent on ordering food this month?"
    : "How many times did you buy coffee or small treats this month?";
  const placeholder = isFood ? "$" : "";
  const inputType = "text"; // Allow freeform entry
  
  const handleSubmit = () => {
    if (guess.trim()) {
      onGuessSubmit(category, guess);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#2d1b4e]/80 p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center
            ${isFood ? "bg-green-500/20" : "bg-amber-500/20"}`}>
            {icon}
          </div>
          <div>
            <p className="font-medium text-white">{title}</p>
            <p className="text-sm text-[#a89cc0]">
              {count} {isFood ? "orders" : "purchases"} this month
            </p>
          </div>
        </div>
        <p className="text-lg font-semibold text-[#ffd700]">
          {formatCurrency(totalSpend)}
        </p>
      </div>

      {/* Entry Question */}
      <p className="mt-4 text-sm text-[#a89cc0]">
        {question}
      </p>

      {/* Guess Input */}
      <div className="mt-3 flex gap-2">
        <div className="flex-1 relative">
          {isFood && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
              $
            </span>
          )}
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={isFood ? "Enter amount" : "Enter number"}
            className={`w-full rounded-lg border border-white/10 bg-white/5 
                       py-2.5 pr-3 text-white placeholder:text-white/30
                       focus:border-[#ff7b00] focus:outline-none
                       ${isFood ? "pl-7" : "pl-3"}`}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!guess.trim()}
          className="rounded-lg bg-[#ff7b00] px-4 py-2.5 text-white 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-[#ff7b00]/90 transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}
```

---

## Page Component Updates

### app/page.tsx

```tsx
export default function DashboardPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | "all">("all");

  // Get category stats
  const foodStats = useMemo(() => getFoodCategoryStats(), []);
  const coffeeStats = useMemo(() => getCoffeeCategoryStats(), []);
  
  // Get shopping transactions (only Zara and H&M)
  const shoppingTransactions = useMemo(() => 
    syntheticTransactions.filter(t => t.category === "shopping"),
    []
  );

  // Count pending check-ins
  const pendingCheckIns = shoppingTransactions.length + 2; // +2 for food & coffee

  // Handle shopping path selection
  const handlePathSelect = (transactionId: string, path: string) => {
    const sessionId = `session_${Date.now()}_${transactionId}`;
    router.push(`/check-in/${sessionId}?txn=${transactionId}&path=${path}`);
  };

  // Handle category guess submission
  const handleGuessSubmit = (category: "food" | "coffee", guess: string) => {
    const sessionId = `session_${Date.now()}_${category}`;
    const param = category === "food" ? "guess" : "guessCount";
    router.push(`/check-in/${sessionId}?category=${category}&${param}=${guess}`);
  };

  return (
    <div className="peek-theme min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e]">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Spending</h1>
          <PeekBadge count={pendingCheckIns} />
        </div>

        {/* NO WeeklySummary component */}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <CategoryButton key={cat.value} {...cat} />
          ))}
        </div>

        {/* Transaction/Category Cards */}
        <div className="mt-6 space-y-4">
          {/* Shopping Transactions */}
          {(selectedCategory === "all" || selectedCategory === "shopping") &&
            shoppingTransactions.map((txn) => (
              <ShoppingTransactionCard
                key={txn.id}
                transaction={txn}
                onPathSelect={handlePathSelect}
              />
            ))}

          {/* Food Category Card */}
          {(selectedCategory === "all" || selectedCategory === "food") && (
            <CategoryCheckInCard
              category="food"
              totalSpend={foodStats.totalSpend}
              count={foodStats.orderCount}
              onGuessSubmit={handleGuessSubmit}
            />
          )}

          {/* Coffee Category Card */}
          {(selectedCategory === "all" || selectedCategory === "coffee") && (
            <CategoryCheckInCard
              category="coffee"
              totalSpend={coffeeStats.totalSpend}
              count={coffeeStats.purchaseCount}
              onGuessSubmit={handleGuessSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Navigation Parameters

### Shopping Check-In

URL: `/check-in/[sessionId]?txn=[transactionId]&path=[path]`

- `txn`: Transaction ID (e.g., "txn_001")
- `path`: Selected path from Fixed Q1 (impulse | deliberate | deal | gift | maintenance)

Chat starts with Fixed Q2 for that path.

### Food Check-In

URL: `/check-in/[sessionId]?category=food&guess=[amount]`

- `category`: "food"
- `guess`: User's guess in dollars (e.g., "175")

Chat starts with calibration result + feeling question.

### Coffee Check-In

URL: `/check-in/[sessionId]?category=coffee&guessCount=[count]`

- `category`: "coffee"  
- `guessCount`: User's guess in count (e.g., "10")

Chat starts with calibration result + feeling question.

---

## Related Files

- `app/page.tsx` — Main page component
- `lib/data/synthetic-transactions.ts` — Data sources
- `app/check-in/[sessionId]/page.tsx` — Check-in chat (reads URL params)

