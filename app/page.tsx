"use client";

import { useState, useEffect, KeyboardEvent } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load todos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("ralph-todos");
    if (stored) {
      setTodos(JSON.parse(stored));
    }
    setIsLoaded(true);
  }, []);

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
    
    setTodos([...todos, newTodo]);
    setInputValue("");
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
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-slate-900 to-zinc-900">
      <div className="mx-auto max-w-xl px-6 py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-serif text-5xl font-light tracking-tight text-white">
            My Todos
          </h1>
          <p className="mt-2 text-sm text-violet-300/60">
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
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-lg text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-violet-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
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
            <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
              <p className="text-white/40">No todos yet. Add one above!</p>
            </div>
          )}
          
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`group flex items-center gap-4 rounded-xl border px-5 py-4 transition-all ${
                todo.completed
                  ? "border-white/5 bg-white/[0.02]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  todo.completed
                    ? "border-violet-500 bg-violet-500"
                    : "border-white/30 hover:border-violet-400"
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
                className={`flex-1 cursor-pointer text-lg transition-all ${
                  todo.completed
                    ? "text-white/30 line-through"
                    : "text-white/90"
                }`}
              >
                {todo.text}
              </span>

              {/* Delete button */}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="rounded-lg p-2 text-white/20 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
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
            className="mt-6 w-full rounded-lg border border-white/10 py-3 text-sm text-white/40 transition-colors hover:border-white/20 hover:text-white/60"
          >
            Clear completed
          </button>
        )}
      </div>
    </div>
  );
}
