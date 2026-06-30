"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type NavigationPendingContextValue = {
  pending: boolean;
  startNavigation: () => void;
};

const NavigationPendingContext = createContext<NavigationPendingContextValue>({
  pending: false,
  startNavigation: () => {},
});

export function useNavigationPending() {
  return useContext(NavigationPendingContext);
}

function RouteProgressBar({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[300] h-1 overflow-hidden bg-sky-100"
      aria-hidden
    >
      <div className="h-full w-1/3 animate-frontrowly-progress bg-gradient-to-r from-sky-500 to-indigo-600" />
    </div>
  );
}

export function NavigationPendingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  const startNavigation = useCallback(() => {
    setPending(true);
  }, []);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element).closest("a");
      if (!anchor?.href) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return;

      const next = `${url.pathname}${url.search}`;
      const current = `${window.location.pathname}${window.location.search}`;
      if (next !== current) startNavigation();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [startNavigation]);

  return (
    <NavigationPendingContext.Provider value={{ pending, startNavigation }}>
      <RouteProgressBar active={pending} />
      {children}
    </NavigationPendingContext.Provider>
  );
}
