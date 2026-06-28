"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { readCheckoutSession } from "@/lib/checkout/storage";

export default function LegacyCheckoutRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventSlug = searchParams.get("event");

  useEffect(() => {
    const session = readCheckoutSession();
    const slug = eventSlug ?? session?.eventSlug;

    if (slug) {
      router.replace(`/events/${slug}/checkout`);
      return;
    }

    router.replace("/events");
  }, [eventSlug, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
    </div>
  );
}
