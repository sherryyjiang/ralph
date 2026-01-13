/**
 * Shopping Check-In Flow Tests
 * 
 * Tests for Layer 1 Fixed Questions and flow transitions
 */

import {
  getShoppingFixedQuestion1,
  shoppingExplorationGoals,
  getReflectionOptions,
} from '@/lib/llm/question-trees';
import { buildSystemPrompt, explorationGoals, getSystemPrompt, getLayer2ProbingPrompt, getModeAssignmentPrompt } from '@/lib/llm/prompts';
import type { Transaction, CheckInSession, ShoppingPath } from '@/lib/types';

// =============================================================================
// Test Data
// =============================================================================

const mockTransaction: Transaction = {
  id: 'txn_001',
  merchant: 'Target',
  amount: 45.99,
  category: 'shopping',
  date: new Date('2026-01-10'),
  isFirstTime: false,
  frequencyThisWeek: 2,
  frequencyThisMonth: 8,
};

const mockSession: CheckInSession = {
  id: 'session_001',
  transactionId: 'txn_001',
  type: 'shopping',
  status: 'in_progress',
  currentLayer: 1,
  messages: [],
  metadata: {
    tags: [],
  },
};

// =============================================================================
// Fixed Question 1 Tests
// =============================================================================

describe('Shopping Fixed Question 1', () => {
  it('returns correct question content with transaction details', () => {
    const q1 = getShoppingFixedQuestion1(mockTransaction);
    
    expect(q1.content).toContain('$45.99');
    expect(q1.content).toContain('Target');
    expect(q1.content).toContain('When you bought this, were you...');
  });

  it('has exactly 5 options', () => {
    const q1 = getShoppingFixedQuestion1(mockTransaction);
    expect(q1.options).toHaveLength(5);
  });

  it('has all required path options', () => {
    const q1 = getShoppingFixedQuestion1(mockTransaction);
    const values = q1.options.map(opt => opt.value);
    
    expect(values).toContain('impulse');
    expect(values).toContain('deliberate');
    expect(values).toContain('deal');
    expect(values).toContain('gift');
    expect(values).toContain('maintenance');
  });

  it('marks impulse and deal as yellow (less intentional)', () => {
    const q1 = getShoppingFixedQuestion1(mockTransaction);
    
    const impulseOpt = q1.options.find(opt => opt.value === 'impulse');
    const dealOpt = q1.options.find(opt => opt.value === 'deal');
    
    expect(impulseOpt?.color).toBe('yellow');
    expect(dealOpt?.color).toBe('yellow');
  });

  it('marks deliberate, gift, and maintenance as white (more intentional)', () => {
    const q1 = getShoppingFixedQuestion1(mockTransaction);
    
    const deliberateOpt = q1.options.find(opt => opt.value === 'deliberate');
    const giftOpt = q1.options.find(opt => opt.value === 'gift');
    const maintenanceOpt = q1.options.find(opt => opt.value === 'maintenance');
    
    expect(deliberateOpt?.color).toBe('white');
    expect(giftOpt?.color).toBe('white');
    expect(maintenanceOpt?.color).toBe('white');
  });

  it('each option has required fields', () => {
    const q1 = getShoppingFixedQuestion1(mockTransaction);
    
    q1.options.forEach(opt => {
      expect(opt).toHaveProperty('id');
      expect(opt).toHaveProperty('label');
      expect(opt).toHaveProperty('emoji');
      expect(opt).toHaveProperty('value');
      expect(opt).toHaveProperty('color');
      expect(opt.label).toBeTruthy();
      expect(opt.emoji).toBeTruthy();
    });
  });
});

// =============================================================================
// Exploration Goals Tests
// =============================================================================

describe('Shopping Exploration Goals', () => {
  const paths: ShoppingPath[] = ['impulse', 'deliberate', 'deal', 'gift', 'maintenance'];

  it('has exploration goals for all paths', () => {
    paths.forEach(path => {
      expect(shoppingExplorationGoals[path]).toBeDefined();
    });
  });

  it('each goal has required structure', () => {
    paths.forEach(path => {
      const goal = shoppingExplorationGoals[path];
      
      expect(goal).toHaveProperty('path');
      expect(goal).toHaveProperty('goal');
      expect(goal).toHaveProperty('probingHints');
      expect(goal).toHaveProperty('modeIndicators');
      expect(goal).toHaveProperty('counterProfilePatterns');
      
      expect(goal.path).toBe(path);
      expect(goal.goal).toBeTruthy();
      expect(Array.isArray(goal.probingHints)).toBe(true);
      expect(goal.probingHints.length).toBeGreaterThan(0);
    });
  });

  describe('impulse path', () => {
    it('has correct exploration goal', () => {
      const impulse = shoppingExplorationGoals.impulse;
      expect(impulse.goal.toLowerCase()).toContain('emotional');
    });

    it('has mode indicators for comfort-driven and novelty-seeker', () => {
      const impulse = shoppingExplorationGoals.impulse;
      const modeKeys = Object.keys(impulse.modeIndicators);
      
      expect(modeKeys).toContain('#comfort-driven-spender');
      expect(modeKeys).toContain('#novelty-seeker');
    });

    it('has counter-profile patterns', () => {
      const impulse = shoppingExplorationGoals.impulse;
      expect(impulse.counterProfilePatterns.length).toBeGreaterThan(0);
    });
  });

  describe('deal path', () => {
    it('has correct exploration goal about deal-induced buying', () => {
      const deal = shoppingExplorationGoals.deal;
      expect(deal.goal.toLowerCase()).toContain('deal');
    });

    it('has mode indicators for deal-hunter and scarcity-susceptible', () => {
      const deal = shoppingExplorationGoals.deal;
      const modeKeys = Object.keys(deal.modeIndicators);
      
      expect(modeKeys).toContain('#deal-hunter');
      expect(modeKeys).toContain('#scarcity-susceptible');
    });
  });

  describe('deliberate path', () => {
    it('has correct exploration goal about intentionality', () => {
      const deliberate = shoppingExplorationGoals.deliberate;
      expect(deliberate.goal.toLowerCase()).toContain('intentional');
    });

    it('has mode indicators for intentional-planner', () => {
      const deliberate = shoppingExplorationGoals.deliberate;
      const modeKeys = Object.keys(deliberate.modeIndicators);
      
      expect(modeKeys).toContain('#intentional-planner');
    });
  });
});

