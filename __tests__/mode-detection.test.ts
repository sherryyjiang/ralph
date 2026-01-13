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
  it("should map impulse to emotional modes", () => {
    const indicators = explorationGoals.impulse.modeIndicators.join(" ");
    const emotionalKeywords = ["comfort", "stress", "treat", "reward"];
    const hasEmotional = emotionalKeywords.some(k => indicators.toLowerCase().includes(k));
    expect(hasEmotional).toBe(true);
  });

  it("should map deal to value-seeking modes", () => {
    const indicators = explorationGoals.deal.modeIndicators.join(" ");
    const valueKeywords = ["deal", "discount", "savings"];
    const hasValue = valueKeywords.some(k => indicators.toLowerCase().includes(k));
    expect(hasValue).toBe(true);
  });

  it("should map deliberate to planning modes", () => {
    const indicators = explorationGoals.deliberate.modeIndicators.join(" ");
    const planningKeywords = ["intentional", "research", "quality"];
    const hasPlanning = planningKeywords.some(k => indicators.toLowerCase().includes(k));
    expect(hasPlanning).toBe(true);
  });
});
