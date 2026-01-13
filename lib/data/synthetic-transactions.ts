/**
 * Synthetic Transaction Data v2
 * 
 * Reduced transaction set for iteration 2:
 * - Shopping: Zara, H&M (2 transactions)
 * - Food: 9 orders from various merchants (~$251 total)
 * - Coffee: 18 purchases, primarily Starbucks (~$112 total)
 */

import { Transaction, WeeklySummary } from "@/lib/types";

// Helper to create dates relative to "today" (for demo purposes)
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// ═══════════════════════════════════════════════════════════════════════════
// SHOPPING TRANSACTIONS - 2 items
// ═══════════════════════════════════════════════════════════════════════════

export const shoppingTransactions: Transaction[] = [
  {
    id: "txn_001",
    merchant: "Zara",
    amount: 45.00,
    category: "shopping",
    date: daysAgo(0), // Today
    isFirstTime: true,
  },
  {
    id: "txn_002",
    merchant: "H&M",
    amount: 32.50,
    category: "shopping",
    date: daysAgo(1), // Yesterday
    isFirstTime: false,
    frequencyThisMonth: 2,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// FOOD TRANSACTIONS - 9 orders, ~$251 total
// ═══════════════════════════════════════════════════════════════════════════

export const foodTransactions: Transaction[] = [
  // DoorDash - 4 orders ($112)
  {
    id: "txn_food_001",
    merchant: "DoorDash",
    amount: 28.50,
    category: "food",
    date: daysAgo(0),
    isFirstTime: false,
  },
  {
    id: "txn_food_002",
    merchant: "DoorDash",
    amount: 32.00,
    category: "food",
    date: daysAgo(3),
    isFirstTime: false,
  },
  {
    id: "txn_food_003",
    merchant: "DoorDash",
    amount: 25.50,
    category: "food",
    date: daysAgo(7),
    isFirstTime: false,
  },
  {
    id: "txn_food_004",
    merchant: "DoorDash",
    amount: 26.00,
    category: "food",
    date: daysAgo(12),
    isFirstTime: false,
  },
  
  // Uber Eats - 3 orders ($89)
  {
    id: "txn_food_005",
    merchant: "Uber Eats",
    amount: 35.00,
    category: "food",
    date: daysAgo(2),
    isFirstTime: false,
  },
  {
    id: "txn_food_006",
    merchant: "Uber Eats",
    amount: 28.00,
    category: "food",
    date: daysAgo(6),
    isFirstTime: false,
  },
  {
    id: "txn_food_007",
    merchant: "Uber Eats",
    amount: 26.00,
    category: "food",
    date: daysAgo(10),
    isFirstTime: false,
  },
  
  // Grubhub - 2 orders ($50)
  {
    id: "txn_food_008",
    merchant: "Grubhub",
    amount: 27.00,
    category: "food",
    date: daysAgo(5),
    isFirstTime: false,
  },
  {
    id: "txn_food_009",
    merchant: "Grubhub",
    amount: 23.00,
    category: "food",
    date: daysAgo(14),
    isFirstTime: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COFFEE TRANSACTIONS - 18 purchases, ~$112 total
// ═══════════════════════════════════════════════════════════════════════════

export const coffeeTransactions: Transaction[] = [
  // Starbucks - 15 purchases (~$95)
  { id: "txn_coffee_001", merchant: "Starbucks", amount: 6.50, category: "coffee", date: daysAgo(0), isFirstTime: false },
  { id: "txn_coffee_002", merchant: "Starbucks", amount: 6.75, category: "coffee", date: daysAgo(1), isFirstTime: false },
  { id: "txn_coffee_003", merchant: "Starbucks", amount: 6.25, category: "coffee", date: daysAgo(2), isFirstTime: false },
  { id: "txn_coffee_004", merchant: "Starbucks", amount: 7.00, category: "coffee", date: daysAgo(3), isFirstTime: false },
  { id: "txn_coffee_005", merchant: "Starbucks", amount: 6.50, category: "coffee", date: daysAgo(4), isFirstTime: false },
  { id: "txn_coffee_006", merchant: "Starbucks", amount: 6.75, category: "coffee", date: daysAgo(5), isFirstTime: false },
  { id: "txn_coffee_007", merchant: "Starbucks", amount: 6.25, category: "coffee", date: daysAgo(7), isFirstTime: false },
  { id: "txn_coffee_008", merchant: "Starbucks", amount: 6.50, category: "coffee", date: daysAgo(8), isFirstTime: false },
  { id: "txn_coffee_009", merchant: "Starbucks", amount: 6.75, category: "coffee", date: daysAgo(9), isFirstTime: false },
  { id: "txn_coffee_010", merchant: "Starbucks", amount: 6.00, category: "coffee", date: daysAgo(10), isFirstTime: false },
  { id: "txn_coffee_011", merchant: "Starbucks", amount: 6.50, category: "coffee", date: daysAgo(12), isFirstTime: false },
  { id: "txn_coffee_012", merchant: "Starbucks", amount: 6.25, category: "coffee", date: daysAgo(14), isFirstTime: false },
  { id: "txn_coffee_013", merchant: "Starbucks", amount: 6.75, category: "coffee", date: daysAgo(16), isFirstTime: false },
  { id: "txn_coffee_014", merchant: "Starbucks", amount: 6.50, category: "coffee", date: daysAgo(18), isFirstTime: false },
  { id: "txn_coffee_015", merchant: "Starbucks", amount: 6.25, category: "coffee", date: daysAgo(20), isFirstTime: false },
  
  // Local Cafe - 3 purchases (~$17)
  { id: "txn_coffee_016", merchant: "Local Cafe", amount: 5.50, category: "coffee", date: daysAgo(6), isFirstTime: false },
  { id: "txn_coffee_017", merchant: "Local Cafe", amount: 5.75, category: "coffee", date: daysAgo(11), isFirstTime: false },
  { id: "txn_coffee_018", merchant: "Local Cafe", amount: 5.75, category: "coffee", date: daysAgo(15), isFirstTime: false },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const syntheticTransactions: Transaction[] = [
  ...shoppingTransactions,
  ...foodTransactions,
  ...coffeeTransactions,
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get transactions for the current week (last 7 days)
 */
export function getThisWeeksTransactions(): Transaction[] {
  const weekAgo = daysAgo(7);
  return syntheticTransactions.filter(txn => txn.date >= weekAgo);
}

/**
 * Get transactions by category
 */
export function getTransactionsByCategory(category: Transaction["category"]): Transaction[] {
  return syntheticTransactions.filter(txn => txn.category === category);
}

/**
 * Calculate weekly spending summary
 */
export function getWeeklySummary(): WeeklySummary {
  const thisWeek = getThisWeeksTransactions();
  const totalSpent = thisWeek.reduce((sum, txn) => sum + txn.amount, 0);
  
  // Simulate previous week's spending (slightly less for demo)
  const previousWeekSpent = totalSpent * 0.85;
  const percentageChange = ((totalSpent - previousWeekSpent) / previousWeekSpent) * 100;
  
  // Count transactions by category to find top
  const categoryTotals = thisWeek.reduce((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)[0]?.[0] as Transaction["category"] || "shopping";
  
  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    previousWeekSpent: Math.round(previousWeekSpent * 100) / 100,
    percentageChange: Math.round(percentageChange),
    transactionCount: thisWeek.length,
    topCategory,
    pendingCheckIns: Math.min(thisWeek.length, 5), // Cap at 5 for demo
  };
}

/**
 * Get a single transaction by ID
 */
export function getTransactionById(id: string): Transaction | undefined {
  return syntheticTransactions.find(txn => txn.id === id);
}

/**
 * Get total monthly food spending (for awareness calibration)
 */
export function getMonthlyFoodSpend(): number {
  const foodTxns = getTransactionsByCategory("food");
  return Math.round(foodTxns.reduce((sum, txn) => sum + txn.amount, 0) * 100) / 100;
}

/**
 * Get total monthly coffee/treats spending
 */
export function getMonthlyCoffeeSpend(): number {
  const coffeeTxns = getTransactionsByCategory("coffee");
  return Math.round(coffeeTxns.reduce((sum, txn) => sum + txn.amount, 0) * 100) / 100;
}

/**
 * Get coffee visit count this month (for frequency calibration)
 */
export function getMonthlyCoffeeCount(): number {
  return getTransactionsByCategory("coffee").length;
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY STATS - For category check-in cards
// ═══════════════════════════════════════════════════════════════════════════

export interface CategoryStats {
  totalSpend: number;
  orderCount?: number;      // For food
  purchaseCount?: number;   // For coffee
  avgPerVisit?: number;     // For coffee
  topMerchants: { name: string; count: number; spend: number }[];
  topDays: { day: string; count: number }[];
}

/**
 * Get aggregate stats for food category (for category check-in card)
 */
export function getFoodCategoryStats(): CategoryStats {
  const foodTxns = getTransactionsByCategory("food");
  
  const totalSpend = foodTxns.reduce((sum, t) => sum + t.amount, 0);
  const orderCount = foodTxns.length;
  
  // Group by merchant
  const byMerchant = foodTxns.reduce((acc, t) => {
    if (!acc[t.merchant]) {
      acc[t.merchant] = { name: t.merchant, count: 0, spend: 0 };
    }
    acc[t.merchant].count++;
    acc[t.merchant].spend += t.amount;
    return acc;
  }, {} as Record<string, { name: string; count: number; spend: number }>);
  
  const topMerchants = Object.values(byMerchant)
    .sort((a, b) => b.count - a.count);
  
  // Group by day of week
  const byDay = foodTxns.reduce((acc, t) => {
    const day = t.date.toLocaleDateString("en-US", { weekday: "long" });
    if (!acc[day]) {
      acc[day] = { day, count: 0 };
    }
    acc[day].count++;
    return acc;
  }, {} as Record<string, { day: string; count: number }>);
  
  const topDays = Object.values(byDay)
    .sort((a, b) => b.count - a.count);
  
  return {
    totalSpend: Math.round(totalSpend * 100) / 100,
    orderCount,
    topMerchants,
    topDays,
  };
}

/**
 * Get aggregate stats for coffee category (for category check-in card)
 */
export function getCoffeeCategoryStats(): CategoryStats {
  const coffeeTxns = getTransactionsByCategory("coffee");
  
  const totalSpend = coffeeTxns.reduce((sum, t) => sum + t.amount, 0);
  const purchaseCount = coffeeTxns.length;
  const avgPerVisit = purchaseCount > 0 ? totalSpend / purchaseCount : 0;
  
  // Group by merchant
  const byMerchant = coffeeTxns.reduce((acc, t) => {
    if (!acc[t.merchant]) {
      acc[t.merchant] = { name: t.merchant, count: 0, spend: 0 };
    }
    acc[t.merchant].count++;
    acc[t.merchant].spend += t.amount;
    return acc;
  }, {} as Record<string, { name: string; count: number; spend: number }>);
  
  const topMerchants = Object.values(byMerchant)
    .sort((a, b) => b.count - a.count);
  
  // Group by day of week
  const byDay = coffeeTxns.reduce((acc, t) => {
    const day = t.date.toLocaleDateString("en-US", { weekday: "long" });
    if (!acc[day]) {
      acc[day] = { day, count: 0 };
    }
    acc[day].count++;
    return acc;
  }, {} as Record<string, { day: string; count: number }>);
  
  const topDays = Object.values(byDay)
    .sort((a, b) => b.count - a.count);
  
  return {
    totalSpend: Math.round(totalSpend * 100) / 100,
    purchaseCount,
    avgPerVisit: Math.round(avgPerVisit * 100) / 100,
    topMerchants,
    topDays,
  };
}
