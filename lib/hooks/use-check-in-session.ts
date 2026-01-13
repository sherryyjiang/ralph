// Check-In Session State Management with useReducer
// Manages the full lifecycle of a check-in conversation

import { useReducer, useCallback } from "react";
import type {
  CheckInSession,
  CheckInStatus,
  CheckInLayer,
  CheckInMode,
  Message,
  QuickReplyOption,
  ShoppingPath,
  ImpulseSubPath,
  DealSubPath,
  Transaction,
  TransactionCategory,
} from "@/lib/types";

// ═══════════════════════════════════════════════════════════════
// STATE TYPES
// ═══════════════════════════════════════════════════════════════

export interface CheckInState {
  session: CheckInSession;
  isLoading: boolean;
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════
// ACTION TYPES
// ═══════════════════════════════════════════════════════════════

export type CheckInAction =
  | { type: "START_SESSION" }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "ADD_ASSISTANT_MESSAGE"; payload: { content: string; options?: QuickReplyOption[]; isFixedQuestion?: boolean } }
  | { type: "START_STREAMING_MESSAGE" }
  | { type: "APPEND_STREAMING_CONTENT"; payload: { content: string } }
  | { type: "FINISH_STREAMING_MESSAGE"; payload: { options?: QuickReplyOption[] } }
  | { type: "ADD_USER_MESSAGE"; payload: { content: string } }
  | { type: "SET_PATH"; payload: ShoppingPath }
  | { type: "SET_SUB_PATH"; payload: ImpulseSubPath | DealSubPath }
  | { type: "SET_MODE"; payload: CheckInMode }
  | { type: "SET_LAYER"; payload: CheckInLayer }
  | { type: "SET_STATUS"; payload: CheckInStatus }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USER_GUESS"; payload: number }
  | { type: "SET_ACTUAL_AMOUNT"; payload: number }
  | { type: "SET_USER_GUESS_COUNT"; payload: number }
  | { type: "SET_ACTUAL_COUNT"; payload: number }
  | { type: "ADD_TAG"; payload: string }
  | { type: "COMPLETE_SESSION" }
  | { type: "DISMISS_SESSION" };

