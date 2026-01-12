"use client";

import { useState, useEffect, useLayoutEffect, KeyboardEvent } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  // Check localStorage first
  const storedTheme = localStorage.getItem("ralph-theme") as Theme | null;
  if (storedTheme) {
    return storedTheme;
  }
  // Fall back to system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTodos(): Todo[] {
  const stored = localStorage.getItem("ralph-todos");
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [newlyAddedId, setNewlyAddedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Initialize state from localStorage on client mount
  // Using useLayoutEffect to prevent flash of wrong theme
  useLayoutEffect(() => {
    const initialTheme = getInitialTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: hydrating state from localStorage on mount
    setTheme(initialTheme);
    
    const initialTodos = getInitialTodos();
    setTodos(initialTodos);
    setIsLoaded(true);
    
    // Apply theme class immediately
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Mark initial mount complete after a brief delay for stagger animations
    setTimeout(() => {
      setIsInitialMount(false);
    }, 500);
  }, []);

  // Apply theme class to document when theme changes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("ralph-theme", newTheme);
  };

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ralph-todos", JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const addTodo = () => {
    if (inputValue.trim() === "") return;
    
    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
    };
    
    setNewlyAddedId(newTodo.id);
    setTodos([...todos, newTodo]);
    setInputValue("");
    
    // Clear animation state after animation completes
    setTimeout(() => setNewlyAddedId(null), 300);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setDeletingId(id);
    // Delay actual removal for animation
    setTimeout(() => {
      setTodos(todos.filter((todo) => todo.id !== id));
      setDeletingId(null);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-100 to-gray-100 transition-colors duration-300 dark:from-violet-950 dark:via-slate-900 dark:to-zinc-900">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed right-4 top-4 z-50 rounded-full border border-gray-200 bg-white/80 p-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl dark:border-white/10 dark:bg-white/10"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          // Sun icon for dark mode (click to switch to light)
          <svg
            className="h-5 w-5 text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          // Moon icon for light mode (click to switch to dark)
          <svg
            className="h-5 w-5 text-slate-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </button>

      <div className="mx-auto max-w-xl px-6 py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-serif text-5xl font-light tracking-tight text-slate-800 transition-colors duration-300 dark:text-white">
            My Todos
          </h1>
          <p className="mt-2 text-sm text-slate-500 transition-colors duration-300 dark:text-violet-300/60">
            {todos.filter((t) => !t.completed).length} remaining ·{" "}
            {todos.filter((t) => t.completed).length} done
          </p>
        </div>

        {/* Input */}
        <div className="relative mb-8">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-lg text-slate-800 placeholder-slate-400 shadow-sm transition-all duration-300 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/30 dark:shadow-none"
          />
          <button
            onClick={addTodo}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Add
          </button>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 && isLoaded && (
            <div className="animate-in fade-in duration-500 rounded-2xl border border-dashed border-gray-200 px-8 py-16 text-center transition-colors duration-300 dark:border-white/10">
              {/* Clipboard illustration with floating animation */}
              <div className="mx-auto mb-6 w-20 h-20 animate-bounce [animation-duration:3s]">
                <svg
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="clipboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  {/* Clipboard body */}
                  <rect x="12" y="16" width="56" height="56" rx="6" fill="url(#clipboardGradient)" opacity="0.15" />
                  <rect x="12" y="16" width="56" height="56" rx="6" stroke="url(#clipboardGradient)" strokeWidth="2" fill="none" />
                  {/* Clipboard clip */}
                  <rect x="28" y="10" width="24" height="12" rx="3" fill="url(#clipboardGradient)" />
                  {/* Check lines */}
                  <path d="M26 36L32 42L42 30" stroke="url(#clipboardGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                  <rect x="48" y="34" width="12" height="3" rx="1.5" fill="url(#clipboardGradient)" opacity="0.4" />
                  <path d="M26 52L32 58L42 46" stroke="url(#clipboardGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                  <rect x="48" y="50" width="12" height="3" rx="1.5" fill="url(#clipboardGradient)" opacity="0.4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-600 dark:text-white/70 mb-2">
                Ready to be productive?
              </h3>
              <p className="text-sm text-slate-400 dark:text-white/40">
                Add your first task above to get started
              </p>
            </div>
          )}
          
          {todos.map((todo, index) => (
            <div
              key={todo.id}
              style={{
                animationDelay: isInitialMount ? `${index * 50}ms` : "0ms",
              }}
              className={`group flex items-center gap-4 rounded-xl border px-5 py-4 transition-all duration-300 ${
                todo.completed
                  ? "border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/[0.02]"
                  : "border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none"
              } ${
                newlyAddedId === todo.id
                  ? "animate-in slide-in-from-top-2 fade-in duration-300"
                  : ""
              } ${
                deletingId === todo.id
                  ? "animate-out slide-out-to-right fade-out duration-200"
                  : ""
              } ${
                isInitialMount && isLoaded
                  ? "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  : ""
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  todo.completed
                    ? "border-violet-500 bg-violet-500"
                    : "border-gray-300 hover:border-violet-400 dark:border-white/30"
                }`}
              >
                {todo.completed && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              {/* Text */}
              <span
                onClick={() => toggleTodo(todo.id)}
                className={`flex-1 cursor-pointer text-lg transition-all duration-300 ${
                  todo.completed
                    ? "text-slate-400 line-through dark:text-white/30"
                    : "text-slate-800 dark:text-white/90"
                }`}
              >
                {todo.text}
              </span>

              {/* Delete button */}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="rounded-lg p-2 text-slate-300 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100 dark:text-white/20"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Clear completed */}
        {todos.some((t) => t.completed) && (
          <button
            onClick={() => setTodos(todos.filter((t) => !t.completed))}
            className="mt-6 w-full rounded-lg border border-gray-200 py-3 text-sm text-slate-400 transition-colors duration-300 hover:border-gray-300 hover:text-slate-600 dark:border-white/10 dark:text-white/40 dark:hover:border-white/20 dark:hover:text-white/60"
          >
            Clear completed
          </button>
        )}
      </div>
    </div>
  );
}