// =============================================================================
// System Prompt Tests
// =============================================================================

describe('System Prompts', () => {
  it('buildSystemPrompt includes transaction context', () => {
    const prompt = buildSystemPrompt({
      transaction: mockTransaction,
      session: mockSession,
    });

    expect(prompt).toContain('$45.99');
    expect(prompt).toContain('Target');
    expect(prompt).toContain('shopping');
  });

  it('buildSystemPrompt includes session layer', () => {
    const prompt = buildSystemPrompt({
      transaction: mockTransaction,
      session: mockSession,
    });

    expect(prompt).toContain('Layer: 1');
  });

  it('buildSystemPrompt includes question tree section when path is set', () => {
    const sessionWithPath = { ...mockSession, path: 'impulse' as ShoppingPath };
    const prompt = buildSystemPrompt({
      transaction: mockTransaction,
      session: sessionWithPath,
      questionTreeSection: 'Test section content',
    });

    expect(prompt).toContain('Test section content');
  });

  it('getSystemPrompt returns path-specific guidance', () => {
    const impulsePrompt = getSystemPrompt('shopping', 'impulse');
    const deliberatePrompt = getSystemPrompt('shopping', 'deliberate');

    expect(impulsePrompt).toContain('impulse');
    expect(deliberatePrompt).toContain('planned');
  });
});

// =============================================================================
// Layer 2 Probing Tests
// =============================================================================

describe('Layer 2 Probing', () => {
  it('getLayer2ProbingPrompt includes user response', () => {
    const userResponse = "I saw it and just had to have it";
    const prompt = getLayer2ProbingPrompt('impulse', userResponse);

    expect(prompt).toContain(userResponse);
    expect(prompt).toContain('continue exploring');
  });

  it('getModeAssignmentPrompt includes conversation history', () => {
    const history = [
      "User: I bought it on impulse",
      "Assistant: What made you go for it?",
      "User: It was on sale and I was stressed",
    ];
    const prompt = getModeAssignmentPrompt(history, 'impulse');

    expect(prompt).toContain('I bought it on impulse');
    expect(prompt).toContain('I was stressed');
  });

  it('getModeAssignmentPrompt includes mode options', () => {
    const prompt = getModeAssignmentPrompt([], 'impulse');

    expect(prompt).toContain('#comfort-driven-spender');
    expect(prompt).toContain('#novelty-seeker');
    expect(prompt).toContain('#deal-hunter');
  });
});

// =============================================================================
// Layer 3 Reflection Tests
// =============================================================================

describe('Layer 3 Reflection', () => {
  it('has all required reflection options', () => {
    const reflectionOpts = getReflectionOptions();
    const values = reflectionOpts.options.map(opt => opt.value);

    expect(values).toContain('problem');
    expect(values).toContain('feel');
    expect(values).toContain('worth');
    expect(values).toContain('different');
    expect(values).toContain('done');
  });

  it('reflection options have correct labels', () => {
    const reflectionOpts = getReflectionOptions();
    
    const problemOpt = reflectionOpts.options.find(opt => opt.value === 'problem');
    const feelOpt = reflectionOpts.options.find(opt => opt.value === 'feel');
    const worthOpt = reflectionOpts.options.find(opt => opt.value === 'worth');

    expect(problemOpt?.label).toContain('problem');
    expect(feelOpt?.label).toContain('feel');
    expect(worthOpt?.label).toContain('use of money');
  });
});

// =============================================================================
// Flow Transition Tests
// =============================================================================

describe('Flow Transitions', () => {
  it('explorationGoals keys match shopping paths', () => {
    const goalKeys = Object.keys(explorationGoals);
    const expectedPaths = ['impulse', 'deliberate', 'deal', 'gift', 'maintenance'];

    expectedPaths.forEach(path => {
      expect(goalKeys).toContain(path);
    });
  });

  it('explorationGoals have flattened mode indicators', () => {
    const impulseGoal = explorationGoals.impulse;
    
    // Check that mode indicators are flattened to strings with mode prefix
    expect(impulseGoal.modeIndicators.some(m => m.startsWith('#comfort-driven-spender:'))).toBe(true);
  });
});
