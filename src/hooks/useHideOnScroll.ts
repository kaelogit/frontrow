"use client";

import { useEffect, useRef, useState } from "react";

const MIN_SCROLL_TO_HIDE = 72;
const DELTA_THRESHOLD = 14;

/** Hides chrome when scrolling down; shows again when scrolling up. */
export function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const hiddenRef = useRef(false);

  useEffect(() => {
    hiddenRef.current = hidden;
  }, [hidden]);

  useEffect(() => {
    lastY.current = window.scrollY;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;

        if (y <= 16) {
          if (hiddenRef.current) setHidden(false);
        } else if (delta > DELTA_THRESHOLD && y > MIN_SCROLL_TO_HIDE) {
          if (!hiddenRef.current) setHidden(true);
        } else if (delta < -DELTA_THRESHOLD) {
          if (hiddenRef.current) setHidden(false);
        }

        lastY.current = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}
