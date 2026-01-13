/**
 * Category-Specific Prompts
 * 
 * Prompts for Food and Coffee check-ins.
 */

import type { TransactionCategory } from "@/lib/types";

// =============================================================================
// General Reflection Prompts
// =============================================================================

export function getReflectionPrompt(reflectionType: string, category?: TransactionCategory): string {
  // Food-specific reflection prompts
  if (category === "food") {
    const foodPrompts: Record<string, string> = {
      problem: `The user wants to explore if their food delivery habit is problematic.
Guide them through self-discovery, not judgment:
1. Ask about frequency and when it happens most (weekdays? weekends? late nights?)
2. Explore if it affects other goals (savings, health, cooking skills)
3. Help them distinguish between "convenient choice" vs "default behavior"
4. Frame it as awareness, not restriction. Never tell them they have a problem.`,

      feel: `The user wants to explore their feelings about their food spending.
1. Validate that convenience has real value
2. Ask how they feel AFTER ordering vs before
3. Explore any guilt, satisfaction, or mixed feelings
4. Note patterns: do certain emotions trigger ordering?`,

      worth: `The user wants to evaluate if food delivery is a good use of money.
This is the ECONOMIC EVALUATION reflection for food:
1. Calculate: What else could that money buy? (But don't lecture!)
2. Frame it as "time + energy + convenience" value, not just dollars
3. Explore trade-offs: cooking time saved vs money spent
4. Ask: "If you had to pick 3 delivery orders this month, which would they be?"
5. Discuss meal prep or batch cooking as potential alternatives, not requirements`,

      different: `The user has their own question about food spending to explore.
Be curious about what's on their mind.
Common food-related concerns: health impact, time management, relationship with cooking.`,
    };
    return foodPrompts[reflectionType] || "";
  }

  // Coffee-specific reflection prompts
  if (category === "coffee") {
    const coffeePrompts: Record<string, string> = {
      problem: `The user wants to explore if their coffee/treat habit is problematic.
1. Frame frequency in context: daily coffee isn't inherently bad
2. Explore if it feels automatic vs intentional
3. Ask if they enjoy it or if it's just routine
4. Look for "treat inflation" - does one coffee become two?`,

      feel: `The user wants to explore their feelings about coffee spending.
1. Acknowledge that small treats have real emotional value
2. Explore the ritual aspect - is it the coffee or the break?
3. Note any guilt about small spending adding up`,

      worth: `The user wants to evaluate if coffee spending is worthwhile.
1. The classic "$5/day = $1,825/year" math is true but NOT helpful here
2. Instead, ask: "What does that morning coffee give you?"
3. Explore alternatives: better home setup? different routine?
4. Focus on intentionality, not elimination`,

      different: `The user has their own question about coffee/treat spending.
Be curious about what's on their mind.`,
    };
    return coffeePrompts[reflectionType] || "";
  }

  // General shopping prompts
  const prompts: Record<string, string> = {
    problem: `The user wants to explore if this spending pattern is problematic.
Guide them through self-discovery, not judgment:
1. Ask about frequency and impact
2. Explore if it affects other goals
3. Help them define "problem" in their own terms
Never tell them they have a problem - help them decide for themselves.`,

    feel: `The user wants to explore their feelings about this purchase.
1. Validate whatever they're feeling
2. Explore the emotion behind the purchase AND how they feel now
3. Note any patterns between emotional state and spending`,

    worth: `The user wants to evaluate if this was a good use of money.
1. Avoid simple cost comparisons ("that's X cups of coffee")
2. Ask about value in THEIR terms (joy, utility, alignment with goals)
3. Explore opportunity cost gently`,

    different: `The user has their own question to explore.
Be curious about what's on their mind.
Follow their lead while gently connecting to spending awareness.`,
  };

  return prompts[reflectionType] || "";
}

// =============================================================================
// Food Mode Prompts
// =============================================================================

export function getFoodModePrompt(mode: string): string {
  const modePrompts: Record<string, string> = {
    stress: `The user identified stress/tiredness as their main driver for food delivery.
This is the #autopilot-from-stress mode. Explore:
1. What does "drained" look like for them? (long day? emotional?)
2. Is cooking the problem, or is it decision fatigue about what to eat?
3. Are there specific days/times this happens most?
4. Gently explore: has delivery become the default, even on better days?`,

    convenience: `The user identified convenience/time as their main driver.
This is the #convenience-driven mode. Explore:
1. What's creating the time pressure? (work? commute? activities?)
2. Would they cook more if they had different circumstances?
3. Is it truly time-saving, or has it become a habit?
4. Frame: delivery IS a valid choice when time is genuinely limited.`,

    planning: `The user identified lack of meal planning as their main driver.
This is the #lack-of-pre-planning mode. Explore:
1. Have they tried meal planning before? What happened?
2. Is the barrier shopping, planning, or execution?
3. What would make planning feel doable?
4. Small wins: even 2-3 planned meals can shift the pattern.`,

    craving: `The user identifies specific cravings as their driver.
This is a COUNTER-PROFILE - they're being intentional about what they want.
Acknowledge this is different from autopilot ordering.
Light reflection: is the craving happening often? Is it for variety?`,

    social: `The user identifies social eating as their driver.
This is often a reasonable choice - sharing food is bonding.
Explore: is it truly social, or just easier than coordinating cooking?`,
  };

  return modePrompts[mode] || "";
}

