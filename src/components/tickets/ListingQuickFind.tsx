"use client";

import type { QuickFind } from "@/lib/tickets/filters";
import { cn } from "@/lib/utils";

interface ListingQuickFindProps {
  value: QuickFind;
  onChange: (v: QuickFind) => void;
}

const OPTIONS: { value: QuickFind; label: string; hint: string }[] = [
  { value: "top_value", label: "Top value", hint: "Best view scores" },
  { value: "cheapest", label: "Cheapest", hint: "Lowest prices" },
  { value: "most_discounted", label: "Most discounted", hint: "Biggest savings" },
];

export function ListingQuickFind({ value, onChange }: ListingQuickFindProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">
        What can we help you find?
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(value === opt.value ? null : opt.value)}
            className={cn(
              "rounded-lg border px-3 py-2 text-left text-xs transition",
              value === opt.value
                ? "border-sky-400 bg-sky-50 text-sky-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-sky-200"
            )}
          >
            <span className="font-semibold">{opt.label}</span>
            <span className="mt-0.5 block text-slate-500">{opt.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
