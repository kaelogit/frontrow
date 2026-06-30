"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentCountdownProps {
  expiresAt: string;
  onExpired?: () => void;
  className?: string;
  variant?: "inline" | "badge";
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PaymentCountdown({
  expiresAt,
  onExpired,
  className = "",
  variant = "badge",
}: PaymentCountdownProps) {
  const [remaining, setRemaining] = useState(
    () => new Date(expiresAt).getTime() - Date.now()
  );

  useEffect(() => {
    const tick = () => {
      const ms = new Date(expiresAt).getTime() - Date.now();
      setRemaining(ms);
      if (ms <= 0) onExpired?.();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpired]);

  const expired = remaining <= 0;
  const label = expired ? "Expired" : formatRemaining(remaining);

  if (variant === "inline") {
    return (
      <p
        className={cn(
          "text-sm font-medium",
          expired ? "text-red-600" : "text-amber-700",
          className
        )}
      >
        {expired ? "Expired" : `Time left: ${label}`}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tabular-nums",
        expired
          ? "bg-red-50 text-red-700 ring-1 ring-red-200"
          : "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
        className
      )}
    >
      <Clock className="h-4 w-4 shrink-0" aria-hidden />
      <span>{expired ? "Time expired" : label}</span>
    </div>
  );
}
