"use client";

import { useEffect, useState } from "react";
import { formatFullCount } from "@/lib/social-proof/jitter";

interface AnimatedCountProps {
  value: number;
  durationMs?: number;
  className?: string;
}

export function AnimatedCount({
  value,
  durationMs = 1400,
  className,
}: AnimatedCountProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <span className={className}>{formatFullCount(display)}</span>;
}
