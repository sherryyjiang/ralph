/**
 * Mode Detection Accuracy Tests
 * 
 * Tests for mode detection via SubPathProbing targetModes and modeSignals.
 * Mode detection is now handled at the subpath level, not the path level.
 */

import { explorationGoals, getSubPathProbing } from "@/lib/llm/prompts";
import {
  impulseSubPathProbing,
  dealSubPathProbing,
  deliberateSubPathProbing,
} from "@/lib/llm/question-trees";

// ═══════════════════════════════════════════════════════════════
// Target Modes Coverage Tests
// ═══════════════════════════════════════════════════════════════

describe("Mode Detection Coverage", () => {
  describe("Shopping Target Modes (SubPath Level)", () => {
    it("should include impulse target modes in subpath probing", () => {
      expect(impulseSubPathProbing.price_felt_right.targetModes).toContain("#intuitive-threshold-spender");
      expect(impulseSubPathProbing.treating_myself.targetModes).toContain("#reward-driven-spender");
      expect(impulseSubPathProbing.caught_eye.targetModes).toContain("#scroll-triggered");
      expect(impulseSubPathProbing.trending.targetModes).toContain("#social-media-influenced");
    });

    it("should include deal target modes in subpath probing", () => {
      expect(dealSubPathProbing.limited_edition.targetModes).toContain("#scarcity-driven");
      expect(dealSubPathProbing.sale_discount.targetModes).toContain("#deal-driven");
      expect(dealSubPathProbing.free_shipping.targetModes).toContain("#threshold-spending-driven");
    });

    it("should include deliberate target modes in subpath probing", () => {
      expect(deliberateSubPathProbing.afford_it.targetModes).toContain("#deliberate-budget-saver");
      expect(deliberateSubPathProbing.right_one.targetModes).toContain("#deliberate-researcher");
      expect(deliberateSubPathProbing.still_wanted.targetModes).toContain("#deliberate-pause-tester");
    });
  });

  describe("Mode Signal Quality", () => {
    it("should have mode signals for impulse subpaths", () => {
      Object.values(impulseSubPathProbing).forEach(probing => {
        expect(probing.modeSignals).toBeDefined();
      });
    });

    it("should have mode signals for deal subpaths", () => {
      Object.values(dealSubPathProbing).forEach(probing => {
        expect(probing.modeSignals).toBeDefined();
      });
    });

    it("should have mode signals for deliberate subpaths", () => {
      Object.values(deliberateSubPathProbing).forEach(probing => {
        expect(probing.modeSignals).toBeDefined();
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
  it("should have probing hints at subpath level for gathering mode signals", () => {
    // Probing hints are defined at the subpath level, not the path level
    const impulseSubPath = getSubPathProbing("impulse", "treating_myself");
    expect(impulseSubPath?.probingHints?.length).toBeGreaterThanOrEqual(1);
    
    const dealSubPath = getSubPathProbing("deal", "sale_discount");
    expect(dealSubPath?.probingHints?.length).toBeGreaterThanOrEqual(1);
  });

  it("should have clear exploration goals", () => {
    Object.keys(explorationGoals).forEach(path => {
      const goal = explorationGoals[path];
      expect(goal.goal.length).toBeGreaterThan(20);
    });
  });

  it("should have target modes for each subpath probing", () => {
    // All subpaths should have target modes for assignment
    Object.values(impulseSubPathProbing).forEach(probing => {
      expect(probing.targetModes.length).toBeGreaterThan(0);
    });
    
    Object.values(dealSubPathProbing).forEach(probing => {
      expect(probing.targetModes.length).toBeGreaterThan(0);
    });
    
    Object.values(deliberateSubPathProbing).forEach(probing => {
      expect(probing.targetModes.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Path-to-Mode Mapping Tests (via SubPathProbing)
// ═══════════════════════════════════════════════════════════════

describe("Path to Mode Mapping (via SubPathProbing)", () => {
  it("impulse subpaths should have target modes (not exploration tags)", () => {
    const allTargetModes = Object.values(impulseSubPathProbing)
      .flatMap(probing => probing.targetModes);
    
    // Should have actual modes, not exploration tags
    expect(allTargetModes).toContain("#intuitive-threshold-spender");
    expect(allTargetModes).toContain("#scroll-triggered");
    expect(allTargetModes).toContain("#social-media-influenced");
    
    // Should NOT contain exploration tags as target modes
    expect(allTargetModes).not.toContain("#price-sensitivity-driven");
    expect(allTargetModes).not.toContain("#visual-impulse-driven");
  });

  it("deal subpaths should have proper target modes and probing", () => {
    expect(dealSubPathProbing.sale_discount.targetModes).toContain("#deal-driven");
    expect(dealSubPathProbing.sale_discount.probingHints.join(" ").toLowerCase()).toContain("full price");
  });

  it("deliberate subpaths should have proper target modes and probing", () => {
    const rightOneProbing = getSubPathProbing("deliberate", "right_one");
    expect(rightOneProbing?.targetModes).toContain("#deliberate-researcher");
    expect(rightOneProbing?.probingHints?.length).toBeGreaterThan(0);
  });
});
