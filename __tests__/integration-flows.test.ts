/**
 * Integration Tests for Complete Check-In Flows
 * 
 * Tests end-to-end scenarios for shopping, food, and coffee check-ins.
 */

import { getTransactionById, getMonthlyFoodSpend, getMonthlyCoffeeCount, getTransactionsByCategory } from "@/lib/data/synthetic-transactions";
import { getFixedQuestion1Options, explorationGoals } from "@/lib/llm/prompts";
import { 
  getShoppingFixedQuestion1, 
  getCoffeeFrequencyCalibration, 
  getFoodAwarenessCalibration,
  getFoodCalibrationResult,
  getFoodFeelingQuestion,
  getFoodMotivationQuestion,
  getFoodModeFromMotivation,
  getFoodEconomicEvaluation,
  getCoffeeCalibrationResult,
  getCoffeeFeelingQuestion,
  getCoffeeMotivationQuestion,
  getCoffeeFixedQ2,
  getCoffeeModeFromQ2Response,
  getCoffeeEconomicEvaluation,
  type FoodMode,
  type CoffeeMotivation,
} from "@/lib/llm/question-trees";

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

  describe("Calibration Result", () => {
    it("should identify close guesses (within 20%)", () => {
      const closeGuess = Math.round(actualMonthlySpend * 0.9); // 10% off
      const result = getFoodCalibrationResult(closeGuess, actualMonthlySpend);
      expect(result.isClose).toBe(true);
      expect(result.message).toContain("Nice awareness");
    });

    it("should identify way-off guesses (>20% AND $75+)", () => {
      const wayOffGuess = Math.round(actualMonthlySpend * 0.5); // 50% off
      const result = getFoodCalibrationResult(wayOffGuess, actualMonthlySpend);
      // Only way off if both >20% AND $75+ difference
      const diff = actualMonthlySpend - wayOffGuess;
      if (diff > 75) {
        expect(result.isClose).toBe(false);
        expect(result.showBreakdown).toBe(true);
      }
    });
  });

  describe("Feeling Question", () => {
    it("should have two feeling options", () => {
      const feelingQ = getFoodFeelingQuestion();
      expect(feelingQ.options.length).toBe(2);
      expect(feelingQ.options.map(o => o.value)).toContain("ok_with_it");
      expect(feelingQ.options.map(o => o.value)).toContain("not_great");
    });
  });

  describe("Motivation Question (Layer 2)", () => {
    it("should have motivation options", () => {
      const motivationQ = getFoodMotivationQuestion();
      expect(motivationQ.options.length).toBe(5);
    });

    it("should map motivations to modes", () => {
      expect(getFoodModeFromMotivation("drained")).toBe("#autopilot-from-stress");
      expect(getFoodModeFromMotivation("easier")).toBe("#convenience-driven");
      expect(getFoodModeFromMotivation("no_plan")).toBe("#lack-of-pre-planning");
      expect(getFoodModeFromMotivation("wanted_meal")).toBe("#intentional-treat");
    });
  });

  describe("Economic Evaluation (Layer 3)", () => {
    it("should generate mode-specific evaluation for stress mode", () => {
      const evaluation = getFoodEconomicEvaluation("#autopilot-from-stress" as FoodMode, actualMonthlySpend);
      expect(evaluation.content).toContain("relief");
      expect(evaluation.content).toContain(`$${actualMonthlySpend.toFixed(0)}`);
    });

    it("should generate mode-specific evaluation for convenience mode", () => {
      const evaluation = getFoodEconomicEvaluation("#convenience-driven" as FoodMode, actualMonthlySpend);
      expect(evaluation.content).toContain("ease");
    });

    it("should have worth evaluation options", () => {
      const evaluation = getFoodEconomicEvaluation("#convenience-driven" as FoodMode, actualMonthlySpend);
      expect(evaluation.options.length).toBe(2);
      expect(evaluation.options.map(o => o.value)).toContain("worth_it");
      expect(evaluation.options.map(o => o.value)).toContain("not_worth");
    });
  });

  describe("Complete Food Flow Path", () => {
    it("should support full flow: guess → result → feeling → motivation → evaluation", () => {
      // Step 1: User guesses (from URL)
      const guess = Math.round(actualMonthlySpend * 0.6);
      
      // Step 2: Show calibration result
      const result = getFoodCalibrationResult(guess, actualMonthlySpend);
      expect(result.message).toBeDefined();
      
      // Step 3: Feeling question
      const feelingQ = getFoodFeelingQuestion();
      expect(feelingQ.options.length).toBe(2);
      
      // Step 4: Motivation question (if could_be_better)
      const motivationQ = getFoodMotivationQuestion();
      expect(motivationQ.options.length).toBe(5);
      
      // Step 5: Mode assignment
      const mode = getFoodModeFromMotivation("drained");
      expect(mode).toBe("#autopilot-from-stress");
      
      // Step 6: Economic evaluation
      const evaluation = getFoodEconomicEvaluation(mode as FoodMode, actualMonthlySpend);
      expect(evaluation.options.length).toBe(2);
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
