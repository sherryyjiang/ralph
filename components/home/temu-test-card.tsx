"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getTemuMonthlySpend, getTemuSampleTransactions } from "@/lib/data/temu-test";

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TemuTestCard() {
  const router = useRouter();
  const [guess, setGuess] = useState("");
  const transactions = getTemuSampleTransactions();

  const handleSubmit = () => {
    if (!guess.trim()) return;
    const sessionId = `temu_test_${Date.now()}`;
    const params = new URLSearchParams({ guess });
    router.push(`/check-in/temu-test/${sessionId}?${params.toString()}`);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#2d1b4e]/80 p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/20 text-xl">
            🛒
          </div>
          <div>
            <p className="font-medium text-white">Temu</p>
            <p className="text-sm text-[#a89cc0]">Monthly spend check-in</p>
          </div>
        </div>
        <p className="text-lg font-semibold text-[#ffd700]">
          Guess
        </p>
      </div>

      {/* Sample Transactions */}
      <div className="mt-4 space-y-2">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <div className="text-sm text-[#a89cc0]">{formatDate(txn.date)}</div>
              <div className="text-sm text-white">{txn.merchant}</div>
            </div>
            <div className="text-sm text-[#ffd700]">${txn.amount.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Entry Question */}
      <p className="mt-4 text-sm text-[#a89cc0]">
        How much do you think you spent on Temu this month?
      </p>

      {/* Guess Input */}
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            $
          </span>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter amount"
            className="w-full rounded-lg border border-white/10 bg-white/5 
                       py-2.5 pl-7 pr-3 text-white placeholder:text-white/30
                       focus:border-[#ff7b00] focus:outline-none"
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
