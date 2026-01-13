/**
 * Mode Detection Accuracy Tests
 * 
 * Tests for the mode indicator patterns and detection logic.
 */

import { explorationGoals } from "@/lib/llm/prompts";

// ═══════════════════════════════════════════════════════════════
// Mode Indicator Coverage Tests
// ═══════════════════════════════════════════════════════════════

describe("Mode Detection Coverage", () => {
  describe("Shopping Modes", () => {
    it("should include impulse exploration tags in indicators", () => {
      const indicators = explorationGoals.impulse.modeIndicators;
      expect(indicators.some(i => i.includes("#price-sensitivity-driven"))).toBe(true);
      expect(indicators.some(i => i.includes("#self-reward-driven"))).toBe(true);
      expect(indicators.some(i => i.includes("#visual-impulse-driven"))).toBe(true);
      expect(indicators.some(i => i.includes("#trend-susceptibility-driven"))).toBe(true);
    });

    it("should include deal exploration tags in indicators", () => {
      const indicators = explorationGoals.deal.modeIndicators;
      expect(indicators.some(i => i.includes("#deal-driven"))).toBe(true);
      expect(indicators.some(i => i.includes("#scarcity-driven"))).toBe(true);
      expect(indicators.some(i => i.includes("#threshold-spending-driven"))).toBe(true);
    });

    it("should include deliberate exploration tags in indicators", () => {
      const indicators = explorationGoals.deliberate.modeIndicators;
      expect(indicators.some(i => i.includes("#deliberate-purchase"))).toBe(true);
      expect(indicators.some(i => i.includes("#value-standards-driven"))).toBe(true);
    });
  });

  describe("Mode Indicator Quality", () => {
    it("should have behavioral signals for each mode", () => {
      Object.keys(explorationGoals).forEach(path => {
        const goal = explorationGoals[path];
        goal.modeIndicators.forEach(indicator => {
          expect(indicator.length).toBeGreaterThan(10);
        });
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Counter-Profile Detection Tests
// ═══════════════════════════════════════════════════════════════

describe("Counter-Profile Detection", () => {
  it("should detect intentional behavior in impulse path", () => {
    const patterns = explorationGoals.impulse.counterProfilePatterns;
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("should detect planned purchase in deal path", () => {
    const patterns = explorationGoals.deal.counterProfilePatterns;
    expect(patterns.length).toBeGreaterThan(0);
  });

  it("should have no counter-profiles for deliberate path", () => {
    const patterns = explorationGoals.deliberate.counterProfilePatterns;
    expect(patterns.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// Mode Assignment Logic Tests
// ═══════════════════════════════════════════════════════════════

describe("Mode Assignment Logic", () => {
  it("should have mode indicators formatted correctly", () => {
    Object.keys(explorationGoals).forEach(path => {
      const goal = explorationGoals[path];
      goal.modeIndicators.forEach(indicator => {
        expect(indicator).toContain(":");
      });
    });
  });

  it("should have probing hints for gathering mode signals", () => {
    Object.keys(explorationGoals).forEach(path => {
      const goal = explorationGoals[path];
      expect(goal.probingHints.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("should have clear exploration goals", () => {
    Object.keys(explorationGoals).forEach(path => {
      const goal = explorationGoals[path];
      expect(goal.goal.length).toBeGreaterThan(20);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Path-to-Mode Mapping Tests
// ═══════════════════════════════════════════════════════════════

describe("Path to Mode Mapping", () => {
  it("impulse should surface exploration tags (not modes) at path level", () => {
    const indicators = explorationGoals.impulse.modeIndicators.join(" ");
    expect(indicators).toContain("#price-sensitivity-driven");
    expect(indicators).toContain("#self-reward-driven");
    expect(indicators).toContain("#visual-impulse-driven");
    expect(indicators).toContain("#trend-susceptibility-driven");
  });

  it("deal should avoid path-level indicators (sub-path probing determines the mode)", () => {
    const indicators = explorationGoals.deal.modeIndicators.join(" ");
    expect(indicators).toContain("#deal-driven");
    expect(indicators).toContain("#scarcity-driven");
    expect(indicators).toContain("#threshold-spending-driven");
    expect(explorationGoals.deal.probingHints.join(" ").toLowerCase()).toContain("full price");
  });

  it("deliberate should avoid path-level indicators (sub-path probing determines the mode)", () => {
    const indicators = explorationGoals.deliberate.modeIndicators.join(" ");
    expect(indicators).toContain("#deliberate-purchase");
    expect(indicators).toContain("#value-standards-driven");
    expect(explorationGoals.deliberate.probingHints.length).toBeGreaterThan(0);
  });
});
