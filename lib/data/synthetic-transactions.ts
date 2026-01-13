/**
 * Synthetic Transaction Data
 * 
 * Pre-populated transactions covering all check-in paths and scenarios:
 * - Shopping: impulse, deliberate, deal, gift, maintenance
 * - Food: frequency patterns, timing patterns, merchant concentration
 * - Coffee: autopilot routine, environment triggered, emotional, productivity
 */

import { Transaction, WeeklySummary } from "@/lib/types";

// Helper to create dates relative to "today" (for demo purposes)
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const syntheticTransactions: Transaction[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SHOPPING TRANSACTIONS - Cover all 5 paths
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Impulse path triggers
  {
    id: "txn_001",
    merchant: "Zara",
    amount: 45.00,
    category: "shopping",
    date: daysAgo(0),
    isFirstTime: true,
  },
  {
    id: "txn_002",
    merchant: "H&M",
    amount: 32.50,
    category: "shopping",
    date: daysAgo(1),
    isFirstTime: false,
    frequencyThisMonth: 2,
  },
  {
    id: "txn_003",
    merchant: "Free People",
    amount: 78.00,
    category: "shopping",
    date: daysAgo(2),
    isFirstTime: true,
  },
  
  // Deliberate path triggers
  {
    id: "txn_004",
    merchant: "Nuuly",
    amount: 98.00,
    category: "shopping",
    date: daysAgo(3),
    isFirstTime: true,
  },
  {
    id: "txn_005",
    merchant: "Everlane",
    amount: 128.00,
    category: "shopping",
    date: daysAgo(5),
    isFirstTime: false,
    frequencyThisMonth: 1,
  },
  
  // Deal/Scarcity path triggers
  {
    id: "txn_006",
    merchant: "Urban Outfitters",
    amount: 29.00,
    category: "shopping",
    date: daysAgo(4),
    isFirstTime: true,
  },
  {
    id: "txn_007",
    merchant: "Nordstrom Rack",
    amount: 55.00,
    category: "shopping",
    date: daysAgo(6),
    isFirstTime: false,
    frequencyThisMonth: 3,
  },
  
  // Gift path triggers
  {
    id: "txn_008",
    merchant: "Anthropologie",
    amount: 55.00,
    category: "shopping",
    date: daysAgo(7),
    isFirstTime: false,
    frequencyThisMonth: 1,
  },
  {
    id: "txn_009",
    merchant: "Etsy",
    amount: 42.00,
    category: "shopping",
    date: daysAgo(8),
    isFirstTime: false,
    frequencyThisMonth: 2,
  },
  
  // Maintenance path triggers
  {
    id: "txn_010",
    merchant: "Target",
    amount: 22.00,
    category: "shopping",
    date: daysAgo(2),
    isFirstTime: false,
    frequencyThisMonth: 4,
  },
  {
    id: "txn_011",
    merchant: "Amazon",
    amount: 35.99,
    category: "shopping",
    date: daysAgo(4),
    isFirstTime: false,
    frequencyThisMonth: 6,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOD TRANSACTIONS - For pattern detection
  // ═══════════════════════════════════════════════════════════════════════════
  
  // DoorDash frequency pattern (user underestimates)
  {
    id: "txn_012",
    merchant: "DoorDash",
    amount: 28.50,
    category: "food",
    date: daysAgo(0),
    isFirstTime: false,
    frequencyThisWeek: 3,
    frequencyThisMonth: 12,
  },
  {
    id: "txn_013",
    merchant: "DoorDash",
    amount: 35.00,
    category: "food",
    date: daysAgo(2),
    isFirstTime: false,
    frequencyThisWeek: 3,
    frequencyThisMonth: 12,
  },
  {
    id: "txn_014",
    merchant: "DoorDash",
    amount: 24.75,
    category: "food",
    date: daysAgo(4),
    isFirstTime: false,
    frequencyThisWeek: 3,
    frequencyThisMonth: 12,
  },
  
  // Uber Eats pattern
  {
    id: "txn_015",
    merchant: "Uber Eats",
    amount: 42.00,
    category: "food",
    date: daysAgo(1),
    isFirstTime: false,
    frequencyThisMonth: 5,
  },
  {
    id: "txn_016",
    merchant: "Uber Eats",
    amount: 38.50,
    category: "food",
    date: daysAgo(5),
    isFirstTime: false,
    frequencyThisMonth: 5,
  },
  
  // Merchant concentration pattern (same restaurant multiple times)
  {
    id: "txn_017",
    merchant: "Sweetgreen",
    amount: 18.00,
    category: "food",
    date: daysAgo(1),
    isFirstTime: false,
    frequencyThisMonth: 6,
  },
  {
    id: "txn_018",
    merchant: "Sweetgreen",
    amount: 16.50,
    category: "food",
    date: daysAgo(3),
    isFirstTime: false,
    frequencyThisMonth: 6,
  },
  
  // Timing pattern (Friday concentration - stress/end of week)
  {
    id: "txn_019",
    merchant: "Chipotle",
    amount: 15.50,
    category: "food",
    date: daysAgo(2), // Assume this is a Friday
    isFirstTime: false,
    frequencyThisMonth: 8,
  },
  
  // Late-night orders (potential stress eating)
  {
    id: "txn_020",
    merchant: "Grubhub",
    amount: 32.00,
    category: "food",
    date: daysAgo(3),
    isFirstTime: false,
    frequencyThisMonth: 4,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COFFEE/TREATS TRANSACTIONS - For habit detection
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Autopilot routine (high frequency Starbucks)
  {
    id: "txn_021",
    merchant: "Starbucks",
    amount: 6.75,
    category: "coffee",
    date: daysAgo(0),
    isFirstTime: false,
    frequencyThisWeek: 5,
    frequencyThisMonth: 18,
  },
  {
    id: "txn_022",
    merchant: "Starbucks",
    amount: 7.25,
    category: "coffee",
    date: daysAgo(1),
    isFirstTime: false,
    frequencyThisWeek: 5,
    frequencyThisMonth: 18,
  },
  {
    id: "txn_023",
    merchant: "Starbucks",
    amount: 6.50,
    category: "coffee",
    date: daysAgo(2),
    isFirstTime: false,
    frequencyThisWeek: 5,
    frequencyThisMonth: 18,
  },
  
  // Environment triggered (near work - local cafe)
  {
    id: "txn_024",
    merchant: "Fount Coffee Kitchen",
    amount: 19.78,
    category: "coffee",
    date: daysAgo(1),
    isFirstTime: false,
    frequencyThisWeek: 3,
    frequencyThisMonth: 8,
  },
  {
    id: "txn_025",
    merchant: "Fount Coffee Kitchen",
    amount: 15.50,
    category: "coffee",
    date: daysAgo(3),
    isFirstTime: false,
    frequencyThisWeek: 3,
    frequencyThisMonth: 8,
  },
  
  // Afternoon pick-me-up / productivity justification
  {
    id: "txn_026",
    merchant: "Blue Bottle Coffee",
    amount: 8.50,
    category: "coffee",
    date: daysAgo(2),
    isFirstTime: true,
  },
  {
    id: "txn_027",
    merchant: "Philz Coffee",
    amount: 7.00,
    category: "coffee",
    date: daysAgo(4),
    isFirstTime: false,
    frequencyThisMonth: 4,
  },
  
  // Treat/emotional pattern (bakery, dessert spots)
  {
    id: "txn_028",
    merchant: "Levain Bakery",
    amount: 12.00,
    category: "coffee",
    date: daysAgo(5),
    isFirstTime: false,
    frequencyThisMonth: 3,
  },
  {
    id: "txn_029",
    merchant: "Milk Bar",
    amount: 14.50,
    category: "coffee",
    date: daysAgo(6),
    isFirstTime: true,
  },
  
  // Quick convenience coffee
  {
    id: "txn_030",
    merchant: "Dunkin'",
    amount: 4.25,
    category: "coffee",
    date: daysAgo(3),
    isFirstTime: false,
    frequencyThisMonth: 5,
  },
];

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
  const foodTransactions = getTransactionsByCategory("food");
  return foodTransactions.reduce((sum, txn) => sum + txn.amount, 0);
}

/**
 * Get total monthly coffee/treats spending
 */
export function getMonthlyCoffeeSpend(): number {
  const coffeeTransactions = getTransactionsByCategory("coffee");
  return coffeeTransactions.reduce((sum, txn) => sum + txn.amount, 0);
}

/**
 * Get coffee visit count this month (for frequency calibration)
 */
export function getMonthlyCoffeeCount(): number {
  return getTransactionsByCategory("coffee").length;
}
