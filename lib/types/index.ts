/**
 * Peek Check-In Chat App - TypeScript Interfaces
 * 
 * Core data models for transactions, check-in sessions, and chat messages.
 */

// =============================================================================
// Transaction Types
// =============================================================================

export type TransactionCategory = "shopping" | "food" | "coffee";

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  category: TransactionCategory;
  date: Date;
  isFirstTime: boolean;
  frequencyThisWeek?: number;
  frequencyThisMonth?: number;
}

// =============================================================================
// Check-In Session Types
// =============================================================================

export type CheckInStatus = "pending" | "in_progress" | "completed" | "dismissed";
export type CheckInLayer = 1 | 2 | 3;

/**
 * Shopping check-in paths based on Fixed Question 1 responses
 */
export type ShoppingPath = 
  | "impulse"      // "Saw it and bought it"
  | "deliberate"   // "Been thinking about this"
  | "deal"         // "Good deal made me go for it"
  | "gift"         // "Bought for someone else"
  | "maintenance"; // "Restocking/replacing"

/**
 * Sub-paths for impulse shopping (Fixed Question 2 responses)
 * Based on PEEK_QUESTION_TREES.md "What made you go for it?"
 */
export type ImpulseSubPath = 
  | "price_felt_right"   // [YELLOW] "The price felt right" → #intuitive-threshold-spender
  | "treating_myself"    // [YELLOW] "Treating myself" → branches to reward/comfort/routine
  | "caught_eye"         // [YELLOW] "Just caught my eye" → #visual-impulse-driven
  | "trending";          // [YELLOW] "It's been trending lately" → #trend-susceptibility-driven

/**
 * Sub-paths for deliberate shopping (Fixed Question 2 responses)
 * Based on PEEK_QUESTION_TREES.md "What were you waiting for?"
 */
export type DeliberateSubPath =
  | "afford_it"          // [WHITE] "Waiting until I could afford it" → #deliberate-budget-saver
  | "right_price"        // [WHITE] "Waiting for the right price/deal" → #deliberate-deal-hunter
  | "right_one"          // [WHITE] "Waiting for the right one" → #deliberate-researcher
  | "still_wanted"       // [WHITE] "Letting it sit to see if I still wanted it" → #deliberate-pause-tester
  | "got_around";        // [WHITE] "Finally got around to it" → #deliberate-low-priority

/**
 * Sub-paths for deal/scarcity shopping (Fixed Question 2 responses)
 * Based on PEEK_QUESTION_TREES.md "Tell me more about the deal..."
 */
export type DealSubPath = 
  | "limited_edition"    // [YELLOW] "Limited edition or drop running out" → #scarcity-driven
  | "sale_discount"      // [YELLOW] "Good sale, deal, or discount" → #deal-driven
  | "free_shipping";     // [YELLOW] "Hit free shipping threshold or bonus" → #threshold-spending-driven

/**
 * Sub-paths for gift shopping (Fixed Question 2 responses)
 */
export type GiftSubPath =
  | "family"             // [WHITE] "Family member"
  | "friend"             // [WHITE] "Friend"
  | "partner"            // [WHITE] "Partner"
  | "coworker";          // [WHITE] "Coworker"

/**
 * Sub-paths for maintenance shopping (Fixed Question 2 responses)
 */
export type MaintenanceSubPath =
  | "same_thing"         // [WHITE] "Got the same thing" → #loyal-repurchaser
  | "switched_up"        // [WHITE] "Switched it up" → #brand-switcher
  | "upgraded";          // [WHITE] "Upgraded" → #upgrader

/**
 * Food check-in modes assigned after probing
 */
export type FoodMode = 
  | "stress"       // Stress/emotional eating patterns
  | "convenience"  // Time/convenience driven
  | "planning";    // Lack of meal planning

/**
 * Coffee/Treats check-in modes
 */
export type CoffeeMode = 
  | "autopilot"    // Routine without thinking
  | "environment"  // Triggered by location/context
  | "emotional"    // Emotional coping mechanism
  | "productivity"; // Justification for productivity

export type CheckInPath = ShoppingPath;
export type CheckInMode = string; // e.g., "#comfort-driven-spender"
export type ShoppingSubPath = ImpulseSubPath | DeliberateSubPath | DealSubPath | GiftSubPath | MaintenanceSubPath;

/**
 * Layer 3 reflection path options
 */
export type ReflectionPath = 
  | "problem"   // "Is this a problem?" - Behavioral excavation
  | "feel"      // "How do I feel?" - Emotional reflection
  | "worth"     // "Is this a good use?" - Cost comparison
  | "different"; // "I have a different question" - Open-ended

export interface CheckInSession {
  id: string;
  transactionId: string;
  type: TransactionCategory;
  status: CheckInStatus;
  currentLayer: CheckInLayer;
  path?: CheckInPath;
  subPath?: ShoppingSubPath;
  mode?: CheckInMode;
  reflectionPath?: ReflectionPath; // Layer 3 reflection path choice
  messages: Message[];
  metadata: {
    startedAt?: Date;
    completedAt?: Date;
    tags: string[];
    userGuess?: number;
    actualAmount?: number;
    userGuessCount?: number;
    actualCount?: number;
    probingDepth?: number; // Tracks number of Layer 2 probing exchanges (0-3)
  };
}

// =============================================================================
// Message Types
// =============================================================================

export type MessageRole = "assistant" | "user";
export type QuickReplyColor = "yellow" | "white";

export interface QuickReplyOption {
  id: string;
  label: string;
  emoji?: string;
  value: string;
  color?: QuickReplyColor;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  options?: QuickReplyOption[];
  isFixedQuestion?: boolean;
  isStreaming?: boolean;
}

// =============================================================================
// LLM Types
// =============================================================================

export interface LLMResponse {
  message: string;
  options?: QuickReplyOption[];
  assignedMode?: CheckInMode;
  shouldTransition?: boolean;
  exitGracefully?: boolean;
}

export interface CheckInContext {
  transaction: Transaction;
  session: CheckInSession;
  userResponses: string[];
}

// =============================================================================
// UI State Types
// =============================================================================

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  session: CheckInSession | null;
}

export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_SESSION"; payload: Partial<CheckInSession> }
  | { type: "RESET" };

// =============================================================================
// Weekly Summary Types
// =============================================================================

export interface WeeklySummary {
  totalSpent: number;
  previousWeekSpent: number;
  percentageChange: number;
  transactionCount: number;
  topCategory: TransactionCategory;
  pendingCheckIns: number;
}
