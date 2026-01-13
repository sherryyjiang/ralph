/**
 * Shopping Check-In Flow Tests
 * 
 * Tests for Layer 1 fixed questions, path routing, and mode assignment logic.
 */

import { getFixedQuestion1Options, explorationGoals } from "@/lib/llm/prompts";
import { 
  getSubPathExplorationGoal, 
  impulseSubPathGoals, 
  dealSubPathGoals,
  deliberateSubPathGoals,
  modeDefinitions 
} from "@/lib/llm/question-trees";

// ═══════════════════════════════════════════════════════════════
// Fixed Question 1 Tests
// ═══════════════════════════════════════════════════════════════

describe("Shopping Fixed Question 1", () => {
  const options = getFixedQuestion1Options("shopping");

  it("should have exactly 5 path options", () => {
    expect(options).toHaveLength(5);
  });

  it("should include all required paths", () => {
    const values = options.map(o => o.value);
    expect(values).toContain("impulse");
    expect(values).toContain("deliberate");
    expect(values).toContain("deal");
    expect(values).toContain("gift");
    expect(values).toContain("maintenance");
  });

  it("should mark impulse and deal as yellow (less intentional)", () => {
    const impulse = options.find(o => o.value === "impulse");
    const deal = options.find(o => o.value === "deal");
    expect(impulse?.color).toBe("yellow");
    expect(deal?.color).toBe("yellow");
  });

  it("should mark deliberate, gift, maintenance as white (more intentional)", () => {
    const deliberate = options.find(o => o.value === "deliberate");
    const gift = options.find(o => o.value === "gift");
    const maintenance = options.find(o => o.value === "maintenance");
    // White is default, so might be undefined or "white"
    expect(deliberate?.color).not.toBe("yellow");
    expect(gift?.color).not.toBe("yellow");
    expect(maintenance?.color).not.toBe("yellow");
  });

  it("should have emojis for all options", () => {
    options.forEach(option => {
      expect(option.emoji).toBeDefined();
      expect(option.emoji?.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Exploration Goals Tests
// ═══════════════════════════════════════════════════════════════

describe("Exploration Goals", () => {
  it("should have goals for all shopping paths", () => {
    expect(explorationGoals.impulse).toBeDefined();
    expect(explorationGoals.deliberate).toBeDefined();
    expect(explorationGoals.deal).toBeDefined();
    expect(explorationGoals.gift).toBeDefined();
    expect(explorationGoals.maintenance).toBeDefined();
  });

  describe("Impulse Path", () => {
    const impulseGoal = explorationGoals.impulse;

    it("should have a clear exploration goal", () => {
      expect(impulseGoal.goal).toContain("emotional");
    });

    it("should have probing hints", () => {
      expect(impulseGoal.probingHints.length).toBeGreaterThan(0);
    });

    it("should have mode indicators", () => {
      expect(impulseGoal.modeIndicators.length).toBeGreaterThan(0);
    });

    it("should have counter-profile patterns for graceful exit", () => {
      expect(impulseGoal.counterProfilePatterns.length).toBeGreaterThan(0);
    });
  });

  describe("Deal Path", () => {
    const dealGoal = explorationGoals.deal;

    it("should distinguish between genuine value and deal-induced buying", () => {
      expect(dealGoal.goal).toContain("value");
    });

    it("should ask about full price willingness", () => {
      const hints = dealGoal.probingHints.join(" ");
      expect(hints).toContain("full price");
    });
  });

  describe("Deliberate Path", () => {
    const deliberateGoal = explorationGoals.deliberate;

    it("should validate intentionality", () => {
      expect(deliberateGoal.goal).toContain("intentionality");
    });

    it("should have no counter-profiles (already intentional)", () => {
      expect(deliberateGoal.counterProfilePatterns.length).toBe(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Path Routing Tests
// ═══════════════════════════════════════════════════════════════

describe("Path Routing Logic", () => {
  it("should route impulse responses to impulse exploration", () => {
    const path = "impulse";
    expect(explorationGoals[path]).toBeDefined();
    expect(explorationGoals[path].goal).toBeDefined();
  });

  it("should route deal responses to deal exploration", () => {
    const path = "deal";
    expect(explorationGoals[path]).toBeDefined();
    expect(explorationGoals[path].goal).toContain("value");
  });

  it("should route maintenance responses to maintenance exploration", () => {
    const path = "maintenance";
    expect(explorationGoals[path]).toBeDefined();
    expect(explorationGoals[path].goal).toContain("necessity");
  });
});

// ═══════════════════════════════════════════════════════════════
// Mode Indicator Tests
// ═══════════════════════════════════════════════════════════════

describe("Mode Indicators", () => {
  it("should include comfort-driven-spender for impulse path", () => {
    const impulseIndicators = explorationGoals.impulse.modeIndicators.join(" ");
    expect(impulseIndicators).toContain("comfort");
  });

  it("should include deal-hunter for deal path", () => {
    const dealIndicators = explorationGoals.deal.modeIndicators.join(" ");
    expect(dealIndicators).toContain("deal");
  });

  it("should include intentional-planner for deliberate path", () => {
    const deliberateIndicators = explorationGoals.deliberate.modeIndicators.join(" ");
    expect(deliberateIndicators).toContain("intentional");
  });
});

// ═══════════════════════════════════════════════════════════════
// Counter-Profile Detection Tests
// ═══════════════════════════════════════════════════════════════

describe("Counter-Profile Detection", () => {
  it("should detect when impulse buyer was actually intentional", () => {
    const patterns = explorationGoals.impulse.counterProfilePatterns;
    expect(patterns.some(p => p.toLowerCase().includes("list"))).toBe(true);
  });

  it("should detect when deal buyer would have bought anyway", () => {
    const patterns = explorationGoals.deal.counterProfilePatterns;
    expect(patterns.some(p => p.toLowerCase().includes("anyway"))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// Food Check-In Tests (Awareness Calibration)
// ═══════════════════════════════════════════════════════════════

describe("Food Check-In Options", () => {
  const options = getFixedQuestion1Options("food");

  it("should have options for food check-in", () => {
    expect(options.length).toBeGreaterThan(0);
  });

  it("should include guess options for awareness calibration", () => {
    const guess100 = options.find(o => o.value === "100");
    expect(guess100).toBeDefined();
    expect(guess100?.label).toContain("$100");
  });
});

// ═══════════════════════════════════════════════════════════════
// Coffee Check-In Tests (Frequency Calibration)
// ═══════════════════════════════════════════════════════════════

describe("Coffee Check-In Options", () => {
  const options = getFixedQuestion1Options("coffee");

  it("should have options for coffee check-in", () => {
    expect(options.length).toBeGreaterThan(0);
  });

  it("should include guess options for frequency calibration", () => {
    const guess5 = options.find(o => o.value === "5");
    expect(guess5).toBeDefined();
    expect(guess5?.label).toContain("5");
  });
});

// ═══════════════════════════════════════════════════════════════
// Sub-Path Exploration Goal Tests (Layer 2 Probing)
// ═══════════════════════════════════════════════════════════════

describe("Impulse Sub-Path Exploration Goals", () => {
  it("should have exploration goals for all impulse sub-paths", () => {
    expect(impulseSubPathGoals.price_felt_right).toBeDefined();
    expect(impulseSubPathGoals.treating_myself).toBeDefined();
    expect(impulseSubPathGoals.caught_eye).toBeDefined();
    expect(impulseSubPathGoals.trending).toBeDefined();
  });

  it("price_felt_right should target intuitive-threshold-spender mode", () => {
    const goal = impulseSubPathGoals.price_felt_right;
    expect(goal.mode).toBe("#intuitive-threshold-spender");
  });

  it("treating_myself should branch to multiple possible modes", () => {
    const goal = impulseSubPathGoals.treating_myself;
    expect(goal.possibleModes).toBeDefined();
    expect(goal.possibleModes?.length).toBe(3);
    expect(goal.possibleModes).toContain("#reward-driven-spender");
    expect(goal.possibleModes).toContain("#comfort-driven-spender");
    expect(goal.possibleModes).toContain("#routine-treat-spender");
  });

  it("caught_eye should have probing hints about where item was seen", () => {
    const goal = impulseSubPathGoals.caught_eye;
    const hints = goal.probingHints.join(" ");
    expect(hints).toContain("Where did you see it");
  });

  it("trending should explore trend susceptibility", () => {
    const goal = impulseSubPathGoals.trending;
    expect(goal.explorationGoal).toContain("susceptible");
  });
});

describe("Deal Sub-Path Exploration Goals", () => {
  it("should have exploration goals for all deal sub-paths", () => {
    expect(dealSubPathGoals.limited_edition).toBeDefined();
    expect(dealSubPathGoals.sale_discount).toBeDefined();
    expect(dealSubPathGoals.free_shipping).toBeDefined();
  });

  it("limited_edition should explore FOMO susceptibility", () => {
    const goal = dealSubPathGoals.limited_edition;
    expect(goal.explorationGoal).toContain("FOMO");
    expect(goal.mode).toBe("#scarcity-driven");
  });

  it("sale_discount should ask about full price buying", () => {
    const goal = dealSubPathGoals.sale_discount;
    const hints = goal.probingHints.join(" ");
    expect(hints).toContain("full price");
  });

  it("free_shipping should explore threshold spending patterns", () => {
    const goal = dealSubPathGoals.free_shipping;
    expect(goal.explorationGoal).toContain("threshold");
    expect(goal.mode).toBe("#threshold-spending-driven");
  });
});

describe("Deliberate Sub-Path Exploration Goals", () => {
  it("should have exploration goals for all deliberate sub-paths", () => {
    expect(deliberateSubPathGoals.afford_it).toBeDefined();
    expect(deliberateSubPathGoals.right_price).toBeDefined();
    expect(deliberateSubPathGoals.right_one).toBeDefined();
    expect(deliberateSubPathGoals.still_wanted).toBeDefined();
    expect(deliberateSubPathGoals.got_around).toBeDefined();
  });

  it("right_one should target deliberate-researcher mode", () => {
    const goal = deliberateSubPathGoals.right_one;
    expect(goal.mode).toBe("#deliberate-researcher");
  });

  it("still_wanted should validate intentional pause", () => {
    const goal = deliberateSubPathGoals.still_wanted;
    expect(goal.explorationGoal).toContain("pause");
    expect(goal.mode).toBe("#deliberate-pause-tester");
  });
});

describe("getSubPathExplorationGoal helper", () => {
  it("should return impulse sub-path goals for impulse path", () => {
    const goal = getSubPathExplorationGoal("impulse", "price_felt_right");
    expect(goal).toBeDefined();
    expect(goal?.mode).toBe("#intuitive-threshold-spender");
  });

  it("should return deal sub-path goals for deal path", () => {
    const goal = getSubPathExplorationGoal("deal", "limited_edition");
    expect(goal).toBeDefined();
    expect(goal?.mode).toBe("#scarcity-driven");
  });

  it("should return deliberate sub-path goals for deliberate path", () => {
    const goal = getSubPathExplorationGoal("deliberate", "right_one");
    expect(goal).toBeDefined();
    expect(goal?.mode).toBe("#deliberate-researcher");
  });

  it("should return undefined for unknown paths", () => {
    const goal = getSubPathExplorationGoal("unknown", "test");
    expect(goal).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// Right_One Path Probing Adherence Tests
// ═══════════════════════════════════════════════════════════════

describe("right_one Path Probing Adherence", () => {
  it("should have correct probing hints for right_one path", () => {
    const goal = getSubPathExplorationGoal("deliberate", "right_one");
    expect(goal).toBeDefined();
    
    const expectedHints = [
      "Where did you go for your research",
      "Where did you end up finding it",
      "How long did you spend looking",
    ];
    
    // Each expected hint should be present in the probing hints
    expectedHints.forEach(hint => {
      const found = goal?.probingHints.some(h => 
        h.toLowerCase().includes(hint.toLowerCase())
      );
      expect(found).toBe(true);
    });
  });

  it("should target #deliberate-researcher mode for right_one", () => {
    const goal = getSubPathExplorationGoal("deliberate", "right_one");
    expect(goal?.mode).toBe("#deliberate-researcher");
  });

  it("should have exploration goal about research process", () => {
    const goal = getSubPathExplorationGoal("deliberate", "right_one");
    expect(goal?.explorationGoal.toLowerCase()).toContain("research");
  });

  it("should have at least 3 probing hints for thorough exploration", () => {
    const goal = getSubPathExplorationGoal("deliberate", "right_one");
    expect(goal?.probingHints.length).toBeGreaterThanOrEqual(3);
  });
});

// ═══════════════════════════════════════════════════════════════
// Mode Definition Tests
// ═══════════════════════════════════════════════════════════════

describe("Mode Definitions", () => {
  it("should have definitions for all impulse modes", () => {
    expect(modeDefinitions["#intuitive-threshold-spender"]).toBeDefined();
    expect(modeDefinitions["#reward-driven-spender"]).toBeDefined();
    expect(modeDefinitions["#comfort-driven-spender"]).toBeDefined();
    expect(modeDefinitions["#routine-treat-spender"]).toBeDefined();
    expect(modeDefinitions["#visual-impulse-driven"]).toBeDefined();
    expect(modeDefinitions["#trend-susceptibility-driven"]).toBeDefined();
  });

  it("should have definitions for deal modes", () => {
    expect(modeDefinitions["#scarcity-driven"]).toBeDefined();
    expect(modeDefinitions["#deal-driven"]).toBeDefined();
    expect(modeDefinitions["#threshold-spending-driven"]).toBeDefined();
  });

  it("should have reflection guidance for each mode", () => {
    Object.values(modeDefinitions).forEach(mode => {
      expect(mode.reflectionGuidance).toBeDefined();
      expect(mode.reflectionGuidance.length).toBeGreaterThan(10);
    });
  });

  it("should have key indicators for each mode", () => {
    Object.values(modeDefinitions).forEach(mode => {
      expect(mode.indicators).toBeDefined();
      expect(mode.indicators.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Probing Adherence Tests (right_one path specifically)
// ═══════════════════════════════════════════════════════════════

describe("LLM Probing Adherence - right_one path", () => {
  it("right_one path should have specific probing questions", () => {
    const subPathProbing = getSubPathProbing("deliberate", "right_one");
    expect(subPathProbing).toBeDefined();
    expect(subPathProbing?.probingHints).toBeDefined();
    expect(subPathProbing?.probingHints.length).toBeGreaterThan(0);
  });

  it("right_one probing hints should include research-related questions", () => {
    const subPathProbing = getSubPathProbing("deliberate", "right_one");
    const hints = subPathProbing?.probingHints || [];
    
    // Check for the expected specific questions per LLM_PROBING_ADHERENCE.md
    const expectedPatterns = [
      /research/i,
      /finding it/i,
      /spend.*looking/i,
    ];
    
    const matchesAtLeastOne = expectedPatterns.some(pattern => 
      hints.some(hint => pattern.test(hint))
    );
    
    expect(matchesAtLeastOne).toBe(true);
  });

  it("right_one should NOT use generic questions", () => {
    const subPathProbing = getSubPathProbing("deliberate", "right_one");
    const hints = subPathProbing?.probingHints || [];
    
    // These generic questions should NOT be in the probing hints
    const genericPatterns = [
      /what made you decide/i,
      /can you tell me more/i,
      /what factors did you consider/i,
      /could you elaborate/i,
    ];
    
    hints.forEach(hint => {
      genericPatterns.forEach(pattern => {
        expect(pattern.test(hint)).toBe(false);
      });
    });
  });

  it("right_one should target #deliberate-researcher mode", () => {
    const subPathProbing = getSubPathProbing("deliberate", "right_one");
    expect(subPathProbing?.targetModes).toContain("#deliberate-researcher");
  });

  it("right_one should have mode signals for research behavior", () => {
    const subPathProbing = getSubPathProbing("deliberate", "right_one");
    const modeSignals = subPathProbing?.modeSignals || {};
    
    // Should have signals for the target mode
    expect(modeSignals["#deliberate-researcher"]).toBeDefined();
    expect(modeSignals["#deliberate-researcher"]?.length).toBeGreaterThan(0);
  });
});
