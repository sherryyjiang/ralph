/**
 * Fixed Question Options (Q1 and Q2)
 * 
 * These are the fixed options shown to users in Layer 1.
 */

import type { TransactionCategory, QuickReplyOption } from "@/lib/types";
import { getShoppingFixedQuestion1 } from "../question-trees";

// =============================================================================
// Fixed Question 1 Options by Category
// =============================================================================

/**
 * Get Fixed Question 1 options for a given category
 */
export function getFixedQuestion1Options(category: TransactionCategory): QuickReplyOption[] {
  switch (category) {
    case "shopping":
      // Use the shopping fixed question structure
      const shoppingQ1 = getShoppingFixedQuestion1({ merchant: "", amount: 0 });
      return shoppingQ1.options;
    
    case "food":
      // Food uses awareness calibration (guess vs actual), different flow
      return [
        { id: "guess_100", label: "$100 or less", value: "100" },
        { id: "guess_200", label: "$100-200", value: "200" },
        { id: "guess_300", label: "$200-300", value: "300" },
        { id: "guess_400", label: "$300-400", value: "400" },
        { id: "guess_500", label: "$400+", value: "500" },
      ];
    
    case "coffee":
      // Coffee uses frequency calibration (count), different flow
      return [
        { id: "guess_5", label: "5 or less", value: "5" },
        { id: "guess_10", label: "6-10 times", value: "10" },
        { id: "guess_15", label: "11-15 times", value: "15" },
        { id: "guess_20", label: "16-20 times", value: "20" },
        { id: "guess_25", label: "More than 20", value: "25" },
      ];
    
    default:
      return [];
  }
}

// =============================================================================
// Fixed Question 2 Options by Path
// =============================================================================

/**
 * Get Fixed Question 2 options for a given category and path
 */
export function getFixedQuestion2Options(category: TransactionCategory, path: string): QuickReplyOption[] | undefined {
  if (category !== "shopping") return undefined;
  
  const q2Options: Record<string, QuickReplyOption[]> = {
    impulse: [
      { id: "price_felt_right", label: "The price felt right", emoji: "💰", value: "price_felt_right", color: "yellow" },
      { id: "treating_myself", label: "Treating myself", emoji: "🎁", value: "treating_myself", color: "yellow" },
      { id: "caught_eye", label: "Just caught my eye", emoji: "👀", value: "caught_eye", color: "yellow" },
      { id: "trending", label: "It's been trending lately", emoji: "📈", value: "trending", color: "yellow" },
      { id: "other", label: "Other/Custom", emoji: "📝", value: "other", color: "yellow" },
    ],
    deliberate: [
      { id: "afford_it", label: "Waiting until I could afford it", emoji: "💳", value: "afford_it", color: "white" },
      { id: "right_price", label: "Waiting for the right price/deal", emoji: "🏷️", value: "right_price", color: "white" },
      { id: "right_one", label: "Waiting for the right one", emoji: "✨", value: "right_one", color: "white" },
      { id: "still_wanted", label: "Letting it sit to see if I still wanted it", emoji: "⏳", value: "still_wanted", color: "white" },
      { id: "got_around", label: "Finally got around to it", emoji: "✅", value: "got_around", color: "white" },
      { id: "other", label: "Other/Custom", emoji: "📝", value: "other", color: "white" },
    ],
    deal: [
      { id: "limited_edition", label: "Limited edition or drop that is running out", emoji: "⚡", value: "limited_edition", color: "yellow" },
      { id: "sale_discount", label: "It was a good sale, deal or discount", emoji: "💸", value: "sale_discount", color: "yellow" },
      { id: "free_shipping", label: "Hit free shipping threshold or got a bonus/sample with purchase", emoji: "📦", value: "free_shipping", color: "yellow" },
    ],
    gift: [
      { id: "family", label: "Family member", emoji: "👨‍👩‍👧", value: "family", color: "white" },
      { id: "friend", label: "Friend", emoji: "👋", value: "friend", color: "white" },
      { id: "partner", label: "Partner", emoji: "💕", value: "partner", color: "white" },
      { id: "coworker", label: "Coworker", emoji: "💼", value: "coworker", color: "white" },
      { id: "other", label: "Someone else", emoji: "👤", value: "other", color: "white" },
    ],
    maintenance: [
      { id: "same_thing", label: "Got the same thing", emoji: "🔁", value: "same_thing", color: "white" },
      { id: "switched_up", label: "Switched it up", emoji: "🔄", value: "switched_up", color: "white" },
      { id: "upgraded", label: "Upgraded", emoji: "⬆️", value: "upgraded", color: "white" },
    ],
  };
  
  return q2Options[path];
}

