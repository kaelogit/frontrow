"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

const LOCK_SECONDS = 10 * 60;

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PriceLockBanner() {
  const [secondsLeft, setSecondsLeft] = useState(LOCK_SECONDS);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm">
      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
      <div>
        <p className="font-medium text-slate-900">
          Your price is locked for {formatCountdown(secondsLeft)}.
        </p>
        <p className="text-slate-600">Complete checkout to secure this price.</p>
      </div>
    </div>
  );
}
