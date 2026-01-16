import type { Transaction } from "@/lib/types";

const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const temuTransactions: Transaction[] = [
  { id: "txn_temu_001", merchant: "Temu", amount: 68.22, category: "shopping", date: daysAgo(1), isFirstTime: false },
  { id: "txn_temu_002", merchant: "Temu", amount: 54.11, category: "shopping", date: daysAgo(3), isFirstTime: false },
  { id: "txn_temu_003", merchant: "Temu", amount: 39.87, category: "shopping", date: daysAgo(5), isFirstTime: false },
  { id: "txn_temu_004", merchant: "Temu", amount: 72.50, category: "shopping", date: daysAgo(7), isFirstTime: false },
  { id: "txn_temu_005", merchant: "Temu", amount: 28.16, category: "shopping", date: daysAgo(10), isFirstTime: false },
  { id: "txn_temu_006", merchant: "Temu", amount: 64.99, category: "shopping", date: daysAgo(12), isFirstTime: false },
  { id: "txn_temu_007", merchant: "Temu", amount: 22.75, category: "shopping", date: daysAgo(15), isFirstTime: false },
  { id: "txn_temu_008", merchant: "Temu", amount: 93.94, category: "shopping", date: daysAgo(18), isFirstTime: false },
  { id: "txn_temu_009", merchant: "Temu", amount: 45.00, category: "shopping", date: daysAgo(21), isFirstTime: false },
];

export function getTemuMonthlySpend(): number {
  return Math.round(temuTransactions.reduce((sum, txn) => sum + txn.amount, 0) * 100) / 100;
}

export function getTemuSampleTransactions(limit = 3): Transaction[] {
  return [...temuTransactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

export function getTemuTestTransaction(): Transaction {
  return {
    id: "temu_checkin",
    merchant: "Temu",
    amount: getTemuMonthlySpend(),
    category: "shopping",
    date: new Date(),
    isFirstTime: false,
  };
}
