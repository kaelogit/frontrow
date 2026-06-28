"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEventClick } from "@/lib/analytics/event-clicks";

type TrackEventClickLinkProps = ComponentProps<typeof Link> & {
  eventSlug: string;
};

export function TrackEventClickLink({
  eventSlug,
  onClick,
  ...props
}: TrackEventClickLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackEventClick(eventSlug);
        onClick?.(e);
      }}
    />
  );
}
