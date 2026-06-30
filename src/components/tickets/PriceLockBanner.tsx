"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

const LOCK_SECONDS = 10 * 60;
const STORAGE_PREFIX = "frontrowly:price-lock:";

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface PriceLockBannerProps {
  /** Timer runs only when true (checkout). Omit on browse/review pages. */
  active?: boolean;
  /** Stable key so refresh does not reset the lock (e.g. checkout session id). */
  lockKey?: string | null;
}

export function PriceLockBanner({ active = false, lockKey = null }: PriceLockBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState(LOCK_SECONDS);

  useEffect(() => {
    if (!active || !lockKey) return;

    const storageKey = `${STORAGE_PREFIX}${lockKey}`;
    let startedAt = sessionStorage.getItem(storageKey);
    if (!startedAt) {
      startedAt = String(Date.now());
      sessionStorage.setItem(storageKey, startedAt);
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - Number(startedAt)) / 1000);
      setSecondsLeft(Math.max(0, LOCK_SECONDS - elapsed));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active, lockKey]);

  if (!active) return null;

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
