"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventWithRelations } from "@/types/database";
import { EventCard } from "@/components/events/EventCard";
import { SectionHeader } from "@/components/marketing/home/SectionHeader";
import { getTrendingSlugs } from "@/lib/analytics/event-clicks";

interface HomeTrendingNowSectionProps {
  events: EventWithRelations[];
}

export function HomeTrendingNowSection({ events }: HomeTrendingNowSectionProps) {
  const [trendingSlugs, setTrendingSlugs] = useState<string[]>([]);

  useEffect(() => {
    setTrendingSlugs(getTrendingSlugs(6));
  }, []);

  const trendingEvents = useMemo(() => {
    if (!trendingSlugs.length) return events.slice(0, 6);
    const bySlug = new Map(events.map((e) => [e.slug, e]));
    return trendingSlugs
      .map((slug) => bySlug.get(slug))
      .filter((e): e is EventWithRelations => e != null);
  }, [events, trendingSlugs]);

  if (trendingEvents.length === 0) return null;

  return (
    <section className="bg-white py-12 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-0">
        <SectionHeader
          eyebrow="Popular right now"
          title="Trending now"
          description="Most viewed matches — updates as fans browse tickets"
          href="/events?competition=world-cup-2026"
          linkLabel="Browse all"
        />
      </div>

      {/* Mobile: horizontal snap carousel */}
      <div className="mt-8 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory scrollbar-hide sm:hidden">
        {trendingEvents.map((event) => (
          <div
            key={event.id}
            className="w-[68vw] max-w-[260px] shrink-0 snap-start"
          >
            <EventCard event={event} variant="grid" />
          </div>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="mx-auto mt-10 hidden max-w-7xl grid-cols-2 gap-6 px-6 sm:grid lg:grid-cols-3">
        {trendingEvents.map((event) => (
          <EventCard key={event.id} event={event} variant="grid" />
        ))}
      </div>
    </section>
  );
}
