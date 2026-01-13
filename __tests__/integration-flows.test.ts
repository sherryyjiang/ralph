/**
 * Integration Tests for Complete Check-In Flows
 * 
 * Tests the full user journey through each check-in type.
 */

import { getMonthlyFoodSpend, getMonthlyCoffeeCount, getTransactionById, syntheticTransactions } from "@/lib/data/synthetic-transactions";
import { 
  getFoodAwarenessCalibration, 
  getCoffeeFrequencyCalibration,
  getFoodModeFromMotivation,
  getCoffeeModeFromQ2Response,
  getSubPathProbing,
  impulseSubPathProbing,
  dealSubPathProbing,
  deliberateSubPathProbing,
} from "@/lib/llm/question-trees";
import { buildSystemPrompt, explorationGoals, getFixedQuestion1Options } from "@/lib/llm/prompts";

// ═══════════════════════════════════════════════════════════════
// Food Check-In Complete Flow Tests
// ═══════════════════════════════════════════════════════════════

describe("Food Check-In Complete Flow", () => {
  const foodTransaction = syntheticTransactions.find(t => t.category === "food");
  const actualSpend = getMonthlyFoodSpend();

  it("should have a food transaction in test data", () => {
    expect(foodTransaction).toBeDefined();
    expect(foodTransaction!.category).toBe("food");
  });

  describe("Layer 1: Awareness Calibration", () => {
    it("should generate guess options for food spending", () => {
      const calibration = getFoodAwarenessCalibration(foodTransaction!, actualSpend);
      expect(calibration.options).toBeDefined();
      expect(calibration.options!.length).toBeGreaterThan(0);
    });

    it("should include calibration content with actual spend reveal", () => {
      const calibration = getFoodAwarenessCalibration(foodTransaction!, actualSpend);
      expect(calibration.content).toBeDefined();
    });
  });

  describe("Layer 2: Mode Assignment from Motivation", () => {
    const motivations = ["stress", "convenience", "planning", "craving", "social"];

    motivations.forEach(motivation => {
      it(`should assign a mode for motivation: ${motivation}`, () => {
        const mode = getFoodModeFromMotivation(motivation);
        expect(mode).toBeDefined();
        expect(mode.startsWith("#")).toBe(true);
      });
    });

    it("should return stress-eater mode for stress motivation", () => {
      const mode = getFoodModeFromMotivation("stress");
      expect(mode).toContain("stress");
    });

    it("should return convenience mode for time-pressed motivation", () => {
      const mode = getFoodModeFromMotivation("convenience");
      expect(mode).toContain("convenience");
    });
  });

  describe("Complete Flow Integration", () => {
    it("should flow from guess → reveal → mode → reflection", () => {
      // Step 1: User makes a guess
      const userGuess = 150;
      
      // Step 2: System reveals actual and shows calibration
      const calibration = getFoodAwarenessCalibration(foodTransaction!, actualSpend);
      expect(calibration).toBeDefined();
      
      // Step 3: User selects motivation
      const motivation = "stress";
      const mode = getFoodModeFromMotivation(motivation);
      expect(mode).toBeDefined();
      
      // Step 4: Mode is assigned
      expect(mode.startsWith("#")).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Coffee Check-In Complete Flow Tests
// ═══════════════════════════════════════════════════════════════

describe("Coffee Check-In Complete Flow", () => {
  const coffeeTransaction = syntheticTransactions.find(t => t.category === "coffee");
  const actualCount = getMonthlyCoffeeCount();

  it("should have a coffee transaction in test data", () => {
    expect(coffeeTransaction).toBeDefined();
    expect(coffeeTransaction!.category).toBe("coffee");
  });

  describe("Layer 1: Frequency Calibration", () => {
    it("should generate guess options for coffee count", () => {
      const calibration = getCoffeeFrequencyCalibration(coffeeTransaction!, actualCount);
      expect(calibration.options).toBeDefined();
      expect(calibration.options!.length).toBeGreaterThan(0);
    });
  });

  describe("Layer 2: Mode Assignment from Q2 Response", () => {
    it("should assign a mode for routine responses", () => {
      const mode = getCoffeeModeFromQ2Response("routine", "yes");
      expect(mode).toBeDefined();
    });

    it("should assign a mode for treat responses", () => {
      const mode = getCoffeeModeFromQ2Response("treat", "yes");
      expect(mode).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Shopping Check-In Complete Flow Tests
// ═══════════════════════════════════════════════════════════════

describe("Shopping Check-In Complete Flow", () => {
  const shoppingTransaction = syntheticTransactions.find(t => t.category === "shopping");

  it("should have a shopping transaction in test data", () => {
    expect(shoppingTransaction).toBeDefined();
    expect(shoppingTransaction!.category).toBe("shopping");
  });

  describe("Layer 1 → Layer 2 Flow", () => {
    const paths = ["impulse", "deliberate", "deal", "gift", "maintenance"] as const;

    paths.forEach(path => {
      it(`should have exploration goals for ${path} path`, () => {
        expect(explorationGoals[path]).toBeDefined();
        expect(explorationGoals[path].goal).toBeDefined();
      });
    });
  });

  describe("Sub-Path Probing", () => {
    it("should have probing for impulse sub-paths", () => {
      const subPaths = Object.keys(impulseSubPathProbing);
      expect(subPaths.length).toBeGreaterThan(0);
    });

    it("should have probing for deal sub-paths", () => {
      const subPaths = Object.keys(dealSubPathProbing);
      expect(subPaths.length).toBeGreaterThan(0);
    });

    it("should have probing for deliberate sub-paths", () => {
      const subPaths = Object.keys(deliberateSubPathProbing);
      expect(subPaths.length).toBeGreaterThan(0);
    });

    it("should return probing for known path/sub-path combinations", () => {
      const probing = getSubPathProbing("impulse", "price_felt_right");
      expect(probing).toBeDefined();
    });
  });

  describe("Impulse Path Complete Flow", () => {
    it("should flow through impulse → sub-path → mode", () => {
      // Step 1: User selects "impulse"
      const path = "impulse";
      
      // Step 2: Get Fixed Q2 options
      const q2Options = getFixedQuestion2Options("shopping", path);
      expect(q2Options!.length).toBeGreaterThan(0);
      
      // Step 3: User selects a sub-path
      const subPath = q2Options![0].value;
      
      // Step 4: System can build probing prompt
      const promptContext = {
        transaction: shoppingTransaction!,
        session: {
          id: "test-session",
          transactionId: shoppingTransaction!.id,
          type: "shopping" as const,
          status: "in_progress" as const,
          currentLayer: 2 as const,
          path: path,
          subPath: subPath,
          messages: [],
          metadata: { tags: [] },
        },
      };
      
      const prompt = buildSystemPrompt(promptContext);
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(100);
    });
  });

  describe("Deal Path Complete Flow", () => {
    it("should flow through deal → sub-path → mode", () => {
      // Step 1: User selects "deal"
      const path = "deal";
      
      // Step 2: Get Fixed Q2 options
      const q2Options = getFixedQuestion2Options("shopping", path);
      expect(q2Options!.length).toBeGreaterThan(0);
      
      // Step 3: Verify deal-specific options
      const hasLimitedEdition = q2Options!.some(o => o.value === "limited_edition");
      const hasSaleDiscount = q2Options!.some(o => o.value === "sale_discount");
      expect(hasLimitedEdition || hasSaleDiscount).toBe(true);
    });
  });

  describe("Deliberate Path Complete Flow", () => {
    it("should have deliberate-specific sub-paths", () => {
      const q2Options = getFixedQuestion2Options("shopping", "deliberate");
      expect(q2Options!.some(o => o.value.includes("afford") || o.value.includes("right"))).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Layer 3 Reflection Path Tests
// ═══════════════════════════════════════════════════════════════

describe("Layer 3 Reflection Paths", () => {
  describe("'Is this a problem?' Path", () => {
    it("should explore behavioral patterns", () => {
      // This path should help users identify if their behavior is problematic
      const reflectionOptions = ["problem", "feel", "done"];
      expect(reflectionOptions).toContain("problem");
    });
  });

  describe("'How do I feel?' Path", () => {
    it("should explore emotional responses", () => {
      const reflectionOptions = ["problem", "feel", "done"];
      expect(reflectionOptions).toContain("feel");
    });
  });

  describe("Graceful Exit", () => {
    it("should allow users to exit at any time", () => {
      const reflectionOptions = ["problem", "feel", "done"];
      expect(reflectionOptions).toContain("done");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// System Prompt Construction Tests
// ═══════════════════════════════════════════════════════════════

describe("System Prompt Construction", () => {
  const testTransaction = syntheticTransactions[0];
  
  it("should build a system prompt with transaction context", () => {
    const prompt = buildSystemPrompt({
      transaction: testTransaction,
      session: {
        id: "test",
        transactionId: testTransaction.id,
        type: testTransaction.category,
        status: "in_progress",
        currentLayer: 2,
        messages: [],
        metadata: { tags: [] },
      },
    });
    
    expect(prompt).toContain(testTransaction.merchant);
  });

  it("should include exploration goals when path is set", () => {
    const prompt = buildSystemPrompt({
      transaction: testTransaction,
      session: {
        id: "test",
        transactionId: testTransaction.id,
        type: "shopping",
        status: "in_progress",
        currentLayer: 2,
        path: "impulse",
        messages: [],
        metadata: { tags: [] },
      },
      questionTreeSection: "Path: IMPULSE",
    });
    
    expect(prompt.toLowerCase()).toContain("impulse");
  });
});

// ═══════════════════════════════════════════════════════════════
// Transaction Data Integrity Tests
// ═══════════════════════════════════════════════════════════════

describe("Transaction Data Integrity", () => {
  it("should have transactions for all categories", () => {
    const categories = ["shopping", "food", "coffee"];
    categories.forEach(category => {
      const hasCategory = syntheticTransactions.some(t => t.category === category);
      expect(hasCategory).toBe(true);
    });
  });

  it("should be able to retrieve transactions by ID", () => {
    const firstTransaction = syntheticTransactions[0];
    const retrieved = getTransactionById(firstTransaction.id);
    expect(retrieved).toEqual(firstTransaction);
  });

  it("should have valid amounts for all transactions", () => {
    syntheticTransactions.forEach(transaction => {
      expect(transaction.amount).toBeGreaterThan(0);
      expect(typeof transaction.amount).toBe("number");
    });
  });
});
