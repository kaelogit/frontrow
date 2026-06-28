"use client";

import { useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { cn } from "@/lib/utils";

function syncChromeHeight(el: HTMLElement | null) {
  const height = el?.offsetHeight ?? 56;
  document.documentElement.style.setProperty("--site-chrome-height", `${height}px`);
}

export function SiteChrome() {
  const hidden = useHideOnScroll();
  const chromeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chromeRef.current;
    if (!el) return;

    syncChromeHeight(el);
    const observer = new ResizeObserver(() => syncChromeHeight(el));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={chromeRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-out will-change-transform",
        hidden && "-translate-y-full"
      )}
    >
      <Header />
    </div>
  );
}
