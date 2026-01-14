"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  shoppingTransactions, 
  foodTransactions,
  coffeeTransactions
} from "@/lib/data/synthetic-transactions";
import type { Transaction, TransactionCategory } from "@/lib/types";
import { ChipotleTestCard } from "@/components/home/chipotle-test-card";

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateWithDay(date: Date): string {
  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${day}, ${dateStr}`;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function PeekBadge({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <div className="flex items-center gap-2 rounded-full bg-[#ff7b00] px-4 py-2 shadow-lg shadow-orange-500/20">
      <span className="text-lg">👀</span>
      <span className="font-semibold text-white">
        {count} peek{count !== 1 ? "s" : ""} waiting
      </span>
    </div>
  );
}

// Path options for Fixed Q1 (shopping)
const PATH_OPTIONS = [
  { value: "impulse", label: "Saw it and bought it in the moment", emoji: "⚡" },
  { value: "deliberate", label: "Been thinking about this for a while", emoji: "🎯" },
  { value: "deal", label: "A good deal / discount made me go for it", emoji: "🏷️" },
  { value: "gift", label: "Bought it for someone else", emoji: "🎁" },
  { value: "maintenance", label: "Restocking or replacing", emoji: "🔄" },
];

function ShoppingTransactionCard({ 
  transaction, 
  onPathSelect 
}: { 
  transaction: Transaction; 
  onPathSelect: (transactionId: string, path: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#2d1b4e]/80 p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-xl">
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
        {PATH_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPathSelect(transaction.id, option.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 
                       text-left text-sm text-white transition-colors hover:bg-white/10"
          >
            <span className="mr-2">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CategoryCheckInCard({ 
  category, 
  sampleTransactions,
  onGuessSubmit 
}: { 
  category: "food" | "coffee";
  sampleTransactions: Transaction[];
  onGuessSubmit: (category: "food" | "coffee", guess: string) => void;
}) {
  const [guess, setGuess] = useState("");
  
  const isFood = category === "food";
  const icon = isFood ? "🍕" : "☕";
  const title = isFood ? "Food Delivery" : "Coffee & Treats";
  const question = isFood 
    ? "How much do you think you spent on ordering food this month?"
    : "How many times did you buy coffee or small treats this month?";
  
  const handleSubmit = () => {
    if (guess.trim()) {
      onGuessSubmit(category, guess);
    }
  };

  // Show up to 3 sample transactions, sorted by date (most recent first)
  const displayTransactions = [...sampleTransactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);

  return (
    <div className="rounded-xl border border-white/10 bg-[#2d1b4e]/80 p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl
            ${isFood ? "bg-green-500/20" : "bg-amber-500/20"}`}>
            {icon}
          </div>
          <div>
            <p className="font-medium text-white">{title}</p>
          </div>
        </div>
      </div>

      {/* Sample Transactions */}
      <div className="mt-4 space-y-2">
        {displayTransactions.map((txn) => (
          <div
            key={txn.id}
            className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <div className="text-sm text-[#a89cc0]">
                {formatDateWithDay(txn.date)}
              </div>
              <div className="text-sm text-white">{txn.merchant}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Entry Question */}
      <p className="mt-4 text-sm text-[#a89cc0]">
        {question}
      </p>

      {/* Guess Input */}
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
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
          type="button"
          onClick={handleSubmit}
          disabled={!guess.trim()}
          className="rounded-lg bg-[#ff7b00] px-4 py-2.5 text-white 
                     transition-colors hover:bg-[#ff7b00]/90
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | "all">("all");
  
  // Pending check-ins: 2 shopping + food + coffee + chipotle test = 5
  const pendingCheckIns = shoppingTransactions.length + 3;

  // Handle shopping path selection
  const handlePathSelect = (transactionId: string, path: string) => {
    const sessionId = `session_${Date.now()}_${transactionId}`;
    const params = new URLSearchParams({ txn: transactionId, path });
    router.push(`/check-in/${sessionId}?${params.toString()}`);
  };

  // Handle category guess submission
  const handleGuessSubmit = (category: "food" | "coffee", guess: string) => {
    const sessionId = `session_${Date.now()}_${category}`;
    const param = category === "food" ? "guess" : "guessCount";
    const params = new URLSearchParams({ category, [param]: guess });
    router.push(`/check-in/${sessionId}?${params.toString()}`);
  };

  const categories: { value: TransactionCategory | "all"; label: string; icon: string }[] = [
    { value: "all", label: "All", icon: "📊" },
    { value: "shopping", label: "Shopping", icon: "🛍️" },
    { value: "food", label: "Food", icon: "🍕" },
    { value: "coffee", label: "Coffee", icon: "☕" },
  ];

  return (
    <div className="peek-theme min-h-screen bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e]">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Spending</h1>
          <PeekBadge count={pendingCheckIns} />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat.value
                  ? "bg-[#ff7b00] text-white shadow-lg shadow-orange-500/20"
                  : "bg-white/10 text-[#a89cc0] hover:bg-white/20"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
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
              sampleTransactions={foodTransactions}
              onGuessSubmit={handleGuessSubmit}
            />
          )}

          {/* Coffee Category Card */}
          {(selectedCategory === "all" || selectedCategory === "coffee") && (
            <CategoryCheckInCard
              category="coffee"
              sampleTransactions={coffeeTransactions}
              onGuessSubmit={handleGuessSubmit}
            />
          )}

          {/* Chipotle Test Card */}
          {(selectedCategory === "all" || selectedCategory === "food") && (
            <ChipotleTestCard />
          )}
        </div>
      </div>
    </div>
  );
}
