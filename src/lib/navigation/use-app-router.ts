"use client";

import { useRouter } from "next/navigation";
import { useNavigationPending } from "@/components/providers/NavigationPendingProvider";

/** Router wrapper that shows the global progress bar on client navigations. */
export function useAppRouter() {
  const router = useRouter();
  const { startNavigation } = useNavigationPending();

  return {
    ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) => {
      startNavigation();
      return router.push(href, options);
    },
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) => {
      startNavigation();
      return router.replace(href, options);
    },
  };
}