// ═══════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function checkInReducer(state: CheckInState, action: CheckInAction): CheckInState {
  switch (action.type) {
    case "START_SESSION":
      return {
        ...state,
        session: {
          ...state.session,
          status: "in_progress",
          metadata: {
            ...state.session.metadata,
            startedAt: new Date(),
          },
        },
      };

    case "ADD_MESSAGE":
      return {
        ...state,
        session: {
          ...state.session,
          messages: [...state.session.messages, action.payload],
        },
      };

    case "ADD_ASSISTANT_MESSAGE":
      return {
        ...state,
        session: {
          ...state.session,
          messages: [
            ...state.session.messages,
            {
              id: generateMessageId(),
              role: "assistant",
              content: action.payload.content,
              timestamp: new Date(),
              options: action.payload.options,
              isFixedQuestion: action.payload.isFixedQuestion,
            },
          ],
        },
      };

    case "ADD_USER_MESSAGE":
      return {
        ...state,
        session: {
          ...state.session,
          messages: [
            ...state.session.messages,
            {
              id: generateMessageId(),
              role: "user",
              content: action.payload.content,
              timestamp: new Date(),
            },
          ],
        },
      };

    case "SET_PATH":
      return {
        ...state,
        session: {
          ...state.session,
          path: action.payload,
        },
      };

    case "SET_SUB_PATH":
      return {
        ...state,
        session: {
          ...state.session,
          subPath: action.payload,
        },
      };

    case "SET_MODE":
      return {
        ...state,
        session: {
          ...state.session,
          mode: action.payload,
        },
      };

    case "SET_LAYER":
      return {
        ...state,
        session: {
          ...state.session,
          currentLayer: action.payload,
        },
      };

    case "SET_STATUS":
      return {
        ...state,
        session: {
          ...state.session,
          status: action.payload,
        },
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "SET_USER_GUESS":
      return {
        ...state,
        session: {
          ...state.session,
          metadata: {
            ...state.session.metadata,
            userGuess: action.payload,
          },
        },
      };

    case "SET_ACTUAL_AMOUNT":
      return {
        ...state,
        session: {
          ...state.session,
          metadata: {
            ...state.session.metadata,
            actualAmount: action.payload,
          },
        },
      };

    case "SET_USER_GUESS_COUNT":
      return {
        ...state,
        session: {
          ...state.session,
          metadata: {
            ...state.session.metadata,
            userGuessCount: action.payload,
          },
        },
      };

    case "SET_ACTUAL_COUNT":
      return {
        ...state,
        session: {
          ...state.session,
          metadata: {
            ...state.session.metadata,
            actualCount: action.payload,
          },
        },
      };

    case "ADD_TAG":
      return {
        ...state,
        session: {
          ...state.session,
          metadata: {
            ...state.session.metadata,
            tags: [...state.session.metadata.tags, action.payload],
          },
        },
      };

    case "COMPLETE_SESSION":
      return {
        ...state,
        session: {
          ...state.session,
          status: "completed",
          metadata: {
            ...state.session.metadata,
            completedAt: new Date(),
          },
        },
      };

    case "DISMISS_SESSION":
      return {
        ...state,
        session: {
          ...state.session,
          status: "dismissed",
          metadata: {
            ...state.session.metadata,
            completedAt: new Date(),
          },
        },
      };

    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

function createInitialSession(
  sessionId: string,
  transaction: Transaction
): CheckInSession {
  return {
    id: sessionId,
    transactionId: transaction.id,
    type: transaction.category,
    status: "pending",
    currentLayer: 1,
    messages: [],
    metadata: {
      tags: [],
    },
  };
}

function createInitialState(
  sessionId: string,
  transaction: Transaction
): CheckInState {
  return {
    session: createInitialSession(sessionId, transaction),
    isLoading: false,
    error: null,
  };
}

export function useCheckInSession(sessionId: string, transaction: Transaction) {
  const [state, dispatch] = useReducer(
    checkInReducer,
    createInitialState(sessionId, transaction)
  );

  // ═══════════════════════════════════════════════════════════
  // ACTION DISPATCHERS
  // ═══════════════════════════════════════════════════════════

  const startSession = useCallback(() => {
    dispatch({ type: "START_SESSION" });
  }, []);

  const addAssistantMessage = useCallback(
    (content: string, options?: QuickReplyOption[], isFixedQuestion?: boolean) => {
      dispatch({
        type: "ADD_ASSISTANT_MESSAGE",
        payload: { content, options, isFixedQuestion },
      });
    },
    []
  );

  const addUserMessage = useCallback((content: string) => {
    dispatch({ type: "ADD_USER_MESSAGE", payload: { content } });
  }, []);

  const setPath = useCallback((path: ShoppingPath) => {
    dispatch({ type: "SET_PATH", payload: path });
  }, []);

  const setSubPath = useCallback((subPath: ImpulseSubPath | DealSubPath) => {
    dispatch({ type: "SET_SUB_PATH", payload: subPath });
  }, []);

  const setMode = useCallback((mode: CheckInMode) => {
    dispatch({ type: "SET_MODE", payload: mode });
  }, []);

  const setLayer = useCallback((layer: CheckInLayer) => {
    dispatch({ type: "SET_LAYER", payload: layer });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const setUserGuess = useCallback((guess: number) => {
    dispatch({ type: "SET_USER_GUESS", payload: guess });
  }, []);

  const setActualAmount = useCallback((amount: number) => {
    dispatch({ type: "SET_ACTUAL_AMOUNT", payload: amount });
  }, []);

  const setUserGuessCount = useCallback((count: number) => {
    dispatch({ type: "SET_USER_GUESS_COUNT", payload: count });
  }, []);

  const setActualCount = useCallback((count: number) => {
    dispatch({ type: "SET_ACTUAL_COUNT", payload: count });
  }, []);

  const addTag = useCallback((tag: string) => {
    dispatch({ type: "ADD_TAG", payload: tag });
  }, []);

  const completeSession = useCallback(() => {
    dispatch({ type: "COMPLETE_SESSION" });
  }, []);

  const dismissSession = useCallback(() => {
    dispatch({ type: "DISMISS_SESSION" });
  }, []);

  return {
    // State
    session: state.session,
    messages: state.session.messages,
    isLoading: state.isLoading,
    error: state.error,
    currentLayer: state.session.currentLayer,
    currentPath: state.session.path,
    currentSubPath: state.session.subPath,
    currentMode: state.session.mode,
    status: state.session.status,

    // Actions
    startSession,
    addAssistantMessage,
    addUserMessage,
    setPath,
    setSubPath,
    setMode,
    setLayer,
    setLoading,
    setError,
    setUserGuess,
    setActualAmount,
    setUserGuessCount,
    setActualCount,
    addTag,
    completeSession,
    dismissSession,
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getCheckInTypeLabel(category: TransactionCategory): string {
  switch (category) {
    case "shopping":
      return "Shopping Check-In";
    case "food":
      return "Food Check-In";
    case "coffee":
      return "Coffee & Treats Check-In";
  }
}
