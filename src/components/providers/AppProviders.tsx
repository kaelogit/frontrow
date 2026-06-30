"use client";

import type { ReactNode } from "react";
import { NavigationPendingProvider } from "@/components/providers/NavigationPendingProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <NavigationPendingProvider>{children}</NavigationPendingProvider>;
}
