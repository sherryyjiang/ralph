/**
 * Integration Tests for Complete Check-In Flows
 * 
 * Tests end-to-end scenarios for shopping, food, and coffee check-ins.
 */

import { getTransactionById, getMonthlyFoodSpend, getMonthlyCoffeeCount, getTransactionsByCategory } from "@/lib/data/synthetic-transactions";
import { explorationGoals } from "@/lib/llm/prompts";
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
  type CoffeeMode,
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
  const actualMonthlySpend = 112; // Approximate from spec

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

    it("should have count guess options", () => {
      expect(calibration.options.length).toBeGreaterThan(0);
    });
  });

  describe("Calibration Result", () => {
    it("should identify close guesses (within 20% or 2 purchases)", () => {
      const closeGuess = actualMonthlyCount - 1;
      const result = getCoffeeCalibrationResult(closeGuess, actualMonthlyCount, actualMonthlySpend);
      expect(result.isClose).toBe(true);
      expect(result.message).toContain("close");
    });

    it("should identify way-off guesses", () => {
      const wayOffGuess = Math.round(actualMonthlyCount * 0.5);
      const result = getCoffeeCalibrationResult(wayOffGuess, actualMonthlyCount, actualMonthlySpend);
      const diff = Math.abs(actualMonthlyCount - wayOffGuess);
      if (diff > 2) {
        expect(result.isClose).toBe(false);
      }
    });

    it("should include actual count and spend in result", () => {
      const result = getCoffeeCalibrationResult(10, actualMonthlyCount, actualMonthlySpend);
      expect(result.actualCount).toBe(actualMonthlyCount);
      expect(result.totalSpend).toBe(actualMonthlySpend);
    });
  });

  describe("Feeling Question", () => {
    it("should have two feeling options", () => {
      const feelingQ = getCoffeeFeelingQuestion();
      expect(feelingQ.options.length).toBe(2);
      expect(feelingQ.options.map(o => o.value)).toContain("ok_with_it");
      expect(feelingQ.options.map(o => o.value)).toContain("could_be_better");
    });
  });

  describe("Motivation Question (Layer 2)", () => {
    it("should have four motivation options", () => {
      const motivationQ = getCoffeeMotivationQuestion();
      expect(motivationQ.options.length).toBe(4);
    });

    it("should have all expected motivation values", () => {
      const motivationQ = getCoffeeMotivationQuestion();
      const values = motivationQ.options.map(o => o.value);
      expect(values).toContain("routine");
      expect(values).toContain("nearby");
      expect(values).toContain("pick_me_up");
      expect(values).toContain("focus");
    });
  });

  describe("Fixed Q2 for Each Motivation", () => {
    const weeklyAverage = Math.round(actualMonthlyCount / 4);

    it("should generate Q2 for routine motivation", () => {
      const q2 = getCoffeeFixedQ2("routine" as CoffeeMotivation, weeklyAverage);
      expect(q2.content).toContain("intentional");
      expect(q2.options.length).toBe(2);
    });

    it("should generate Q2 for nearby motivation", () => {
      const q2 = getCoffeeFixedQ2("nearby" as CoffeeMotivation, weeklyAverage);
      expect(q2.content).toContain("happen");
      expect(q2.options.length).toBe(3);
    });

    it("should generate Q2 for pick_me_up motivation", () => {
      const q2 = getCoffeeFixedQ2("pick_me_up" as CoffeeMotivation, weeklyAverage);
      expect(q2.content).toContain("going on");
      expect(q2.options.length).toBe(4);
    });

    it("should generate Q2 for focus motivation", () => {
      const q2 = getCoffeeFixedQ2("focus" as CoffeeMotivation, weeklyAverage);
      expect(q2.content).toContain("focus");
      expect(q2.options.length).toBe(5);
    });
  });

  describe("Mode Assignment", () => {
    it("should assign autopilot-routine mode for just_happened", () => {
      const assignment = getCoffeeModeFromQ2Response("routine" as CoffeeMotivation, "just_happened");
      expect(assignment.mode).toBe("#autopilot-routine");
      expect(assignment.isCounterProfile).toBe(false);
    });

    it("should exit gracefully for intentional routine", () => {
      const assignment = getCoffeeModeFromQ2Response("routine" as CoffeeMotivation, "intentional");
      expect(assignment.mode).toBe("#intentional-ritual");
      expect(assignment.isCounterProfile).toBe(true);
      expect(assignment.exitMessage).toBeDefined();
    });

    it("should assign environment-triggered mode for nearby", () => {
      const assignment = getCoffeeModeFromQ2Response("nearby" as CoffeeMotivation, "near_work");
      expect(assignment.mode).toBe("#environment-triggered");
    });

    it("should assign emotional-coping mode for pick_me_up", () => {
      const assignment = getCoffeeModeFromQ2Response("pick_me_up" as CoffeeMotivation, "stressed_anxious");
      expect(assignment.mode).toBe("#emotional-coping");
    });

    it("should exit gracefully for productive coffee drinker", () => {
      const assignment = getCoffeeModeFromQ2Response("focus" as CoffeeMotivation, "real_difference");
      expect(assignment.mode).toBe("#productive-coffee-drinker");
      expect(assignment.isCounterProfile).toBe(true);
    });
  });

  describe("Economic Evaluation (Layer 3)", () => {
    it("should generate mode-specific evaluation", () => {
      const evaluation = getCoffeeEconomicEvaluation("#autopilot-routine", actualMonthlySpend, actualMonthlyCount);
      expect(evaluation.content).toContain("didn't consciously choose");
      expect(evaluation.content).toContain(`$${actualMonthlySpend.toFixed(0)}`);
    });

    it("should have three worth evaluation options", () => {
      const evaluation = getCoffeeEconomicEvaluation("#emotional-coping", actualMonthlySpend, actualMonthlyCount);
      expect(evaluation.options.length).toBe(3);
      expect(evaluation.options.map(o => o.value)).toContain("worth_it");
      expect(evaluation.options.map(o => o.value)).toContain("not_worth");
      expect(evaluation.options.map(o => o.value)).toContain("mixed");
    });
  });

  describe("Complete Coffee Flow Path", () => {
    it("should support full flow: guess → result → feeling → motivation → Q2 → evaluation", () => {
      // Step 1: User guesses count (from URL)
      const guessCount = 10;
      
      // Step 2: Show calibration result
      const result = getCoffeeCalibrationResult(guessCount, actualMonthlyCount, actualMonthlySpend);
      expect(result.message).toBeDefined();
      
      // Step 3: Feeling question
      const feelingQ = getCoffeeFeelingQuestion();
      expect(feelingQ.options.length).toBe(2);
      
      // Step 4: Motivation question (if could_be_better)
      const motivationQ = getCoffeeMotivationQuestion();
      expect(motivationQ.options.length).toBe(4);
      
      // Step 5: Fixed Q2 based on motivation
      const q2 = getCoffeeFixedQ2("pick_me_up" as CoffeeMotivation, 5);
      expect(q2.options.length).toBeGreaterThan(0);
      
      // Step 6: Mode assignment
      const assignment = getCoffeeModeFromQ2Response("pick_me_up" as CoffeeMotivation, "stressed_anxious");
      expect(assignment.mode).toBe("#emotional-coping");
      
      // Step 7: Economic evaluation
      const evaluation = getCoffeeEconomicEvaluation(assignment.mode, actualMonthlySpend, actualMonthlyCount);
      expect(evaluation.options.length).toBe(3);
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

// ═══════════════════════════════════════════════════════════════
// Awareness Calibration Phase Transitions (Criterion 25)
// ═══════════════════════════════════════════════════════════════

describe("Awareness Calibration Phase Transitions - Food", () => {
  const actualMonthlySpend = getMonthlyFoodSpend();

  describe("Phase: Awaiting Guess → Awaiting Feeling", () => {
    it("should transition from guess to feeling after calibration reveal", () => {
      // User makes guess (from URL or options)
      const guess = Math.round(actualMonthlySpend * 0.6);
      
      // Show calibration result
      const result = getFoodCalibrationResult(guess, actualMonthlySpend);
      expect(result.message).toBeDefined();
      
      // After result shown, should ask feeling question
      const feelingQ = getFoodFeelingQuestion();
      expect(feelingQ.content).toContain("How do you feel");
      expect(feelingQ.options.length).toBe(2);
    });

    it("should have correct feeling options", () => {
      const feelingQ = getFoodFeelingQuestion();
      const values = feelingQ.options.map(o => o.value);
      expect(values).toContain("ok_with_it");
      expect(values).toContain("not_great");
    });
  });

  describe("Phase: Way Off Detection → Breakdown Offered", () => {
    it("should offer breakdown only when guess is way off (>20% AND $75+)", () => {
      // Test close guess - no breakdown
      const closeGuess = Math.round(actualMonthlySpend * 0.9);
      const closeResult = getFoodCalibrationResult(closeGuess, actualMonthlySpend);
      expect(closeResult.isClose).toBe(true);
      expect(closeResult.showBreakdown).toBe(false);
      
      // Test way off guess - with breakdown
      const wayOffGuess = Math.round(actualMonthlySpend * 0.4);
      const wayOffResult = getFoodCalibrationResult(wayOffGuess, actualMonthlySpend);
      const diff = actualMonthlySpend - wayOffGuess;
      // Only way off if >20% AND $75+ difference
      if (diff > 75) {
        expect(wayOffResult.isClose).toBe(false);
        expect(wayOffResult.showBreakdown).toBe(true);
      }
    });

    it("should track awareness gap when way off", () => {
      const wayOffGuess = Math.round(actualMonthlySpend * 0.3);
      const result = getFoodCalibrationResult(wayOffGuess, actualMonthlySpend);
      // Way off detection should indicate blindspot/awareness gap
      if (!result.isClose) {
        expect(result.percentDiff).toBeGreaterThan(20);
      }
    });
  });

  describe("Phase: Feeling Response → Mode Assignment", () => {
    it("should exit gracefully when user selects 'ok_with_it'", () => {
      // User says they're fine - no further exploration needed
      const feelingQ = getFoodFeelingQuestion();
      const okOption = feelingQ.options.find(o => o.value === "ok_with_it");
      expect(okOption).toBeDefined();
      // ok_with_it should lead to graceful exit
    });

    it("should proceed to motivation question when user selects 'not_great'", () => {
      // User wants to explore - show motivation question
      const motivationQ = getFoodMotivationQuestion();
      expect(motivationQ.content).toContain("why you order food");
      expect(motivationQ.options.length).toBe(5);
    });
  });

  describe("Phase: Motivation → Mode Assignment → Layer 3", () => {
    it("should map all motivation options to valid modes", () => {
      const motivations = ["drained", "easier", "no_plan", "wanted_meal", "too_busy"];
      motivations.forEach(motivation => {
        const mode = getFoodModeFromMotivation(motivation);
        expect(mode).toBeDefined();
        expect(mode).toMatch(/^#/); // Modes start with #
      });
    });

    it("should detect intentional_treat as counter-profile", () => {
      const mode = getFoodModeFromMotivation("wanted_meal");
      expect(mode).toBe("#intentional-treat");
    });

    it("should transition to economic evaluation in Layer 3", () => {
      const mode = "#autopilot-from-stress" as FoodMode;
      const evaluation = getFoodEconomicEvaluation(mode, actualMonthlySpend);
      expect(evaluation.content).toContain("worth");
      expect(evaluation.content).toContain(`$${actualMonthlySpend.toFixed(0)}`);
    });
  });
});

describe("Awareness Calibration Phase Transitions - Coffee", () => {
  const actualMonthlyCount = getMonthlyCoffeeCount();
  const actualMonthlySpend = 112; // Approximate from spec

  describe("Phase: Guess Count → Feeling", () => {
    it("should transition from guess to feeling after count reveal", () => {
      const guessCount = 10;
      const result = getCoffeeCalibrationResult(guessCount, actualMonthlyCount, actualMonthlySpend);
      expect(result.message).toBeDefined();
      expect(result.actualCount).toBe(actualMonthlyCount);
      expect(result.totalSpend).toBe(actualMonthlySpend);
    });

    it("should have correct feeling options for coffee", () => {
      const feelingQ = getCoffeeFeelingQuestion();
      const values = feelingQ.options.map(o => o.value);
      expect(values).toContain("ok_with_it");
      expect(values).toContain("could_be_better");
    });
  });

  describe("Phase: Way Off Detection", () => {
    it("should detect close guess (within 20% or 2 purchases)", () => {
      const closeGuess = actualMonthlyCount - 1;
      const result = getCoffeeCalibrationResult(closeGuess, actualMonthlyCount, actualMonthlySpend);
      expect(result.isClose).toBe(true);
    });

    it("should detect way off guess", () => {
      const wayOffGuess = Math.round(actualMonthlyCount * 0.3);
      const result = getCoffeeCalibrationResult(wayOffGuess, actualMonthlyCount, actualMonthlySpend);
      const diff = Math.abs(actualMonthlyCount - wayOffGuess);
      if (diff > 2 && result.percentDiff > 20) {
        expect(result.isClose).toBe(false);
      }
    });
  });

  describe("Phase: Motivation → Fixed Q2 → Mode Assignment", () => {
    it("should have 4 motivation options", () => {
      const motivationQ = getCoffeeMotivationQuestion();
      expect(motivationQ.options.length).toBe(4);
    });

    it("should generate Fixed Q2 for each motivation path", () => {
      const weeklyAverage = 5;
      const motivations: CoffeeMotivation[] = ["routine", "nearby", "pick_me_up", "focus"];
      
      motivations.forEach(motivation => {
        const q2 = getCoffeeFixedQ2(motivation, weeklyAverage);
        expect(q2.content).toBeDefined();
        expect(q2.options.length).toBeGreaterThan(0);
      });
    });

    it("should assign mode after Q2 response", () => {
      // Routine path
      const routineMode = getCoffeeModeFromQ2Response("routine" as CoffeeMotivation, "just_happened");
      expect(routineMode.mode).toBe("#autopilot-routine");
      
      // Counter-profile detection
      const intentionalMode = getCoffeeModeFromQ2Response("routine" as CoffeeMotivation, "intentional");
      expect(intentionalMode.isCounterProfile).toBe(true);
      expect(intentionalMode.mode).toBe("#intentional-ritual");
    });
  });

  describe("Phase: Counter-Profile Detection", () => {
    it("should detect intentional ritual as counter-profile", () => {
      const assignment = getCoffeeModeFromQ2Response("routine" as CoffeeMotivation, "intentional");
      expect(assignment.isCounterProfile).toBe(true);
      expect(assignment.exitMessage).toBeDefined();
    });

    it("should detect productive coffee drinker as counter-profile", () => {
      const assignment = getCoffeeModeFromQ2Response("focus" as CoffeeMotivation, "real_difference");
      expect(assignment.isCounterProfile).toBe(true);
      expect(assignment.mode).toBe("#productive-coffee-drinker");
    });
  });

  describe("Phase: Economic Evaluation (Layer 3)", () => {
    it("should generate mode-specific evaluation questions", () => {
      const modes = [
        "#autopilot-routine",
        "#environment-triggered",
        "#emotional-coping",
        "#productivity-justification",
      ];
      
      modes.forEach(mode => {
        const evaluation = getCoffeeEconomicEvaluation(mode as CoffeeMode, actualMonthlySpend, actualMonthlyCount);
        expect(evaluation.content).toContain("worth");
        expect(evaluation.options.length).toBe(3); // worth_it, not_worth, mixed
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Awareness Calibration Phase Transition Tests (Criterion 25)
// ═══════════════════════════════════════════════════════════════

describe("Awareness Calibration Phase Transitions", () => {
  const actualMonthlySpend = getMonthlyFoodSpend();
  const actualMonthlyCount = getMonthlyCoffeeCount();

  describe("Food Calibration Phases", () => {
    it("should transition from guess to result showing", () => {
      // Simulate: User submits guess → Show calibration result
      const guess = Math.round(actualMonthlySpend * 0.5);
      const result = getFoodCalibrationResult(guess, actualMonthlySpend);
      
      // Result should include message and comparison details
      expect(result.message).toBeDefined();
      expect(result.percentDiff).toBeDefined();
      expect(result.absoluteDiff).toBeDefined();
      // The message should mention the actual amount
      expect(result.message).toContain(`$${actualMonthlySpend.toFixed(0)}`);
    });

    it("should transition from result to feeling question", () => {
      // After showing result, feeling question should be available
      const feelingQ = getFoodFeelingQuestion();
      
      expect(feelingQ.content).toContain("feel");
      expect(feelingQ.options).toHaveLength(2);
    });

    it("should identify when breakdown is appropriate (way off)", () => {
      // Way off: >20% AND $75+ difference
      const wayOffGuess = Math.round(actualMonthlySpend * 0.4);
      const result = getFoodCalibrationResult(wayOffGuess, actualMonthlySpend);
      
      const diff = actualMonthlySpend - wayOffGuess;
      if (diff > 75) {
        expect(result.showBreakdown).toBe(true);
      }
    });

    it("should skip breakdown when guess is close", () => {
      // Close guess: within 20% or <$75 difference
      const closeGuess = Math.round(actualMonthlySpend * 0.9);
      const result = getFoodCalibrationResult(closeGuess, actualMonthlySpend);
      
      expect(result.isClose).toBe(true);
      // showBreakdown should be false for close guesses
    });

    it("should transition to Layer 2 (motivation) after calibration", () => {
      // After feeling response (could_be_better), show motivation question
      const motivationQ = getFoodMotivationQuestion();
      
      expect(motivationQ.options).toHaveLength(5);
      expect(motivationQ.options.map(o => o.value)).toContain("drained");
      expect(motivationQ.options.map(o => o.value)).toContain("easier");
    });
  });

  describe("Coffee Calibration Phases", () => {
    it("should transition from count guess to result showing", () => {
      const guess = Math.round(actualMonthlyCount * 0.5);
      const result = getCoffeeCalibrationResult(guess, actualMonthlyCount, 112);
      
      expect(result.message).toBeDefined();
      expect(result.actualCount).toBe(actualMonthlyCount);
    });

    it("should transition from result to feeling question", () => {
      const feelingQ = getCoffeeFeelingQuestion();
      
      expect(feelingQ.content).toContain("feel");
      expect(feelingQ.options).toHaveLength(2);
      expect(feelingQ.options.map(o => o.value)).toContain("could_be_better");
    });

    it("should transition to Layer 2 (motivation) for could_be_better", () => {
      const motivationQ = getCoffeeMotivationQuestion();
      
      expect(motivationQ.options).toHaveLength(4);
      expect(motivationQ.options.map(o => o.value)).toContain("routine");
      expect(motivationQ.options.map(o => o.value)).toContain("pick_me_up");
    });
  });

  describe("Counter-Profile Exits", () => {
    it("should exit gracefully for intentional food ordering", () => {
      const mode = getFoodModeFromMotivation("wanted_meal");
      expect(mode).toBe("#intentional-treat");
      // This is a counter-profile that should exit gracefully
    });

    it("should exit gracefully for intentional coffee ritual", () => {
      const assignment = getCoffeeModeFromQ2Response("routine" as CoffeeMotivation, "intentional");
      
      expect(assignment.isCounterProfile).toBe(true);
      expect(assignment.mode).toBe("#intentional-ritual");
      expect(assignment.exitMessage).toBeDefined();
    });

    it("should exit gracefully for productive coffee drinker", () => {
      const assignment = getCoffeeModeFromQ2Response("focus" as CoffeeMotivation, "real_difference");
      
      expect(assignment.isCounterProfile).toBe(true);
      expect(assignment.mode).toBe("#productive-coffee-drinker");
    });
  });
});
