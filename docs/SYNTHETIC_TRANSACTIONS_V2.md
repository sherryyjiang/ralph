# Synthetic Transactions v2

> **Purpose:** Reduced transaction set for iteration 2  
> **Updated:** 2026-01-13

---

## Overview

Reducing the synthetic transactions to focus on 4 key check-in scenarios:
1. **Zara** - Shopping (single transaction, first time)
2. **H&M** - Shopping (single transaction)
3. **Food** - Category-wide check-in (9 orders from various merchants)
4. **Coffee** - Category-wide check-in (18 purchases, primarily Starbucks)

---

## Shopping Transactions (Keep 2)

```typescript
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
```

---

## Food Transactions (9 orders, various merchants)

These represent the "Food Delivery" category. Individual transactions support the breakdown feature.

```typescript
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

// TOTALS:
// - 9 orders
// - $251 total spend
// - DoorDash: 4 orders, $112
// - Uber Eats: 3 orders, $89
// - Grubhub: 2 orders, $50
```

---

## Coffee Transactions (18 purchases, primarily Starbucks)

These represent the "Coffee & Treats" category.

```typescript
export const coffeeTransactions: Transaction[] = [
  // Starbucks - 15 purchases ($95)
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
  
  // Local Cafe - 3 purchases ($17)
  { id: "txn_coffee_016", merchant: "Local Cafe", amount: 5.50, category: "coffee", date: daysAgo(6), isFirstTime: false },
  { id: "txn_coffee_017", merchant: "Local Cafe", amount: 5.75, category: "coffee", date: daysAgo(11), isFirstTime: false },
  { id: "txn_coffee_018", merchant: "Local Cafe", amount: 5.75, category: "coffee", date: daysAgo(15), isFirstTime: false },
];

// TOTALS:
// - 18 purchases
// - $112 total spend (approximately)
// - Starbucks: 15 purchases, ~$95
// - Local Cafe: 3 purchases, ~$17
// - Average per visit: ~$6.22
```

---

## Combined Export

```typescript
export const syntheticTransactions: Transaction[] = [
  ...shoppingTransactions,
  ...foodTransactions,
  ...coffeeTransactions,
];
```

---

## Category Aggregate Functions

```typescript
export function getFoodCategoryStats(): CategoryStats {
  const foodTxns = syntheticTransactions.filter(t => t.category === "food");
  
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

export function getCoffeeCategoryStats(): CategoryStats {
  const coffeeTxns = syntheticTransactions.filter(t => t.category === "coffee");
  
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
```

---

## Type Definitions

```typescript
interface CategoryStats {
  totalSpend: number;
  orderCount?: number;      // For food
  purchaseCount?: number;   // For coffee
  avgPerVisit?: number;     // For coffee
  topMerchants: { name: string; count: number; spend: number }[];
  topDays: { day: string; count: number }[];
}
```

---

## What Gets Removed

The following transactions from v1 should be DELETED:

### Shopping (remove all except Zara and H&M)
- Free People
- Nuuly
- Everlane
- Urban Outfitters
- Nordstrom Rack
- Anthropologie
- Etsy
- Target
- Amazon

### Food (replace with new set above)
- All existing individual DoorDash/Uber Eats/etc. transactions
- Sweetgreen
- Chipotle

### Coffee (replace with new set above)
- Fount Coffee Kitchen
- Blue Bottle Coffee
- Philz Coffee
- Levain Bakery
- Milk Bar
- Dunkin'

---

## Related Files

- `lib/data/synthetic-transactions.ts` — Main implementation
- `lib/types/index.ts` — CategoryStats type
- `app/page.tsx` — Uses category stats for cards

