/**
 * Mode Detection Accuracy Tests
 * 
 * Tests for verifying that mode indicators correctly map to spending modes.
 */

import { explorationGoals } from "@/lib/llm/prompts";
import { 
  shoppingExplorationGoals, 
  impulseSubPathProbing, 
  dealSubPathProbing,
  deliberateSubPathProbing,
  modeDefinitions,
  getSubPathProbing,
} from "@/lib/llm/question-trees";

// ═══════════════════════════════════════════════════════════════
// Mode Indicator Accuracy Tests
// ═══════════════════════════════════════════════════════════════

describe("Mode Indicator Accuracy", () => {
  describe("Impulse Path Mode Indicators", () => {
    const impulseGoals = shoppingExplorationGoals.impulse;

    it("should correctly identify comfort-driven-spender indicators", () => {
      const indicators = impulseGoals.modeIndicators["#comfort-driven-spender"];
      expect(indicators).toBeDefined();
      expect(indicators).toContain("mentions stress, bad day, needing a treat");
      expect(indicators).toContain("links purchase to emotional state");
    });

    it("should correctly identify novelty-seeker indicators", () => {
      const indicators = impulseGoals.modeIndicators["#novelty-seeker"];
      expect(indicators).toBeDefined();
      expect(indicators).toContain("excited by new things, trends");
      expect(indicators).toContain("mentions fear of missing out");
    });

    it("should correctly identify social-spender indicators", () => {
      const indicators = impulseGoals.modeIndicators["#social-spender"];
      expect(indicators).toBeDefined();
      expect(indicators).toContain("influenced by friends, social media");
    });
  });

  describe("Deal Path Mode Indicators", () => {
    const dealGoals = shoppingExplorationGoals.deal;

    it("should correctly identify deal-hunter indicators", () => {
      const indicators = dealGoals.modeIndicators["#deal-hunter"];
      expect(indicators).toBeDefined();
      expect(indicators).toContain("actively seeks discounts");
    });

    it("should correctly identify scarcity-susceptible indicators", () => {
      const indicators = dealGoals.modeIndicators["#scarcity-susceptible"];
      expect(indicators).toBeDefined();
      expect(indicators).toContain("responds to limited time/quantity");
    });
  });

  describe("Deliberate Path Mode Indicators", () => {
    const deliberateGoals = shoppingExplorationGoals.deliberate;

    it("should correctly identify intentional-planner indicators", () => {
      const indicators = deliberateGoals.modeIndicators["#intentional-planner"];
      expect(indicators).toBeDefined();
      expect(indicators).toContain("researched options");
    });

    it("should correctly identify quality-seeker indicators", () => {
      const indicators = deliberateGoals.modeIndicators["#quality-seeker"];
      expect(indicators).toBeDefined();
      expect(indicators).toContain("focused on durability, longevity");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Sub-Path Mode Signal Tests
// ═══════════════════════════════════════════════════════════════

describe("Sub-Path Mode Signals", () => {
  describe("Impulse Sub-Path Signals", () => {
    it("price_felt_right should signal intuitive-threshold-spender", () => {
      const probing = impulseSubPathProbing.price_felt_right;
      expect(probing.targetModes).toContain("#intuitive-threshold-spender");
      expect(probing.modeSignals["#intuitive-threshold-spender"]).toContain("the price felt right");
    });

    it("treating_myself should signal multiple reward modes", () => {
      const probing = impulseSubPathProbing.treating_myself;
      expect(probing.targetModes).toContain("#reward-driven-spender");
      expect(probing.targetModes).toContain("#comfort-driven-spender");
      expect(probing.targetModes).toContain("#routine-treat-spender");
    });

    it("caught_eye should signal visual and scroll triggers", () => {
      const probing = impulseSubPathProbing.caught_eye;
      expect(probing.targetModes).toContain("#scroll-triggered");
      expect(probing.targetModes).toContain("#in-store-wanderer");
      expect(probing.targetModes).toContain("#aesthetic-driven");
    });

    it("trending should signal social influence modes", () => {
      const probing = impulseSubPathProbing.trending;
      expect(probing.targetModes).toContain("#trend-susceptibility-driven");
      expect(probing.targetModes).toContain("#social-media-influenced");
    });
  });

  describe("Deal Sub-Path Signals", () => {
    it("limited_edition should signal scarcity-driven", () => {
      const probing = dealSubPathProbing.limited_edition;
      expect(probing.targetModes).toContain("#scarcity-driven");
      expect(probing.modeSignals["#scarcity-driven"]).toContain("didn't want to miss it");
    });

    it("sale_discount should signal deal-driven", () => {
      const probing = dealSubPathProbing.sale_discount;
      expect(probing.targetModes).toContain("#deal-driven");
      expect(probing.modeSignals["#deal-driven"]).toContain("couldn't pass up the deal");
    });

    it("free_shipping should signal threshold-spending-driven", () => {
      const probing = dealSubPathProbing.free_shipping;
      expect(probing.targetModes).toContain("#threshold-spending-driven");
    });
  });

  describe("Deliberate Sub-Path Signals", () => {
    it("afford_it should signal deliberate-budget-saver", () => {
      const probing = deliberateSubPathProbing.afford_it;
      expect(probing.targetModes).toContain("#deliberate-budget-saver");
    });

    it("right_price should signal deliberate-deal-hunter", () => {
      const probing = deliberateSubPathProbing.right_price;
      expect(probing.targetModes).toContain("#deliberate-deal-hunter");
    });

    it("right_one should signal deliberate-researcher", () => {
      const probing = deliberateSubPathProbing.right_one;
      expect(probing.targetModes).toContain("#deliberate-researcher");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Counter-Profile Detection Tests
// ═══════════════════════════════════════════════════════════════

describe("Counter-Profile Detection Accuracy", () => {
  describe("Impulse Counter-Profiles", () => {
    const patterns = shoppingExplorationGoals.impulse.counterProfilePatterns;

    it("should detect planned behavior in impulse path", () => {
      expect(patterns).toContain("Actually had this on my list for a while");
      expect(patterns).toContain("I specifically went there for this");
    });

    it("should detect research behavior in impulse path", () => {
      expect(patterns).toContain("It's something I've been researching");
    });
  });

  describe("Deal Counter-Profiles", () => {
    const patterns = shoppingExplorationGoals.deal.counterProfilePatterns;

    it("should detect true value-seeking (would buy anyway)", () => {
      expect(patterns).toContain("I was already planning to buy this");
      expect(patterns).toContain("I would have bought it anyway");
    });
  });

  describe("Trending Sub-Path Counter-Profile", () => {
    const probing = impulseSubPathProbing.trending;

    it("should have counter-profile exit for authentic style", () => {
      expect(probing.counterProfileExit).toContain("it's me");
    });
  });

  describe("Sale Sub-Path Counter-Profile", () => {
    const probing = dealSubPathProbing.sale_discount;

    it("should have counter-profile exit for intentional deal-hunting", () => {
      expect(probing.counterProfileExit).toContain("full price");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Mode Definition Completeness Tests
// ═══════════════════════════════════════════════════════════════

describe("Mode Definition Completeness", () => {
  it("should have definitions for all core shopping modes", () => {
    const coreModes = [
      "#comfort-driven-spender",
      "#novelty-seeker",
      "#deal-hunter",
    ];

    coreModes.forEach(mode => {
      expect(modeDefinitions[mode]).toBeDefined();
      expect(modeDefinitions[mode].name).toBeDefined();
      expect(modeDefinitions[mode].description).toBeDefined();
      expect(modeDefinitions[mode].indicators.length).toBeGreaterThan(0);
      expect(modeDefinitions[mode].reflectionGuidance).toBeDefined();
    });
  });

  it("should have meaningful reflection guidance for each mode", () => {
    Object.values(modeDefinitions).forEach(mode => {
      expect(mode.reflectionGuidance.length).toBeGreaterThan(20);
      // Guidance should not be generic
      expect(mode.reflectionGuidance).not.toBe("No guidance");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// getSubPathProbing Helper Tests
// ═══════════════════════════════════════════════════════════════

describe("getSubPathProbing Helper", () => {
  it("should return correct probing for impulse sub-paths", () => {
    expect(getSubPathProbing("impulse", "price_felt_right")).toBeDefined();
    expect(getSubPathProbing("impulse", "treating_myself")).toBeDefined();
    expect(getSubPathProbing("impulse", "caught_eye")).toBeDefined();
    expect(getSubPathProbing("impulse", "trending")).toBeDefined();
  });

  it("should return correct probing for deal sub-paths", () => {
    expect(getSubPathProbing("deal", "limited_edition")).toBeDefined();
    expect(getSubPathProbing("deal", "sale_discount")).toBeDefined();
    expect(getSubPathProbing("deal", "free_shipping")).toBeDefined();
  });

  it("should return correct probing for deliberate sub-paths", () => {
    expect(getSubPathProbing("deliberate", "afford_it")).toBeDefined();
    expect(getSubPathProbing("deliberate", "right_price")).toBeDefined();
    expect(getSubPathProbing("deliberate", "right_one")).toBeDefined();
    expect(getSubPathProbing("deliberate", "still_wanted")).toBeDefined();
    expect(getSubPathProbing("deliberate", "got_around")).toBeDefined();
  });

  it("should return undefined for unknown combinations", () => {
    expect(getSubPathProbing("unknown", "test")).toBeUndefined();
    expect(getSubPathProbing("impulse", "unknown")).toBeUndefined();
  });

  it("should mark deliberate paths as light probing", () => {
    const deliberateProbing = getSubPathProbing("deliberate", "right_one");
    expect(deliberateProbing?.lightProbing).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// Probing Hints Quality Tests
// ═══════════════════════════════════════════════════════════════

describe("Probing Hints Quality", () => {
  it("should have actionable probing hints for all impulse sub-paths", () => {
    Object.values(impulseSubPathProbing).forEach(probing => {
      expect(probing.probingHints.length).toBeGreaterThan(0);
      probing.probingHints.forEach(hint => {
        // Hints should be questions
        expect(hint).toMatch(/\?$/);
      });
    });
  });

  it("should have exploration goals aligned with probing hints", () => {
    Object.values(impulseSubPathProbing).forEach(probing => {
      expect(probing.explorationGoal.length).toBeGreaterThan(10);
    });
  });
});
