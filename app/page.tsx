"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { syntheticTransactions } from "@/lib/data/synthetic-transactions";
import type { Transaction, TransactionCategory } from "@/lib/types";

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
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

function getCategoryIcon(category: TransactionCategory): string {
  switch (category) {
    case "shopping": return "🛍️";
    case "food": return "🍕";
    case "coffee": return "☕";
  }
}

function getCategoryColor(category: TransactionCategory): string {
  switch (category) {
    case "shopping": return "bg-purple-500/20 text-purple-300";
    case "food": return "bg-green-500/20 text-green-300";
    case "coffee": return "bg-amber-500/20 text-amber-300";
  }
}

function getThisWeekTransactions(): Transaction[] {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return syntheticTransactions.filter((t) => t.date >= weekAgo);
}

function calculateWeeklySpend(): number {
  return getThisWeekTransactions().reduce((sum, t) => sum + t.amount, 0);
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function WeeklySummary({ totalSpent, previousWeek }: { totalSpent: number; previousWeek: number }) {
  const percentChange = previousWeek > 0 
    ? ((totalSpent - previousWeek) / previousWeek) * 100 
    : 0;
  const isUp = percentChange > 0;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#2d1b4e] to-[#1a0a2e] p-6 shadow-xl">
      <p className="text-sm font-medium text-[#a89cc0]">This Week</p>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-4xl font-bold text-[#ffd700]">
          {formatCurrency(totalSpent)}
        </span>
        <span className={`flex items-center text-sm ${isUp ? "text-red-400" : "text-green-400"}`}>
          {isUp ? "↑" : "↓"} {Math.abs(percentChange).toFixed(0)}%
          <span className="ml-1 text-[#7a6b8a]">vs last week</span>
        </span>
      </div>
    </div>
  );
}

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

function TransactionCard({ 
  transaction, 
  onCheckIn 
}: { 
  transaction: Transaction; 
  onCheckIn: (id: string) => void;
}) {
  const hasHighFrequency = (transaction.frequencyThisMonth ?? 0) > 3;
  
  return (
    <div 
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#2d1b4e]/80 p-4 transition-all duration-200 hover:border-[#ff7b00]/50 hover:shadow-lg hover:shadow-[#ff7b00]/10"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon + Details */}
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${getCategoryColor(transaction.category)}`}>
            {getCategoryIcon(transaction.category)}
          </div>
          <div>
            <p className="font-medium text-white">{transaction.merchant}</p>
            <div className="mt-1 flex items-center gap-2 text-sm text-[#a89cc0]">
              <span>{formatDate(transaction.date)}</span>
              {hasHighFrequency && (
                <>
                  <span className="text-[#7a6b8a]">•</span>
                  <span className="text-[#ff7b00]">
                    {transaction.frequencyThisMonth}x this month
                  </span>
                </>
              )}
              {transaction.isFirstTime && (
                <>
                  <span className="text-[#7a6b8a]">•</span>
                  <span className="text-purple-400">First time</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Amount */}
        <div className="text-right">
          <p className="text-lg font-semibold text-[#ffd700]">
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      </div>

      {/* Check-in CTA */}
      <button
        onClick={() => onCheckIn(transaction.id)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff7b00]/10 py-2.5 text-sm font-medium text-[#ff7b00] transition-all duration-200 hover:bg-[#ff7b00]/20 active:scale-[0.98]"
      >
        <span className="text-base">💬</span>
        Quick check-in
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | "all">("all");

  const weeklySpend = useMemo(() => calculateWeeklySpend(), []);
  const previousWeekSpend = weeklySpend * 0.85; // Mock previous week (15% less)
  
  const thisWeekTransactions = useMemo(() => getThisWeekTransactions(), []);
  const pendingCheckIns = thisWeekTransactions.length;

  const filteredTransactions = useMemo(() => {
    if (selectedCategory === "all") {
      return syntheticTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
    return syntheticTransactions
      .filter((t) => t.category === selectedCategory)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [selectedCategory]);

  const handleCheckIn = (transactionId: string) => {
    // Generate a session ID and navigate to check-in
    const sessionId = `session_${Date.now()}_${transactionId}`;
    router.push(`/check-in/${sessionId}?txn=${transactionId}`);
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

        {/* Weekly Summary */}
        <WeeklySummary totalSpent={weeklySpend} previousWeek={previousWeekSpend} />

        {/* Category Filter */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
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

        {/* Transaction List */}
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[#7a6b8a]">
            Recent Transactions
          </h2>
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onCheckIn={handleCheckIn}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-[#a89cc0]">No transactions in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
