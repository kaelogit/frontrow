"use client";

import { useEffect, useState } from "react";

interface PaymentCountdownProps {
  expiresAt: string;
  onExpired?: () => void;
  className?: string;
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

  return (
    <p
      className={`text-sm font-medium ${expired ? "text-red-600" : "text-amber-700"} ${className}`}
    >
      {expired ? "Expired" : `Time left: ${formatRemaining(remaining)}`}
    </p>
  );
}
