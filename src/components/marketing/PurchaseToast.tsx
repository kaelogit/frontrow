"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import {
  buildPurchaseToastPool,
  formatPurchaseToast,
  type PurchaseToastMessage,
} from "@/lib/social-proof/purchase-toasts";
import { cn } from "@/lib/utils";

const ROTATE_MS = 11_000;
const INITIAL_DELAY_MS = 2_500;
const FADE_MS = 400;

interface PurchaseToastProps {
  className?: string;
}

export function PurchaseToast({ className }: PurchaseToastProps) {
  const pool = useMemo(
    () => buildPurchaseToastPool(14, Math.floor(Date.now() / 3_600_000)),
    []
  );
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const message: PurchaseToastMessage = pool[index % pool.length];

  useEffect(() => {
    let cancelled = false;
    let rotateTimer: ReturnType<typeof setTimeout>;

    const show = () => {
      if (!cancelled) setVisible(true);
    };

    const hide = () => {
      if (!cancelled) setVisible(false);
    };

    const scheduleRotate = () => {
      rotateTimer = setTimeout(() => {
        hide();
        setTimeout(() => {
          if (cancelled) return;
          setIndex((i) => (i + 1) % pool.length);
          show();
          scheduleRotate();
        }, FADE_MS);
      }, ROTATE_MS);
    };

    const initial = setTimeout(() => {
      show();
      scheduleRotate();
    }, INITIAL_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearTimeout(rotateTimer);
    };
  }, [pool.length]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-4 left-4 z-30 max-w-[min(100vw-2rem,22rem)] sm:bottom-6 sm:left-6",
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-3 shadow-lg backdrop-blur-sm transition-all duration-500 motion-reduce:transition-none",
          visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        )}
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <ShoppingBag className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-slate-900">
            {formatPurchaseToast(message)}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{message.eventLabel}</p>
        </div>
      </div>
    </div>
  );
}
