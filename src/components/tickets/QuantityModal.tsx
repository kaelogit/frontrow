"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityModalProps {
  open: boolean;
  value: number;
  max?: number;
  onChange: (qty: number) => void;
  onContinue: () => void;
}

export function QuantityModal({
  open,
  value,
  max = 4,
  onChange,
  onContinue,
}: QuantityModalProps) {
  if (!open) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qty-modal-title"
    >
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
        <h2
          id="qty-modal-title"
          className="text-center text-2xl font-bold text-slate-900"
        >
          How many tickets?
        </h2>
        <p className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          You&apos;ll be seated together
        </p>

        <div className="mt-8 flex justify-center gap-3">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold transition",
                value === n
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-700 hover:border-sky-300"
              )}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm leading-relaxed text-sky-900">
          Per the event organizer, each household is limited to 4 tickets per match
          and 40 tickets total for the competition, across all purchase and transfer
          methods.
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 py-3.5 font-semibold text-white shadow-md hover:brightness-105"
        >
          View tickets
        </button>
      </div>
    </div>
  );
}
