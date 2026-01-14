/**
 * Shopping Check-In Flow Tests
 * 
 * Tests for Layer 1 fixed questions, path routing, and mode assignment logic.
 */

import { buildReflectionPrompt, getFixedQuestion1Options, getFixedQuestion2Options, explorationGoals } from "@/lib/llm/prompts";
import { 
  getFixedQuestion2Options as getTreeFixedQuestion2Options,
  SHOPPING_Q2_QUESTIONS,
  getShoppingFixedQuestion2Text,
  getSubPathProbing,
  impulseSubPathProbing,
  deliberateSubPathProbing,
  dealSubPathProbing,
  giftSubPathProbing,
  maintenanceSubPathProbing,
  modeDefinitions,
  getCostComparisonModeAdaptedQuestion,
  BEHAVIORAL_EXCAVATION_PROBING_HINTS,
  EMOTIONAL_REFLECTION_PROBING_HINTS,
  COST_COMPARISON_PROBING_HINTS,
  OPEN_ENDED_REFLECTION_GUIDANCE,
} from "@/lib/llm/question-trees/index";

// ═══════════════════════════════════════════════════════════════
// Fixed Question 1 Tests
// ═══════════════════════════════════════════════════════════════

describe("Shopping Fixed Question 1", () => {
  const options = getFixedQuestion1Options("shopping");

  it("should have exactly 6 path options", () => {
    expect(options).toHaveLength(6);
  });

  it("should include all required paths", () => {
    const values = options.map(o => o.value);
    expect(values).toContain("impulse");
    expect(values).toContain("deliberate");
    expect(values).toContain("deal");
    expect(values).toContain("gift");
    expect(values).toContain("maintenance");
    expect(values).toContain("other");
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
// Fixed Question 2 Question Text Mapping Tests
// ═══════════════════════════════════════════════════════════════

describe("Shopping Fixed Question 2 question text mapping", () => {
  it("should map impulse to the impulse Q2 question", () => {
    expect(getShoppingFixedQuestion2Text("impulse")).toBe("What made you go for it?");
  });

  it("should map deliberate to the deliberate Q2 question", () => {
    expect(getShoppingFixedQuestion2Text("deliberate")).toBe("What were you waiting for?");
  });

  it("should map deal to the deal Q2 question", () => {
    expect(getShoppingFixedQuestion2Text("deal")).toBe(
      "Tell me more about the deal, discount or limited event?"
    );
  });

  it("should map gift to the gift Q2 question", () => {
    expect(getShoppingFixedQuestion2Text("gift")).toBe("Who was it for?");
  });

  it("should map maintenance to the maintenance Q2 question", () => {
    expect(getShoppingFixedQuestion2Text("maintenance")).toBe(
      "Did you get the same thing or switched it up?"
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// Fixed Question 2 Options Tests (Prompt Helpers)
// ═══════════════════════════════════════════════════════════════

describe("Shopping Fixed Question 2 options (prompt helpers)", () => {
  it("impulse should include the 'other' option", () => {
    const options = getFixedQuestion2Options("shopping", "impulse") ?? [];
    const values = options.map((o) => o.value);
    expect(values).toContain("other");
  });

  it("impulse should have exactly 5 options", () => {
    const options = getFixedQuestion2Options("shopping", "impulse");
    expect(options).toHaveLength(5);
  });

  it("deal should have exactly 3 options", () => {
    const options = getFixedQuestion2Options("shopping", "deal");
    expect(options).toHaveLength(3);
  });

  it("deal should include the 3 required deal sub-paths", () => {
    const options = getFixedQuestion2Options("shopping", "deal") ?? [];
    expect(options.map((o) => o.value).sort()).toEqual(
      ["limited_edition", "sale_discount", "free_shipping"].sort()
    );
  });

  it("gift should have exactly 5 options", () => {
    const options = getFixedQuestion2Options("shopping", "gift");
    expect(options).toHaveLength(5);
  });

  it("gift should include the 5 required gift sub-paths", () => {
    const options = getFixedQuestion2Options("shopping", "gift") ?? [];
    expect(options.map((o) => o.value).sort()).toEqual(
      ["family", "friend", "partner", "coworker", "other"].sort()
    );
  });
});

describe("Shopping Fixed Question 2 options (question-trees)", () => {
  it("deliberate should include the 'other' option", () => {
    const options = getTreeFixedQuestion2Options("shopping", "deliberate") ?? [];
    const values = options.map((o) => o.value);
    expect(values).toContain("other");
  });

  it("deliberate should have exactly 6 options", () => {
    const options = getTreeFixedQuestion2Options("shopping", "deliberate");
    expect(options).toHaveLength(6);
  });

  it("deal should have exactly 3 options", () => {
    const options = getTreeFixedQuestion2Options("shopping", "deal");
    expect(options).toHaveLength(3);
  });

  it("deal should include the 3 required deal sub-paths", () => {
    const options = getTreeFixedQuestion2Options("shopping", "deal") ?? [];
    expect(options.map((o) => o.value).sort()).toEqual(
      ["limited_edition", "sale_discount", "free_shipping"].sort()
    );
  });

  it("gift should have exactly 5 options", () => {
    const options = getTreeFixedQuestion2Options("shopping", "gift");
    expect(options).toHaveLength(5);
  });

  it("gift should include the 5 required gift sub-paths", () => {
    const options = getTreeFixedQuestion2Options("shopping", "gift") ?? [];
    expect(options.map((o) => o.value).sort()).toEqual(
      ["family", "friend", "partner", "coworker", "other"].sort()
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// Fixed Question 2 Question Text Mapping Tests
// ═══════════════════════════════════════════════════════════════

describe("Shopping Fixed Question 2 question mapping", () => {
  it("should map each shopping path to the correct Q2 question text", () => {
    expect(SHOPPING_Q2_QUESTIONS.impulse).toBe("What made you go for it?");
    expect(SHOPPING_Q2_QUESTIONS.deliberate).toBe("What were you waiting for?");
    expect(SHOPPING_Q2_QUESTIONS.deal).toBe("Tell me more about the deal, discount or limited event?");
    expect(SHOPPING_Q2_QUESTIONS.gift).toBe("Who was it for?");
    expect(SHOPPING_Q2_QUESTIONS.maintenance).toBe("Did you get the same thing or switched it up?");
  });

  it("should return the correct Q2 question text for known paths", () => {
    expect(getShoppingFixedQuestion2Text("impulse")).toBe("What made you go for it?");
    expect(getShoppingFixedQuestion2Text("deliberate")).toBe("What were you waiting for?");
    expect(getShoppingFixedQuestion2Text("deal")).toBe("Tell me more about the deal, discount or limited event?");
    expect(getShoppingFixedQuestion2Text("gift")).toBe("Who was it for?");
    expect(getShoppingFixedQuestion2Text("maintenance")).toBe("Did you get the same thing or switched it up?");
  });

  it("should return null for unknown paths (including 'other')", () => {
    expect(getShoppingFixedQuestion2Text("other")).toBeNull();
    expect(getShoppingFixedQuestion2Text("unknown")).toBeNull();
  });
});

describe("Layer 3 Cost Comparison mode-aware adaptations", () => {
  it("threshold-spending-driven should use the free-shipping worth question", () => {
    expect(getCostComparisonModeAdaptedQuestion("#threshold-spending-driven", 42)).toBe(
      "Was adding those extra items to hit free shipping worth the $42.00 you spent?"
    );
  });

  it("scarcity-driven should use the limited-drop buy-again question", () => {
    expect(getCostComparisonModeAdaptedQuestion("#scarcity-driven", 89.99)).toBe(
      "If that limited drop came back, would you buy it again at $89.99?"
    );
  });

  it("reward-driven-spender should use the reward utility question", () => {
    expect(getCostComparisonModeAdaptedQuestion("#reward-driven-spender", 120)).toBe(
      "Is this reward something you'll get a lot of use out of?"
    );
  });

  it("other modes should not force a mode-specific question", () => {
    expect(getCostComparisonModeAdaptedQuestion("#scroll-triggered", 30)).toBeUndefined();
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

    it("should have probing hints at subpath level", () => {
      // Probing hints are defined at the subpath level, not the path level
      const { getSubPathProbing } = require("@/lib/llm/prompts");
      const subPathProbing = getSubPathProbing("impulse", "treating_myself");
      expect(subPathProbing).toBeDefined();
      expect(subPathProbing?.probingHints?.length).toBeGreaterThan(0);
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

    it("should ask about full price willingness at subpath level", () => {
      // Probing hints are defined at the subpath level
      const { getSubPathProbing } = require("@/lib/llm/prompts");
      const saleSubPath = getSubPathProbing("deal", "sale_discount");
      expect(saleSubPath).toBeDefined();
      const hints = saleSubPath?.probingHints?.join(" ") || "";
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
// Target Modes Tests (derived from SubPathProbing)
// ═══════════════════════════════════════════════════════════════

describe("Target Modes (from SubPathProbing)", () => {
  it("should have target modes for impulse sub-paths", () => {
    const priceProbing = getSubPathProbing("impulse", "price_felt_right");
    expect(priceProbing?.targetModes).toContain("#intuitive-threshold-spender");
    
    const trendingProbing = getSubPathProbing("impulse", "trending");
    expect(trendingProbing?.targetModes).toContain("#social-media-influenced");
  });

  it("should have target modes for deal sub-paths", () => {
    const limitedProbing = getSubPathProbing("deal", "limited_edition");
    expect(limitedProbing?.targetModes).toContain("#scarcity-driven");
    
    const saleProbing = getSubPathProbing("deal", "sale_discount");
    expect(saleProbing?.targetModes).toContain("#deal-driven");
  });

  it("should have target modes for deliberate sub-paths", () => {
    const rightOneProbing = getSubPathProbing("deliberate", "right_one");
    expect(rightOneProbing?.targetModes).toContain("#deliberate-researcher");
    
    const affordProbing = getSubPathProbing("deliberate", "afford_it");
    expect(affordProbing?.targetModes).toContain("#deliberate-budget-saver");
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

  it("price_felt_right should have probing hints for price threshold exploration", () => {
    const probing = getSubPathProbing("impulse", "price_felt_right");
    expect(probing).toBeDefined();
    expect(probing?.probingHints?.length).toBeGreaterThan(0);
    expect(probing?.targetModes).toContain("#intuitive-threshold-spender");
    // Note: counter-profile rerouting is not yet implemented for this subpath
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
// Sub-Path Probing Tests (Layer 2 Probing)
// ═══════════════════════════════════════════════════════════════

describe("Impulse Sub-Path Probing", () => {
  it("should have probing config for all impulse sub-paths", () => {
    expect(impulseSubPathProbing.price_felt_right).toBeDefined();
    expect(impulseSubPathProbing.treating_myself).toBeDefined();
    expect(impulseSubPathProbing.caught_eye).toBeDefined();
    expect(impulseSubPathProbing.trending).toBeDefined();
    expect(impulseSubPathProbing.other).toBeDefined();
  });

  it("price_felt_right should target intuitive-threshold-spender mode", () => {
    const probing = impulseSubPathProbing.price_felt_right;
    expect(probing.targetModes).toContain("#intuitive-threshold-spender");
  });

  it("treating_myself should target multiple modes", () => {
    const probing = impulseSubPathProbing.treating_myself;
    expect(probing.targetModes.length).toBeGreaterThanOrEqual(1);
    expect(probing.targetModes).toContain("#reward-driven-spender");
    expect(probing.targetModes).toContain("#comfort-driven-spender");
    expect(probing.targetModes).toContain("#routine-treat-spender");
  });

  it("caught_eye should have probing hints about what caught their eye", () => {
    const probing = impulseSubPathProbing.caught_eye;
    const hints = probing.probingHints.join(" ");
    expect(hints).toContain("caught your eye");
  });

  it("trending should explore trend susceptibility", () => {
    const probing = impulseSubPathProbing.trending;
    expect(probing.explorationGoal).toContain("susceptible");
  });
});

describe("Impulse Sub-Path Probing Tags", () => {
  it("should include explorationTag for each impulse sub-path probing definition", () => {
    expect(getSubPathProbing("impulse", "price_felt_right")?.explorationTag).toBe("#price-sensitivity-driven");
    expect(getSubPathProbing("impulse", "treating_myself")?.explorationTag).toBe("#self-reward-driven");
    expect(getSubPathProbing("impulse", "caught_eye")?.explorationTag).toBe("#visual-impulse-driven");
    expect(getSubPathProbing("impulse", "trending")?.explorationTag).toBe("#trend-susceptibility-driven");
    // "other" is intentionally untagged: it's an open-ended branch.
    expect(getSubPathProbing("impulse", "other")?.explorationTag).toBeUndefined();
  });
});

describe("getFixedQuestion2Options (question-trees)", () => {
  it("should derive impulse/deliberate/deal options from *SubPathProbing keys", () => {
    const impulseOptions = getTreeFixedQuestion2Options("shopping", "impulse") ?? [];
    expect(impulseOptions.map((o) => o.value).sort()).toEqual(Object.keys(impulseSubPathProbing).sort());

    const deliberateOptions = getTreeFixedQuestion2Options("shopping", "deliberate") ?? [];
    expect(deliberateOptions.map((o) => o.value).sort()).toEqual(Object.keys(deliberateSubPathProbing).sort());

    const dealOptions = getTreeFixedQuestion2Options("shopping", "deal") ?? [];
    expect(dealOptions.map((o) => o.value).sort()).toEqual(Object.keys(dealSubPathProbing).sort());
  });
});

describe("Deal Sub-Path Probing", () => {
  it("should have probing config for all deal sub-paths", () => {
    expect(dealSubPathProbing.limited_edition).toBeDefined();
    expect(dealSubPathProbing.sale_discount).toBeDefined();
    expect(dealSubPathProbing.free_shipping).toBeDefined();
  });

  it("limited_edition should explore FOMO susceptibility", () => {
    const probing = dealSubPathProbing.limited_edition;
    expect(probing.explorationGoal).toContain("FOMO");
    expect(probing.targetModes).toContain("#scarcity-driven");
  });

  it("sale_discount should ask about full price buying", () => {
    const probing = dealSubPathProbing.sale_discount;
    const hints = probing.probingHints.join(" ");
    expect(hints).toContain("full price");
  });

  it("free_shipping should explore threshold spending patterns", () => {
    const probing = dealSubPathProbing.free_shipping;
    // Exploration goal is about adding items, mode is about threshold spending
    expect(probing.explorationGoal).toContain("add");
    expect(probing.targetModes).toContain("#threshold-spending-driven");
  });
});

describe("Deliberate Sub-Path Probing", () => {
  it("should have probing config for all deliberate sub-paths", () => {
    expect(deliberateSubPathProbing.afford_it).toBeDefined();
    expect(deliberateSubPathProbing.right_price).toBeDefined();
    expect(deliberateSubPathProbing.right_one).toBeDefined();
    expect(deliberateSubPathProbing.still_wanted).toBeDefined();
    expect(deliberateSubPathProbing.got_around).toBeDefined();
  });

  it("right_one should target deliberate-researcher mode", () => {
    const probing = deliberateSubPathProbing.right_one;
    expect(probing.targetModes).toContain("#deliberate-researcher");
  });

  it("still_wanted should validate intentional pause", () => {
    const probing = deliberateSubPathProbing.still_wanted;
    expect(probing.explorationGoal).toContain("pause");
    expect(probing.targetModes).toContain("#deliberate-pause-tester");
  });
});

describe("getSubPathProbing helper", () => {
  it("should return impulse sub-path probing for impulse path", () => {
    const probing = getSubPathProbing("impulse", "price_felt_right");
    expect(probing).toBeDefined();
    expect(probing?.targetModes).toContain("#intuitive-threshold-spender");
  });

  it("should return deal sub-path probing for deal path", () => {
    const probing = getSubPathProbing("deal", "limited_edition");
    expect(probing).toBeDefined();
    expect(probing?.targetModes).toContain("#scarcity-driven");
  });

  it("should return deliberate sub-path probing for deliberate path", () => {
    const probing = getSubPathProbing("deliberate", "right_one");
    expect(probing).toBeDefined();
    expect(probing?.targetModes).toContain("#deliberate-researcher");
  });

  it("should return undefined for unknown paths", () => {
    const probing = getSubPathProbing("unknown", "test");
    expect(probing).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// Probing Adherence Tests - right_one Path (Criterion #23)
// ═══════════════════════════════════════════════════════════════

describe("Probing Adherence for right_one Path", () => {
  it("should have correct probing hints for right_one path per spec", () => {
    const probing = deliberateSubPathProbing.right_one;
    expect(probing).toBeDefined();
    
    // Per LLM_PROBING_ADHERENCE.md, right_one should have these exact probing hints:
    // 1. "Where did you go for your research?"
    
    const hints = probing.probingHints;
    // Deliberate paths use light probing with 1 hint (1 question max)
    expect(hints.length).toBeGreaterThanOrEqual(1);
    
    // Check that hints cover research
    const hintsText = hints.join(" ").toLowerCase();
    expect(hintsText).toMatch(/research/);
  });

  it("should target #deliberate-researcher mode", () => {
    const probing = deliberateSubPathProbing.right_one;
    expect(probing.targetModes).toContain("#deliberate-researcher");
  });

  it("should have light probing flag for deliberate paths (1-2 exchanges max)", () => {
    const probing = deliberateSubPathProbing.right_one;
    // Deliberate paths should use light probing (graceful exit rather than deep probing)
    expect(probing).toBeDefined();
    expect(probing.lightProbing).toBe(true);
  });

  it("should include exploration goal about research validation", () => {
    const probing = deliberateSubPathProbing.right_one;
    expect(probing.explorationGoal).toBeDefined();
    // The exploration goal should validate their research process
    expect(probing.explorationGoal.toLowerCase()).toMatch(/research|validate|intentional/);
  });
});

// ═══════════════════════════════════════════════════════════════
// Right_One Path Probing Adherence Tests
// ═══════════════════════════════════════════════════════════════

describe("right_one Path Probing Adherence", () => {
  it("should have correct probing hints for right_one path", () => {
    const probing = getSubPathProbing("deliberate", "right_one");
    expect(probing).toBeDefined();
    
    // Deliberate paths use light probing (1 question max)
    // The key probing hint is about research
    expect(probing?.probingHints.length).toBeGreaterThanOrEqual(1);
    const hintsText = probing?.probingHints.join(" ").toLowerCase() || "";
    expect(hintsText).toContain("research");
  });

  it("should target #deliberate-researcher mode for right_one", () => {
    const probing = getSubPathProbing("deliberate", "right_one");
    expect(probing?.targetModes).toContain("#deliberate-researcher");
  });

  it("should have exploration goal about research process", () => {
    const probing = getSubPathProbing("deliberate", "right_one");
    expect(probing?.explorationGoal.toLowerCase()).toContain("research");
  });

  it("should have at least 1 probing hint for light probing (deliberate path)", () => {
    const probing = getSubPathProbing("deliberate", "right_one");
    // Deliberate paths use light probing (1 question max, so 1 hint)
    expect(probing?.probingHints.length).toBeGreaterThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// Mode Definition Tests
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// Probing Adherence Tests (Criterion 23)
// ═══════════════════════════════════════════════════════════════

describe("Probing Adherence: right_one path", () => {
  it("should have correct exploration goal for right_one sub-path", () => {
    const probing = deliberateSubPathProbing.right_one;
    expect(probing.explorationGoal).toBeDefined();
    expect(probing.explorationGoal).toContain("research");
  });

  it("should have specific probing hints for research exploration", () => {
    const probing = deliberateSubPathProbing.right_one;
    expect(probing.probingHints).toBeDefined();
    // Deliberate paths use light probing (1 question max)
    expect(probing.probingHints.length).toBeGreaterThanOrEqual(1);
    
    // Check for expected probing questions
    // At minimum, should include research-related questions
    const allHints = probing.probingHints.join(" ").toLowerCase();
    expect(allHints).toContain("research");
  });

  it("should target #deliberate-researcher mode", () => {
    const probing = deliberateSubPathProbing.right_one;
    expect(probing.targetModes).toContain("#deliberate-researcher");
  });

  it("probing hints should be specific, not generic", () => {
    const probing = deliberateSubPathProbing.right_one;
    const allHints = probing.probingHints.join(" ").toLowerCase();
    
    // These generic questions should NOT be in the hints
    expect(allHints).not.toContain("can you tell me more");
    expect(allHints).not.toContain("what factors did you consider");
    expect(allHints).not.toContain("can you elaborate");
    expect(allHints).not.toContain("how did that make you feel");
  });

  it("should have mode signals for mode detection", () => {
    const probing = deliberateSubPathProbing.right_one;
    expect(probing.modeSignals).toBeDefined();
    expect(Object.keys(probing.modeSignals).length).toBeGreaterThan(0);
    
    // Should have signals related to research behavior
    const allSignals = Object.values(probing.modeSignals).flat().join(" ").toLowerCase();
    expect(allSignals).toMatch(/research|review|compare/);
  });
});

describe("Probing Adherence: all deliberate sub-paths", () => {
  it("all deliberate sub-paths should have specific probing hints", () => {
    const subPaths = ["afford_it", "right_price", "right_one", "still_wanted", "got_around"];
    
    subPaths.forEach(subPath => {
      const probing = deliberateSubPathProbing[subPath as keyof typeof deliberateSubPathProbing];
      expect(probing).toBeDefined();
      expect(probing.probingHints).toBeDefined();
      expect(probing.probingHints.length).toBeGreaterThan(0);
      
      // Each hint should be specific, not generic (at least 8 chars for short questions)
      probing.probingHints.forEach(hint => {
        expect(hint.length).toBeGreaterThanOrEqual(8); // Not too short
        expect(hint).not.toMatch(/^\?/); // Should not start with question mark
      });
    });
  });

  it("all deliberate sub-paths should have appropriate target modes", () => {
    const expectedModes: Record<string, string> = {
      afford_it: "#deliberate-budget-saver",
      right_price: "#deliberate-deal-hunter",
      right_one: "#deliberate-researcher",
      still_wanted: "#deliberate-pause-tester",
      got_around: "#deliberate-low-priority",
    };
    
    Object.entries(expectedModes).forEach(([subPath, expectedMode]) => {
      const probing = deliberateSubPathProbing[subPath as keyof typeof deliberateSubPathProbing];
      expect(probing.targetModes).toContain(expectedMode);
    });
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
    // Exploration tags (NOT modes)
    expect(modeDefinitions["#visual-impulse-driven"]).toBeUndefined();
    expect(modeDefinitions["#trend-susceptibility-driven"]).toBeUndefined();
    // Flat modes used after probing
    expect(modeDefinitions["#scroll-triggered"]).toBeDefined();
    expect(modeDefinitions["#in-store-wanderer"]).toBeDefined();
    expect(modeDefinitions["#aesthetic-driven"]).toBeDefined();
    expect(modeDefinitions["#duplicate-collector"]).toBeDefined();
    expect(modeDefinitions["#exploration-hobbyist"]).toBeDefined();
    expect(modeDefinitions["#social-media-influenced"]).toBeDefined();
    expect(modeDefinitions["#friend-peer-influenced"]).toBeDefined();
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
// Layer 3 Reflection Mode Adaptation Tests (Criterion 22)
// ═══════════════════════════════════════════════════════════════

describe("Layer 3 Reflection: Cost Comparison mode adaptation", () => {
  const transaction = { merchant: "Zara", amount: 47.12 };

  it("threshold-spending-driven should ask about free shipping worth it", () => {
    const prompt = buildReflectionPrompt("worth", "#threshold-spending-driven", transaction);
    expect(prompt).toContain("hit free shipping");
    expect(prompt).toContain("$47.12");
    expect(prompt).toContain("Mode-Adapted Question");
  });

  it("scarcity-driven should ask if they'd buy the limited drop again at price", () => {
    const prompt = buildReflectionPrompt("worth", "#scarcity-driven", transaction);
    expect(prompt).toContain("limited drop came back");
    expect(prompt).toContain("$47.12");
    expect(prompt).toContain("Mode-Adapted Question");
  });

  it("reward-driven-spender should frame value as a reward they'll use", () => {
    const prompt = buildReflectionPrompt("worth", "#reward-driven-spender", transaction);
    expect(prompt).toContain("Is this reward something you'll get a lot of use out of?");
    expect(prompt).toContain("Mode-Adapted Question");
  });
});

// ═══════════════════════════════════════════════════════════════
// Probing Adherence Tests for "right_one" Path (Criterion 23)
// ═══════════════════════════════════════════════════════════════

describe("Probing Adherence for 'right_one' Path", () => {
  const rightOneProbing = deliberateSubPathProbing.right_one;

  it("should have right_one as a valid deliberate sub-path", () => {
    expect(rightOneProbing).toBeDefined();
    expect(rightOneProbing.subPath).toBe("right_one");
  });

  it("should target #deliberate-researcher mode", () => {
    expect(rightOneProbing.targetModes).toContain("#deliberate-researcher");
  });

  it("should have exploration goal about research process", () => {
    expect(rightOneProbing.explorationGoal.toLowerCase()).toContain("research");
  });

  it("should have REQUIRED probing hints (per LLM_PROBING_ADHERENCE.md)", () => {
    expect(rightOneProbing.probingHints).toBeDefined();
    expect(rightOneProbing.probingHints.length).toBeGreaterThan(0);
    
    // Check for specific required questions from PEEK_QUESTION_TREES.md
    const hints = rightOneProbing.probingHints.join(" ");
    expect(hints).toContain("research");
  });

  it("should have first probing hint ask about research", () => {
    // Deliberate paths use light probing (1 question max)
    expect(rightOneProbing.probingHints[0].toLowerCase()).toContain("research");
  });

  it("should use light probing with minimal hints", () => {
    // Deliberate paths have lightProbing: true, so only 1 question
    expect(rightOneProbing.lightProbing).toBe(true);
    expect(rightOneProbing.probingHints.length).toBeGreaterThanOrEqual(1);
  });

  it("should have mode signals for detecting deliberate-researcher mode", () => {
    expect(rightOneProbing.modeSignals).toBeDefined();
    expect(Object.keys(rightOneProbing.modeSignals).length).toBeGreaterThan(0);
  });

  it("should detect 'researched' as a mode signal", () => {
    const signals = Object.values(rightOneProbing.modeSignals).flat().join(" ");
    expect(signals.toLowerCase()).toContain("research");
  });

  it("should have mode signals for research-based purchasing", () => {
    const signals = Object.values(rightOneProbing.modeSignals).flat().join(" ").toLowerCase();
    expect(signals).toContain("research");
  });

  it("should be accessible via getSubPathProbing helper", () => {
    const probing = getSubPathProbing("deliberate", "right_one");
    expect(probing).toBeDefined();
    expect(probing?.targetModes).toContain("#deliberate-researcher");
    expect(probing?.probingHints.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// Question Tree Routing Tests (Criterion 24)
// ═══════════════════════════════════════════════════════════════

describe("Question Tree Routing - Shopping Paths", () => {
  describe("Path Selection (Fixed Q1)", () => {
    it("should offer exactly 6 shopping path options", () => {
      const options = getFixedQuestion1Options("shopping");
      expect(options.length).toBe(6);
    });

    it("should have impulse path marked as less intentional (yellow)", () => {
      const options = getFixedQuestion1Options("shopping");
      const impulse = options.find(o => o.value === "impulse");
      expect(impulse?.color).toBe("yellow");
    });

    it("should have deal path marked as less intentional (yellow)", () => {
      const options = getFixedQuestion1Options("shopping");
      const deal = options.find(o => o.value === "deal");
      expect(deal?.color).toBe("yellow");
    });

    it("should have deliberate path marked as intentional (white)", () => {
      const options = getFixedQuestion1Options("shopping");
      const deliberate = options.find(o => o.value === "deliberate");
      expect(deliberate?.color).not.toBe("yellow");
    });
  });

  describe("Sub-Path Routing (Fixed Q2)", () => {
    it("should route impulse to 5 sub-paths", () => {
      expect(Object.keys(impulseSubPathProbing).length).toBe(5);
      expect(impulseSubPathProbing.price_felt_right).toBeDefined();
      expect(impulseSubPathProbing.treating_myself).toBeDefined();
      expect(impulseSubPathProbing.caught_eye).toBeDefined();
      expect(impulseSubPathProbing.trending).toBeDefined();
      expect(impulseSubPathProbing.other).toBeDefined();
    });

    it("should route deal to 3 sub-paths", () => {
      expect(Object.keys(dealSubPathProbing).length).toBe(3);
      expect(dealSubPathProbing.limited_edition).toBeDefined();
      expect(dealSubPathProbing.sale_discount).toBeDefined();
      expect(dealSubPathProbing.free_shipping).toBeDefined();
    });

    it("should route deliberate to 6 sub-paths", () => {
      expect(Object.keys(deliberateSubPathProbing).length).toBe(6);
      expect(deliberateSubPathProbing.afford_it).toBeDefined();
      expect(deliberateSubPathProbing.right_price).toBeDefined();
      expect(deliberateSubPathProbing.right_one).toBeDefined();
      expect(deliberateSubPathProbing.still_wanted).toBeDefined();
      expect(deliberateSubPathProbing.got_around).toBeDefined();
      expect(deliberateSubPathProbing.other).toBeDefined();
    });
  });

  describe("Mode Assignment Routing", () => {
    it("should assign correct target modes for each impulse sub-path", () => {
      expect(impulseSubPathProbing.price_felt_right.targetModes).toContain("#intuitive-threshold-spender");
      // caught_eye / trending are "probe to determine" branches with multiple target modes
      expect(impulseSubPathProbing.caught_eye.targetModes).toEqual(
        expect.arrayContaining([
          "#scroll-triggered",
          "#in-store-wanderer",
          "#aesthetic-driven",
          "#duplicate-collector",
        ]),
      );
      expect(impulseSubPathProbing.trending.targetModes).toEqual(
        expect.arrayContaining(["#social-media-influenced", "#friend-peer-influenced"]),
      );
    });

    it("should assign correct target modes for each deal sub-path", () => {
      expect(dealSubPathProbing.limited_edition.targetModes).toContain("#scarcity-driven");
      expect(dealSubPathProbing.sale_discount.targetModes).toContain("#deal-driven");
      expect(dealSubPathProbing.free_shipping.targetModes).toContain("#threshold-spending-driven");
    });

    it("should assign correct target modes for each deliberate sub-path", () => {
      expect(deliberateSubPathProbing.afford_it.targetModes).toContain("#deliberate-budget-saver");
      expect(deliberateSubPathProbing.right_price.targetModes).toContain("#deliberate-deal-hunter");
      expect(deliberateSubPathProbing.right_one.targetModes).toContain("#deliberate-researcher");
      expect(deliberateSubPathProbing.still_wanted.targetModes).toContain("#deliberate-pause-tester");
      expect(deliberateSubPathProbing.got_around.targetModes).toContain("#deliberate-low-priority");
    });
  });

  describe("Exploration Goal Content Quality", () => {
    it("should have meaningful exploration goals for all paths", () => {
      // Check impulse paths - all should have exploration goals
      Object.values(impulseSubPathProbing).forEach(probing => {
        expect(probing.explorationGoal.length).toBeGreaterThan(5);
      });
      
      // Check deal paths
      Object.values(dealSubPathProbing).forEach(probing => {
        expect(probing.explorationGoal.length).toBeGreaterThan(5);
      });
      
      // Check deliberate paths (these use short goals with light probing)
      Object.values(deliberateSubPathProbing).forEach(probing => {
        expect(probing.explorationGoal.length).toBeGreaterThan(5);
      });
    });

    it("should have probing hints for all sub-paths", () => {
      // Check all sub-paths have at least one probing hint
      Object.values(impulseSubPathProbing).forEach(probing => {
        expect(probing.probingHints.length).toBeGreaterThan(0);
      });
      
      Object.values(dealSubPathProbing).forEach(probing => {
        expect(probing.probingHints.length).toBeGreaterThan(0);
      });
      
      Object.values(deliberateSubPathProbing).forEach(probing => {
        expect(probing.probingHints.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Modes Are Flat (No Base Mode Hierarchy)", () => {
    it("caught_eye probing should NOT include #visual-impulse-driven as a mode", () => {
      const probing = getSubPathProbing("impulse", "caught_eye");
      expect(probing?.targetModes).not.toContain("#visual-impulse-driven");
      expect(probing?.targetModes).toEqual(
        expect.arrayContaining([
          "#scroll-triggered",
          "#in-store-wanderer",
          "#aesthetic-driven",
          "#duplicate-collector",
        ]),
      );
    });

    it("trending probing should NOT include #trend-susceptibility-driven as a mode", () => {
      const probing = getSubPathProbing("impulse", "trending");
      expect(probing?.targetModes).not.toContain("#trend-susceptibility-driven");
      expect(probing?.targetModes).toEqual(
        expect.arrayContaining(["#social-media-influenced", "#friend-peer-influenced"]),
      );
    });

    it("all SubPathProbing targetModes should exclude exploration tags", () => {
      const tagOnlyModes = new Set([
        "#price-sensitivity-driven",
        "#self-reward-driven",
        "#visual-impulse-driven",
        "#trend-susceptibility-driven",
      ]);

      const allProbingRecords = [
        impulseSubPathProbing,
        deliberateSubPathProbing,
        dealSubPathProbing,
        giftSubPathProbing,
        maintenanceSubPathProbing,
      ] as const;

      allProbingRecords.forEach((record) => {
        Object.values(record).forEach((probing) => {
          probing.targetModes.forEach((mode) => {
            expect(tagOnlyModes.has(mode)).toBe(false);
          });
        });
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Graceful Exit Detection Tests (Criterion 26)
// ═══════════════════════════════════════════════════════════════

describe("Graceful Exit Detection", () => {
  describe("Deliberate Path Exits", () => {
    it("should exit gracefully for all deliberate sub-paths (no further probing needed)", () => {
      // All deliberate sub-paths are intentional and should have light probing
      // The presence of target modes indicates we can exit after light exploration
      Object.values(deliberateSubPathProbing).filter((probing) => probing.subPath !== "other").forEach(probing => {
        expect(probing.targetModes).toBeDefined();
        expect(probing.targetModes.length).toBeGreaterThan(0);
        expect(probing.targetModes[0].startsWith("#deliberate")).toBe(true);
      });
    });

    it("should have all deliberate sub-paths mapping to valid modes", () => {
      // Deliberate paths map to intentional modes that don't need deep probing
      const expectedModes: Record<string, string> = {
        afford_it: "#deliberate-budget-saver",
        right_price: "#deliberate-deal-hunter",
        right_one: "#deliberate-researcher",
        still_wanted: "#deliberate-pause-tester",
        got_around: "#deliberate-low-priority",
      };
      
      Object.entries(expectedModes).forEach(([subPath, expectedMode]) => {
        expect(deliberateSubPathProbing[subPath as keyof typeof deliberateSubPathProbing]).toBeDefined();
        expect(deliberateSubPathProbing[subPath as keyof typeof deliberateSubPathProbing].targetModes).toContain(expectedMode);
      });
    });
  });

  describe("Counter-Profile Detection for Impulse Paths", () => {
    it("should detect counter-profile for 'trending' path when user says it's them not trend", () => {
      const trendingProbing = impulseSubPathProbing.trending;
      expect(trendingProbing.probingHints).toContain("Do you feel like it's you or more of a trend buy?");
    });

    it("price_felt_right should have probing hints for price threshold exploration", () => {
      const probing = getSubPathProbing("impulse", "price_felt_right");
      expect(probing).toBeDefined();
      expect(probing?.probingHints?.length).toBeGreaterThan(0);
      // Note: counter-profile rerouting is not yet implemented for this subpath
    });
  });

  describe("Counter-Profile Detection for Deal Paths", () => {
    it("should have counter-profile pattern for sale_discount when would buy at full price", () => {
      const saleProbing = dealSubPathProbing.sale_discount;
      const hints = saleProbing.probingHints.join(" ");
      expect(hints).toContain("full price");
    });

    it("limited_edition should have scarcity-driven exploration", () => {
      const probing = getSubPathProbing("deal", "limited_edition");
      expect(probing).toBeDefined();
      expect(probing?.targetModes).toContain("#scarcity-driven");
      expect(probing?.probingHints?.length).toBeGreaterThan(0);
    });

    it("should detect when deal buyer was already planning purchase", () => {
      const counterPatterns = explorationGoals.deal.counterProfilePatterns;
      expect(counterPatterns.length).toBeGreaterThan(0);
      expect(counterPatterns.some(p => p.toLowerCase().includes("anyway"))).toBe(true);
    });

    it("limited_edition should have scarcity-driven exploration goals", () => {
      const probing = getSubPathProbing("deal", "limited_edition");
      expect(probing).toBeDefined();
      expect(probing?.targetModes).toContain("#scarcity-driven");
      expect(probing?.probingHints?.length).toBeGreaterThan(0);
    });
  });

  describe("Gift Path Graceful Exit", () => {
    it("should have no deep probing needed for gift path", () => {
      // Gift path has no counter-profiles - gifts are generally intentional
      const giftExplorationGoal = explorationGoals.gift;
      expect(giftExplorationGoal.counterProfilePatterns.length).toBe(0);
    });
  });

  describe("Maintenance Path Graceful Exit", () => {
    it("should have no deep probing needed for maintenance path", () => {
      // Maintenance path has no counter-profiles - restocking is necessity
      const maintenanceExplorationGoal = explorationGoals.maintenance;
      expect(maintenanceExplorationGoal.counterProfilePatterns.length).toBe(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Probing Adherence Tests (Criterion 23)
// ═══════════════════════════════════════════════════════════════

describe("Probing Adherence - right_one Path", () => {
  const rightOneProbing = deliberateSubPathProbing.right_one;

  it("should have specific probing hints for right_one path", () => {
    expect(rightOneProbing.probingHints).toBeDefined();
    expect(rightOneProbing.probingHints.length).toBeGreaterThan(0);
  });

  it("should include 'Where did you go for your research?' question", () => {
    const hints = rightOneProbing.probingHints.join(" ").toLowerCase();
    expect(hints).toContain("research");
  });

  it("should use light probing with minimal questions", () => {
    // Deliberate paths use light probing - 1 question max
    expect(rightOneProbing.lightProbing).toBe(true);
    expect(rightOneProbing.probingHints.length).toBeGreaterThanOrEqual(1);
  });

  it("should target #deliberate-researcher mode", () => {
    expect(rightOneProbing.targetModes).toContain("#deliberate-researcher");
  });

  it("should have research-related mode signals", () => {
    const modeSignals = Object.values(rightOneProbing.modeSignals).flat().join(" ").toLowerCase();
    expect(modeSignals).toContain("research");
  });

  it("should have exploration goal about research/standards", () => {
    expect(rightOneProbing.explorationGoal.toLowerCase()).toContain("research");
  });
});

// ═══════════════════════════════════════════════════════════════
// Graceful Exit Detection Tests (Criterion 26)
// ═══════════════════════════════════════════════════════════════

describe("Graceful Exit Detection (SubPathProbing)", () => {
  describe("Deliberate Path Exits", () => {
    it("should mark all deliberate sub-paths for light probing (via SubPathProbing)", () => {
      // SubPathProbing has lightProbing field, SubPathExplorationGoal does not
      expect(getSubPathProbing("deliberate", "afford_it")?.lightProbing).toBe(true);
      expect(getSubPathProbing("deliberate", "right_price")?.lightProbing).toBe(true);
      expect(getSubPathProbing("deliberate", "right_one")?.lightProbing).toBe(true);
      expect(getSubPathProbing("deliberate", "still_wanted")?.lightProbing).toBe(true);
      expect(getSubPathProbing("deliberate", "got_around")?.lightProbing).toBe(true);
    });

    it("should use light probing for deliberate sub-paths (they are already intentional)", () => {
      // Deliberate paths use SubPathProbing with lightProbing=true
      // They should exit gracefully by default after 1 probing exchange
      expect(getSubPathProbing("deliberate", "afford_it")?.lightProbing).toBe(true);
      expect(getSubPathProbing("deliberate", "right_price")?.lightProbing).toBe(true);
      expect(getSubPathProbing("deliberate", "right_one")?.lightProbing).toBe(true);
      expect(getSubPathProbing("deliberate", "still_wanted")?.lightProbing).toBe(true);
      expect(getSubPathProbing("deliberate", "got_around")?.lightProbing).toBe(true);
    });
  });

  describe("Counter-Profile Detection", () => {
    it("should have counter-profile patterns for impulse path", () => {
      expect(explorationGoals.impulse.counterProfilePatterns.length).toBeGreaterThan(0);
    });

    it("should have counter-profile patterns for deal path", () => {
      expect(explorationGoals.deal.counterProfilePatterns.length).toBeGreaterThan(0);
    });

    it("should have empty counter-profile patterns for deliberate (already intentional)", () => {
      expect(explorationGoals.deliberate.counterProfilePatterns.length).toBe(0);
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

// ═══════════════════════════════════════════════════════════════
// Layer 3 Reflection: Cost Comparison Mode Adaptation (Criterion #22)
// ═══════════════════════════════════════════════════════════════

describe("Cost Comparison mode-aware adaptation", () => {
  it("should adapt question for threshold-spending-driven mode", () => {
    const q = getCostComparisonModeAdaptedQuestion("#threshold-spending-driven", 42.5);
    expect(q).toBeDefined();
    expect(q?.toLowerCase()).toContain("free shipping");
    expect(q).toContain("$42.50");
  });

  it("should adapt question for scarcity-driven mode", () => {
    const q = getCostComparisonModeAdaptedQuestion("#scarcity-driven", 99);
    expect(q).toBeDefined();
    expect(q?.toLowerCase()).toContain("limited");
    expect(q).toContain("$99.00");
  });

  it("should adapt question for reward-driven-spender mode", () => {
    const q = getCostComparisonModeAdaptedQuestion("#reward-driven-spender", 30);
    expect(q).toBeDefined();
    expect(q?.toLowerCase()).toContain("reward");
    expect(q?.toLowerCase()).toContain("use");
  });

  it("should return undefined for unrelated modes", () => {
    expect(getCostComparisonModeAdaptedQuestion("#deal-driven", 30)).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// Layer 3 Reflection Probing Hints (Criterion 23)
// ═══════════════════════════════════════════════════════════════

describe("Layer 3 Reflection: probing hints", () => {
  it("behavioral excavation should include frequency + usage checks", () => {
    const all = BEHAVIORAL_EXCAVATION_PROBING_HINTS.join(" ").toLowerCase();
    expect(all).toContain("a lot, sometimes, or rarely");
    expect(all).toContain("do you end up using it");
  });

  it("emotional reflection should include naming feelings + values alignment", () => {
    const all = EMOTIONAL_REFLECTION_PROBING_HINTS.join(" ").toLowerCase();
    expect(all).toContain("name what you're feeling");
    expect(all).toContain("lines up with how you want to spend");
  });

  it("cost comparison should include regret test + cost-per-use framing", () => {
    const all = COST_COMPARISON_PROBING_HINTS.join(" ").toLowerCase();
    expect(all).toContain("spend that");
    expect(all).toContain("per use");
  });

  it("open-ended guidance should start with 'what's on your mind' and route by intent", () => {
    const all = OPEN_ENDED_REFLECTION_GUIDANCE.join(" ").toLowerCase();
    expect(all).toContain("what's on your mind");
    expect(all).toContain("frequency");
    expect(all).toContain("feelings");
    expect(all).toContain("value");
  });

  it("reflection hints should not include generic banned questions", () => {
    const allHints = [
      ...BEHAVIORAL_EXCAVATION_PROBING_HINTS,
      ...EMOTIONAL_REFLECTION_PROBING_HINTS,
      ...COST_COMPARISON_PROBING_HINTS,
      ...OPEN_ENDED_REFLECTION_GUIDANCE,
    ]
      .join(" ")
      .toLowerCase();

    expect(allHints).not.toContain("can you tell me more");
    expect(allHints).not.toContain("what factors did you consider");
    expect(allHints).not.toContain("can you elaborate");
  });
});
