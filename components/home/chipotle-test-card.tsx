"use client";

import { useRouter } from "next/navigation";
import { chipotleTestTransaction } from "@/lib/data/chipotle-test";
import { CHIPOTLE_ENTRY_OPTIONS } from "@/lib/llm/question-trees/chipotle-test";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

export function ChipotleTestCard() {
  const router = useRouter();
  const txn = chipotleTestTransaction;

  const handleEntrySelect = (reason: string) => {
    const sessionId = `chipotle_test_${Date.now()}`;
    const params = new URLSearchParams({ reason });
    router.push(`/check-in/chipotle-test/${sessionId}?${params.toString()}`);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#2d1b4e]/80 p-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 text-xl">
            🌯
          </div>
          <div>
            <p className="font-medium text-white">{txn.merchant}</p>
            <p className="text-sm text-[#a89cc0]">{formatDate(txn.date)}</p>
          </div>
        </div>
        <p className="text-lg font-semibold text-[#ffd700]">
          {formatCurrency(txn.amount)}
        </p>
      </div>

      {/* Entry Question */}
      <p className="mt-4 text-sm text-[#a89cc0]">
        You spent {formatCurrency(txn.amount)} at {txn.merchant} — what was it for?
      </p>

      {/* Entry Options */}
      <div className="mt-3 space-y-2">
        {CHIPOTLE_ENTRY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleEntrySelect(option.value)}
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
