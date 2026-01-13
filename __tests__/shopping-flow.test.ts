/**
 * Shopping Check-In Flow Tests
 * 
 * Tests for Layer 1 fixed questions, path routing, and mode assignment logic.
 */

import { getFixedQuestion1Options, explorationGoals } from "@/lib/llm/prompts";

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
