"use client";

import { useState, KeyboardEvent } from "react";

interface CustomInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CustomInput({ onSend, disabled, placeholder = "Type your response..." }: CustomInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-[var(--peek-bg-card)] p-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-2 text-white placeholder-[var(--peek-text-muted)] outline-none text-sm disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="rounded-xl bg-[var(--peek-accent-orange)] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[var(--peek-accent-orange)]/80 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        Send
      </button>
    </div>
  );
}
