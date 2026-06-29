"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { EventWithRelations } from "@/types/database";
import { EventCard } from "@/components/events/EventCard";
import { HubGridCard } from "@/components/marketing/HubGridCard";
import {
  isWorldCupFinalEvent,
  WorldCupFinalSpotlight,
} from "@/components/marketing/WorldCupFinalSpotlight";
import {
  WORLD_CUP_CITIES,
  WORLD_CUP_HUB_TABS,
  WORLD_CUP_STAGES,
  WORLD_CUP_STAGE_CARDS,
  WORLD_CUP_TEAMS,
  filterEventsByHubTab,
  type WorldCupHubTab,
} from "@/lib/marketing/world-cup-nav";
import { cn } from "@/lib/utils";

interface WorldCupHubProps {
  events: EventWithRelations[];
}

export function WorldCupHub({ events }: WorldCupHubProps) {
  const [tab, setTab] = useState<WorldCupHubTab>("all");

  const filteredEvents = useMemo(
    () => filterEventsByHubTab(events, tab),
    [events, tab]
  );

  const finalEvent = useMemo(
    () => events.find(isWorldCupFinalEvent),
    [events]
  );

  const matchEvents = useMemo(
    () => filteredEvents.filter((e) => !isWorldCupFinalEvent(e)),
    [filteredEvents]
  );

  const showFinalSpotlight =
    finalEvent && (tab === "all" || tab === "final");

  const stageMeta =
    tab !== "all" && tab !== "teams" && tab !== "cities"
      ? WORLD_CUP_STAGES[tab]
      : null;

  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Tab bar — horizontal scroll with edge fade hint */}
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {WORLD_CUP_HUB_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                tab === t.id
                  ? "bg-emerald-600 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
              )}
            >
              {t.label}
            </button>
          ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-50 to-transparent" />
        </div>

        {/* Stage intro */}
        {stageMeta && (
          <div className="mt-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">{stageMeta.title}</h2>
            <p className="mt-2 max-w-2xl text-slate-600">{stageMeta.description}</p>
            <Link
              href={stageMeta.href}
              className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-600 hover:underline"
            >
              View all {stageMeta.title.toLowerCase()} matches
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Browse by stage — All games tab */}
        {tab === "all" && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">Browse by stage</h2>
            <p className="mt-1 text-sm text-slate-600">
              Knockout rounds from the Round of 32 through the Final
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {WORLD_CUP_STAGE_CARDS.map((item) => (
                <HubGridCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Teams grid */}
        {tab === "teams" && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">Browse by national team</h2>
            <p className="mt-1 text-sm text-slate-600">
              All 48 World Cup 2026 finalists
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {WORLD_CUP_TEAMS.map((item) => (
                <HubGridCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Cities grid */}
        {tab === "cities" && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-slate-900">Host cities</h2>
            <p className="mt-1 text-sm text-slate-600">
              16 venues across USA, Canada and Mexico
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {WORLD_CUP_CITIES.map((item) => (
                <HubGridCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Final spotlight */}
        {showFinalSpotlight && finalEvent && (
          <div className="mt-10">
            <WorldCupFinalSpotlight event={finalEvent} />
          </div>
        )}

        {/* Match cards — all games + stage-filtered */}
        {(tab === "all" || stageMeta) && (
          <div className={cn(tab === "teams" || tab === "cities" ? "hidden" : "mt-10")}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {tab === "all" ? "All World Cup matches" : "Matches"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {matchEvents.length} match{matchEvents.length !== 1 ? "es" : ""}{" "}
                  available
                </p>
              </div>
              <Link
                href="/events?competition=world-cup-2026"
                className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline"
              >
                Full schedule <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </div>

            {matchEvents.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="text-slate-600">No matches listed for this stage yet.</p>
                <Link
                  href="/events?competition=world-cup-2026"
                  className="mt-4 inline-block text-sm font-semibold text-emerald-600 hover:underline"
                >
                  Browse all World Cup events
                </Link>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {matchEvents.map((event) => (
                  <EventCard key={event.id} event={event} variant="grid" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stage tabs with no dedicated grid — show matches only (handled above) */}
      </div>
    </section>
  );
}
