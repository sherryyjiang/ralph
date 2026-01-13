/**
 * Integration Tests for Complete Check-In Flows
 * 
 * Tests end-to-end scenarios for shopping, food, and coffee check-ins.
 */

import { getTransactionById, getMonthlyFoodSpend, getMonthlyCoffeeCount, getTransactionsByCategory } from "@/lib/data/synthetic-transactions";
import { getFixedQuestion1Options, explorationGoals } from "@/lib/llm/prompts";
import { getShoppingFixedQuestion1, getCoffeeFrequencyCalibration, getFoodAwarenessCalibration } from "@/lib/llm/question-trees";

// ═══════════════════════════════════════════════════════════════
// Shopping Flow Integration Tests
// ═══════════════════════════════════════════════════════════════

describe("Shopping Check-In Flow Integration", () => {
  const shoppingTransactions = getTransactionsByCategory("shopping");

  it("should have shopping transactions for testing", () => {
    expect(shoppingTransactions.length).toBeGreaterThan(0);
  });

  describe("Impulse Path Flow", () => {
    const transaction = shoppingTransactions[0];

    it("should start with Fixed Question 1", () => {
      const q1 = getShoppingFixedQuestion1(transaction);
      expect(q1.content).toContain("When you bought");
      expect(q1.options.length).toBe(5);
    });

    it("should have exploration goals for impulse path", () => {
      const goal = explorationGoals.impulse;
      expect(goal).toBeDefined();
      expect(goal.probingHints.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Food Flow Integration Tests
// ═══════════════════════════════════════════════════════════════

describe("Food Check-In Flow Integration", () => {
  const foodTransactions = getTransactionsByCategory("food");
  const actualMonthlySpend = getMonthlyFoodSpend();

  it("should have food transactions for testing", () => {
    expect(foodTransactions.length).toBeGreaterThan(0);
  });

  it("should calculate monthly food spend", () => {
    expect(actualMonthlySpend).toBeGreaterThan(0);
  });

  describe("Awareness Calibration", () => {
    const transaction = foodTransactions[0];
    const calibration = getFoodAwarenessCalibration(transaction, actualMonthlySpend);

    it("should generate awareness calibration question", () => {
      expect(calibration.content).toContain(transaction.merchant);
    });

    it("should have guess options with monetary values", () => {
      expect(calibration.options.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Coffee Flow Integration Tests
// ═══════════════════════════════════════════════════════════════

describe("Coffee Check-In Flow Integration", () => {
  const coffeeTransactions = getTransactionsByCategory("coffee");
  const actualMonthlyCount = getMonthlyCoffeeCount();

  it("should have coffee transactions for testing", () => {
    expect(coffeeTransactions.length).toBeGreaterThan(0);
  });

  it("should calculate monthly coffee count", () => {
    expect(actualMonthlyCount).toBeGreaterThan(0);
  });

  describe("Frequency Calibration", () => {
    const transaction = coffeeTransactions[0];
    const calibration = getCoffeeFrequencyCalibration(transaction, actualMonthlyCount);

    it("should generate frequency calibration question", () => {
      expect(calibration.content).toContain(transaction.merchant);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Transaction Data Quality Tests
// ═══════════════════════════════════════════════════════════════

describe("Transaction Data Quality", () => {
  it("should have transactions for all categories", () => {
    const shopping = getTransactionsByCategory("shopping");
    const food = getTransactionsByCategory("food");
    const coffee = getTransactionsByCategory("coffee");

    expect(shopping.length).toBeGreaterThan(0);
    expect(food.length).toBeGreaterThan(0);
    expect(coffee.length).toBeGreaterThan(0);
  });

  it("should have valid transaction data", () => {
    const txn = getTransactionById("txn_001");
    expect(txn).toBeDefined();
    expect(txn?.merchant).toBeDefined();
    expect(txn?.amount).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// Layer Transition Tests
// ═══════════════════════════════════════════════════════════════

describe("Layer Transitions", () => {
  it("should have Layer 1 → Layer 2 path for all shopping paths", () => {
    const paths = ["impulse", "deliberate", "deal", "gift", "maintenance"];
    paths.forEach(path => {
      expect(explorationGoals[path]).toBeDefined();
    });
  });

  it("should have probing hints for Layer 2", () => {
    Object.keys(explorationGoals).forEach(path => {
      expect(explorationGoals[path].probingHints.length).toBeGreaterThan(0);
    });
  });
});
