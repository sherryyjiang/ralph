import { getThisWeeksTransactions, getWeeklySummary } from "@/lib/data/synthetic-transactions";
import type { Transaction, TransactionCategory } from "@/lib/types";

// Category icons and labels
const categoryConfig: Record<TransactionCategory, { emoji: string; label: string }> = {
  shopping: { emoji: "🛍️", label: "Shopping" },
  food: { emoji: "🍔", label: "Food" },
  coffee: { emoji: "☕", label: "Coffee & Treats" },
};

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date for display
function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Group transactions by date
function groupByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();
  
  transactions.forEach((txn) => {
    const dateKey = formatDate(txn.date);
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, txn]);
  });
  
  return groups;
}

// Weekly Summary Component
function WeeklySummary() {
  const summary = getWeeklySummary();
  const isUp = summary.percentageChange > 0;
  
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#2d1b4e] to-[#1a0a2e] p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[#a89cc0]">
          This Week
        </h2>
        <div className="flex items-center gap-2 rounded-full bg-[#ff7b00] px-3 py-1">
          <span className="text-xs font-bold text-white">
            {summary.pendingCheckIns} Check-ins
          </span>
        </div>
      </div>
      
      <div className="mb-2">
        <span className="text-4xl font-bold text-[#ffd700]">
          {formatCurrency(summary.totalSpent)}
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <span className={isUp ? "text-red-400" : "text-green-400"}>
          {isUp ? "↑" : "↓"} {Math.abs(summary.percentageChange)}%
        </span>
        <span className="text-[#7a6b8a]">
          vs last week ({formatCurrency(summary.previousWeekSpent)})
        </span>
      </div>
      
      <div className="mt-4 flex gap-4 border-t border-white/10 pt-4">
        <div className="flex-1">
          <p className="text-2xl font-semibold text-white">{summary.transactionCount}</p>
          <p className="text-xs text-[#7a6b8a]">Transactions</p>
        </div>
        <div className="flex-1">
          <p className="flex items-center gap-1 text-2xl font-semibold text-white">
            {categoryConfig[summary.topCategory].emoji}
          </p>
          <p className="text-xs text-[#7a6b8a]">Top Category</p>
        </div>
      </div>
    </div>
  );
}

// Transaction Card Component
function TransactionCard({ transaction }: { transaction: Transaction }) {
  const config = categoryConfig[transaction.category];
  
  return (
    <div className="group flex items-center gap-4 rounded-xl bg-[#2d1b4e]/60 p-4 transition-all duration-200 hover:bg-[#2d1b4e] hover:shadow-lg cursor-pointer">
      {/* Category Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1a0a2e] text-2xl">
        {config.emoji}
      </div>
      
      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{transaction.merchant}</p>
        <p className="text-sm text-[#a89cc0]">{config.label}</p>
      </div>
      
      {/* Amount & Check-in indicator */}
      <div className="text-right">
        <p className="font-semibold text-[#ffd700]">
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-[#ff7b00] opacity-0 transition-opacity group-hover:opacity-100">
          Tap to reflect →
        </p>
      </div>
    </div>
  );
}

// Transaction List Component
function TransactionList() {
  const transactions = getThisWeeksTransactions();
  const grouped = groupByDate(transactions);
  
  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([dateLabel, txns]) => (
        <div key={dateLabel}>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-[#7a6b8a]">
            {dateLabel}
          </h3>
          <div className="space-y-2">
            {txns.map((txn) => (
              <TransactionCard key={txn.id} transaction={txn} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Main Dashboard Page
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#1a0a2e]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a0a2e]/95 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">
              <span className="text-[#ff7b00]">Peek</span> Check-In
            </h1>
            <button className="rounded-full bg-[#2d1b4e] p-2 text-[#a89cc0] transition-colors hover:bg-[#3d2b5e] hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {/* Weekly Summary */}
        <WeeklySummary />
        
        {/* Intro text */}
        <div className="text-center">
          <p className="text-sm text-[#a89cc0]">
            Tap any transaction to start a check-in 💬
          </p>
        </div>
        
        {/* Transaction List */}
        <TransactionList />
      </main>
      
      {/* Bottom padding for mobile */}
      <div className="h-20" />
    </div>
  );
}
