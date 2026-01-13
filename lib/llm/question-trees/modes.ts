/**
 * Mode Definitions - All behavioral modes (FLAT structure)
 */

import { ModeDefinition } from "./types";

export const shoppingModeDefinitions: Record<string, ModeDefinition> = {
  "#intuitive-threshold-spender": { id: "#intuitive-threshold-spender", name: "Intuitive Threshold Spender", description: "Buys on impulse but has invisible price ceilings", indicators: ["saw it, wanted it, bought it", "the price felt right"], reflectionGuidance: "Explore what your internal price thresholds are." },
  "#reward-driven-spender": { id: "#reward-driven-spender", name: "Reward-Driven Spender", description: "Buys to celebrate wins", indicators: ["I hit my goal", "finished a hard week"], reflectionGuidance: "Consider if there are other ways to reward yourself." },
  "#comfort-driven-spender": { id: "#comfort-driven-spender", name: "Comfort-Driven Spender", description: "Buys to soothe stress", indicators: ["rough week", "felt down"], reflectionGuidance: "Explore alternative ways to meet emotional needs." },
  "#routine-treat-spender": { id: "#routine-treat-spender", name: "Routine Treat Spender", description: "Regular self-treating as habit", indicators: ["I always do this on Fridays"], reflectionGuidance: "Consider if this routine is serving you well." },
  "#scroll-triggered": { id: "#scroll-triggered", name: "Scroll-Triggered", description: "Caught while browsing online", indicators: ["I was scrolling and saw it"], reflectionGuidance: "Your feed is designed to trigger purchases." },
  "#in-store-wanderer": { id: "#in-store-wanderer", name: "In-Store Wanderer", description: "Caught while physically shopping", indicators: ["I was just walking by"], reflectionGuidance: "Consider shopping with a list." },
  "#aesthetic-driven": { id: "#aesthetic-driven", name: "Aesthetic-Driven", description: "Drawn to how things look", indicators: ["it was so pretty"], reflectionGuidance: "Consider adding a cooling-off period." },
  "#duplicate-collector": { id: "#duplicate-collector", name: "Duplicate Collector", description: "Already owns similar items", indicators: ["I have like 5 of these already"], reflectionGuidance: "Consider if you are collecting intentionally." },
  "#exploration-hobbyist": { id: "#exploration-hobbyist", name: "Exploration Hobbyist", description: "Likes trying new things", indicators: ["I like trying new things"], reflectionGuidance: "Consider setting a budget for discovery purchases." },
  "#social-media-influenced": { id: "#social-media-influenced", name: "Social Media Influenced", description: "Buys things trending on social platforms", indicators: ["saw it on TikTok"], reflectionGuidance: "Consider if it fits YOUR style." },
  "#friend-peer-influenced": { id: "#friend-peer-influenced", name: "Friend/Peer Influenced", description: "Buys because someone they know has it", indicators: ["my friend got one"], reflectionGuidance: "Consider if this fits your needs." },
  "#scarcity-driven": { id: "#scarcity-driven", name: "Scarcity Driven", description: "Susceptible to FOMO", indicators: ["limited edition", "selling out"], reflectionGuidance: "What would have happened if you missed it?" },
  "#deal-driven": { id: "#deal-driven", name: "Deal Driven", description: "Motivated by discounts", indicators: ["such a good deal"], reflectionGuidance: "Would you have bought at full price?" },
  "#threshold-spending-driven": { id: "#threshold-spending-driven", name: "Threshold Spending Driven", description: "Adds items to hit shipping thresholds", indicators: ["free shipping threshold"], reflectionGuidance: "Did the free thing cost you more?" },
  "#deliberate-budget-saver": { id: "#deliberate-budget-saver", name: "Deliberate Budget Saver", description: "Waited until they could afford it", indicators: ["saved up for it"], reflectionGuidance: "Great financial discipline!" },
  "#deliberate-deal-hunter": { id: "#deliberate-deal-hunter", name: "Deliberate Deal Hunter", description: "Patiently tracked prices", indicators: ["waited for a sale"], reflectionGuidance: "Smart shopping!" },
  "#deliberate-researcher": { id: "#deliberate-researcher", name: "Deliberate Researcher", description: "Did thorough research", indicators: ["researched options"], reflectionGuidance: "Thoughtful approach!" },
  "#deliberate-pause-tester": { id: "#deliberate-pause-tester", name: "Deliberate Pause Tester", description: "Let the purchase sit", indicators: ["gave it time"], reflectionGuidance: "Great self-awareness!" },
  "#deliberate-low-priority": { id: "#deliberate-low-priority", name: "Deliberate Low Priority", description: "Finally got around to it", indicators: ["kept putting it off"], reflectionGuidance: "Sometimes things take a while." },
  "#gift-giver": { id: "#gift-giver", name: "Gift Giver", description: "Bought for someone else", indicators: ["bought it for someone else"], reflectionGuidance: "Gift-giving is intentional." },
  "#loyal-repurchaser": { id: "#loyal-repurchaser", name: "Loyal Repurchaser", description: "Restocking the same product", indicators: ["it works"], reflectionGuidance: "Loyalty can be efficient." },
  "#brand-switcher": { id: "#brand-switcher", name: "Brand Switcher", description: "Tried something new", indicators: ["wanted to try something new"], reflectionGuidance: "Experimentation can lead to better options." },
  "#upgrader": { id: "#upgrader", name: "Upgrader", description: "Switched to something better", indicators: ["wanted something better"], reflectionGuidance: "Consider cost-per-use." },
};

export const modeDefinitions: Record<string, ModeDefinition> = { ...shoppingModeDefinitions };

export const MODE_CATEGORIES = {
  impulse_price: ["#intuitive-threshold-spender"],
  impulse_reward: ["#reward-driven-spender", "#comfort-driven-spender", "#routine-treat-spender"],
  impulse_visual: ["#scroll-triggered", "#in-store-wanderer", "#aesthetic-driven", "#duplicate-collector", "#exploration-hobbyist"],
  impulse_trend: ["#social-media-influenced", "#friend-peer-influenced"],
  deal_scarcity: ["#scarcity-driven", "#deal-driven", "#threshold-spending-driven"],
  deliberate: ["#deliberate-budget-saver", "#deliberate-deal-hunter", "#deliberate-researcher", "#deliberate-pause-tester", "#deliberate-low-priority"],
  gift: ["#gift-giver"],
  maintenance: ["#loyal-repurchaser", "#brand-switcher", "#upgrader"],
};

export const EXPLORATION_TAGS = ["#price-sensitivity-driven", "#self-reward-driven", "#visual-impulse-driven", "#trend-susceptibility-driven"];

export function isExplorationTag(tag: string): boolean {
  return EXPLORATION_TAGS.includes(tag);
}

export function isValidMode(mode: string): boolean {
  return mode in modeDefinitions;
}
