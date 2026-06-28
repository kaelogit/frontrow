"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "frontrowly_trust_banner_dismissed";

export function TrustBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  if (!visible) return null;

  return (
    <div className="border-b border-sky-100 bg-sky-50 text-sm text-sky-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <p className="text-balance text-center text-xs sm:text-left sm:text-sm">
          Frontrowly is an independent ticket marketplace. Prices may be above or below face value.
        </p>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "1");
            setVisible(false);
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sky-700 hover:bg-sky-100"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
