"use client";

import { QuickReplyOption } from "@/lib/types";

interface QuickReplyProps {
  option: QuickReplyOption;
  onSelect?: (value: string) => void;
}

export function QuickReply({ option, onSelect }: QuickReplyProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(option.value);
    }
  };

  const colorClasses = option.color === "yellow"
    ? "border-[var(--peek-accent-yellow)] text-[var(--peek-accent-yellow)] hover:bg-[var(--peek-accent-yellow)]/10"
    : "border-white/30 text-white hover:bg-white/10";

  return (
    <button
      onClick={handleClick}
      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${colorClasses}`}
    >
      <div className="flex items-center gap-2">
        {option.emoji && <span className="text-base">{option.emoji}</span>}
        <span>{option.label}</span>
      </div>
    </button>
  );
}
