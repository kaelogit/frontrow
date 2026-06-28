"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import type { EventWithRelations } from "@/types/database";
import type { WorldCupCity } from "@/lib/marketing/world-cup-cities";
import {
  getEventUrgency,
  urgencyBadgeClass,
} from "@/lib/marketing/world-cup-cities";
import { MatchTeamsRow } from "@/components/events/MatchTeamsRow";
import { getEventMatchDisplay } from "@/lib/events/match-display";
import { getEventTicketHref } from "@/lib/events/event-scarcity";
import { formatEventDate, formatPrice } from "@/lib/utils";
import { getEventImage } from "@/lib/images";
import Image from "next/image";

interface CityMatchListProps {
  city: WorldCupCity;
  events: EventWithRelations[];
}

type MonthFilter = "all" | "june" | "july";

export function CityMatchList({ city, events }: CityMatchListProps) {
  const [month, setMonth] = useState<MonthFilter>("all");

  const filtered = useMemo(() => {
    if (month === "all") return events;
    if (month === "june") {
      return events.filter((e) => e.event_date.startsWith("2026-06"));
    }
    return events.filter((e) => e.event_date.startsWith("2026-07"));
  }, [events, month]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <Calendar className="h-4 w-4" />
          Filter by date
        </span>
        {(
          [
            { id: "all" as const, label: "All dates" },
            { id: "june" as const, label: "June 2026" },
            { id: "july" as const, label: "July 2026" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setMonth(opt.id)}
            className={
              month === opt.id
                ? "rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white"
                : "rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-emerald-300"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-600">
        {filtered.length} match{filtered.length !== 1 ? "es" : ""} in {city.name}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-600">No matches in this date range yet.</p>
          <Link
            href="/world-cup-2026"
            className="mt-4 inline-block text-sm font-semibold text-emerald-600 hover:underline"
          >
            Browse all World Cup cities
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filtered.map((event) => {
            const urgency = getEventUrgency(event);
            const match = getEventMatchDisplay(event);
            const imageSrc =
              event.image_url ??
              getEventImage(event.slug, event.competition?.slug ?? null);

            return (
              <li key={event.id}>
                <Link
                  href={getEventTicketHref(event)}
                  className="flex flex-col gap-4 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-32">
                    <Image
                      src={imageSrc}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <MatchTeamsRow event={event} variant="compact" />
                      {urgency && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${urgencyBadgeClass(urgency)}`}
                        >
                          {urgency}
                        </span>
                      )}
                    </div>
                    {match.hasTbd && (
                      <p className="mt-1 text-sm font-medium text-slate-700">{match.headline}</p>
                    )}
                    {event.subtitle && (
                      <p className="mt-0.5 text-sm text-slate-500">{event.subtitle}</p>
                    )}
                    <p className="mt-1 text-sm text-slate-600">
                      {formatEventDate(event.event_date, event.event_time)} ·{" "}
                      {event.venue?.name ?? city.venue}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:text-right">
                    {event.min_price != null && (
                      <div>
                        <p className="text-xs text-slate-500">From</p>
                        <p className="text-lg font-bold text-slate-900">
                          {formatPrice(event.min_price, event.currency)}
                        </p>
                      </div>
                    )}
                    <span className="flex items-center text-sm font-semibold text-emerald-600">
                      See tickets
                      <ChevronRight className="ml-0.5 h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
