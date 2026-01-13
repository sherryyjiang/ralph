"use client";

import { useReducer, useCallback } from "react";
import {
  CheckInSession,
  Message,
  ChatState,
  ChatAction,
  Transaction,
  QuickReplyOption,
} from "@/lib/types";

// Initial state
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  session: null,
};

// Reducer function
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
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
        isLoading: false,
      };
    case "UPDATE_SESSION":
      return {
        ...state,
        session: state.session
          ? { ...state.session, ...action.payload }
          : null,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// Helper to create a message
function createMessage(
  role: Message["role"],
  content: string,
  options?: QuickReplyOption[],
  isFixedQuestion?: boolean
): Message {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: new Date(),
    options,
    isFixedQuestion,
  };
}

// Helper to create initial session
function createSession(
  sessionId: string,
  transaction: Transaction
): CheckInSession {
  return {
    id: sessionId,
    transactionId: transaction.id,
    type: transaction.category,
    status: "in_progress",
    currentLayer: 1,
    messages: [],
    metadata: {
      startedAt: new Date(),
      tags: [],
    },
  };
}

export interface UseCheckInSessionReturn {
  state: ChatState;
  initSession: (sessionId: string, transaction: Transaction) => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (
    content: string,
    options?: QuickReplyOption[],
    isFixedQuestion?: boolean
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateSession: (updates: Partial<CheckInSession>) => void;
  advanceLayer: () => void;
  setPath: (path: string) => void;
  setMode: (mode: string) => void;
  completeSession: () => void;
  reset: () => void;
}

export function useCheckInSession(): UseCheckInSessionReturn {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const initSession = useCallback(
    (sessionId: string, transaction: Transaction) => {
      const session = createSession(sessionId, transaction);
      dispatch({ type: "UPDATE_SESSION", payload: session });
    },
    []
  );

  const addUserMessage = useCallback((content: string) => {
    const message = createMessage("user", content);
    dispatch({ type: "ADD_MESSAGE", payload: message });
  }, []);

  const addAssistantMessage = useCallback(
    (
      content: string,
      options?: QuickReplyOption[],
      isFixedQuestion?: boolean
    ) => {
      const message = createMessage("assistant", content, options, isFixedQuestion);
      dispatch({ type: "ADD_MESSAGE", payload: message });
    },
    []
  );

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const updateSession = useCallback((updates: Partial<CheckInSession>) => {
    dispatch({ type: "UPDATE_SESSION", payload: updates });
  }, []);

  const advanceLayer = useCallback(() => {
    if (state.session && state.session.currentLayer < 3) {
      dispatch({
        type: "UPDATE_SESSION",
        payload: { currentLayer: (state.session.currentLayer + 1) as 1 | 2 | 3 },
      });
    }
  }, [state.session]);

  const setPath = useCallback((path: string) => {
    dispatch({
      type: "UPDATE_SESSION",
      payload: { path: path as CheckInSession["path"] },
    });
  }, []);

  const setMode = useCallback((mode: string) => {
    dispatch({ type: "UPDATE_SESSION", payload: { mode } });
  }, []);

  const completeSession = useCallback(() => {
    dispatch({
      type: "UPDATE_SESSION",
      payload: {
        status: "completed",
        metadata: {
          ...state.session?.metadata,
          completedAt: new Date(),
          tags: state.session?.metadata?.tags || [],
        },
      },
    });
  }, [state.session?.metadata]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    initSession,
    addUserMessage,
    addAssistantMessage,
    setLoading,
    setError,
    updateSession,
    advanceLayer,
    setPath,
    setMode,
    completeSession,
    reset,
  };
}
