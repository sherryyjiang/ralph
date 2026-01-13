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
 */
export type ImpulseSubPath = 
  | "saw_got_excited"    // [YELLOW] "I saw it and got excited"
  | "friend_recommended" // [WHITE] "A friend recommended it"
  | "better_deal"        // [YELLOW] "Found a better deal than expected"
  | "retail_therapy"     // [YELLOW] "Retail therapy moment";

/**
 * Sub-paths for deal/scarcity shopping (Fixed Question 2 responses)
 */
export type DealSubPath = 
  | "flash_sale"         // [YELLOW] "Flash sale / limited time"
  | "coupons"            // [WHITE] "I had coupons / cashback"
  | "price_drop"         // "Price dropped on wishlist item"
  | "bulk_discount";     // "Bulk discount opportunity"

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

export interface CheckInSession {
  id: string;
  transactionId: string;
  type: TransactionCategory;
  status: CheckInStatus;
  currentLayer: CheckInLayer;
  path?: CheckInPath;
  subPath?: ImpulseSubPath | DealSubPath;
  mode?: CheckInMode;
  messages: Message[];
  metadata: {
    startedAt?: Date;
    completedAt?: Date;
    tags: string[];
    userGuess?: number;
    actualAmount?: number;
    userGuessCount?: number;
    actualCount?: number;
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
