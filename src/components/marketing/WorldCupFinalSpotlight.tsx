"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Trophy } from "lucide-react";
import type { EventWithRelations } from "@/types/database";
import { resolveEventHeroImage } from "@/lib/images";
import { getEventTicketHref } from "@/lib/events/event-scarcity";
import { formatEventDate, formatPrice } from "@/lib/utils";
import { useDisplayCurrency, useFxSettings } from "@/components/site-settings/SiteSettingsProvider";
import { formatDisplayPrice } from "@/lib/fx/format";

const FINAL_SLUG = "world-cup-final-match-104";

export function isWorldCupFinalEvent(event: EventWithRelations): boolean {
  return event.slug === FINAL_SLUG || /\bfinal\b/i.test(event.title);
}

interface WorldCupFinalSpotlightProps {
  event: EventWithRelations;
}

export function WorldCupFinalSpotlight({ event }: WorldCupFinalSpotlightProps) {
  const fx = useFxSettings();
  const displayCurrency = useDisplayCurrency();
  const { src: imageSrc } = resolveEventHeroImage(
    event.slug,
    event.competition?.slug ?? null,
    event.match_number,
    event.image_url
  );

  const location = event.venue
    ? `${event.venue.name} · ${event.venue.city}, ${event.venue.country}`
    : "MetLife Stadium · East Rutherford, NJ";

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl bg-slate-950 shadow-2xl sm:rounded-3xl">
      <div className="relative min-h-[320px] sm:min-h-[420px]">
        <Image
          src={imageSrc}
          alt="World Cup 2026 Final at MetLife Stadium"
          fill
          className="object-cover opacity-50"
          sizes="(max-width: 1280px) 100vw, 1280px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-amber-950/50 sm:bg-gradient-to-r sm:from-slate-950 sm:via-slate-950/85 sm:to-amber-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.12),transparent_55%)]" />

        <div className="relative flex min-w-0 flex-col gap-5 p-4 sm:gap-8 sm:p-10 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10 lg:p-12">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold text-amber-200 sm:gap-2 sm:px-4 sm:py-1.5 sm:text-sm">
              <Trophy className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4" />
              Match 104 · The Final
            </div>

            <h2 className="mt-3 text-xl font-bold tracking-tight text-white sm:mt-5 sm:text-4xl lg:text-5xl">
              World Cup
              <span className="block bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Final 2026
              </span>
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-300 sm:mt-4 sm:text-base lg:text-lg">
              The pinnacle of world football — MetLife Stadium, New Jersey. Premium
              inventory from lower bowl to hospitality lounges.
            </p>

            <div className="mt-3 flex flex-col gap-1.5 sm:mt-5 sm:flex-row sm:flex-wrap sm:gap-3">
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-amber-400/25 bg-slate-900 px-2.5 py-1.5 text-[10px] font-medium text-white shadow-sm sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
                <Calendar className="h-3 w-3 shrink-0 text-amber-400 sm:h-4 sm:w-4" />
                <span className="truncate">
                  {formatEventDate(event.event_date, event.event_time)}
                </span>
              </span>
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-amber-400/25 bg-slate-900 px-2.5 py-1.5 text-[10px] font-medium text-white shadow-sm sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
                <MapPin className="h-3 w-3 shrink-0 text-amber-400 sm:h-4 sm:w-4" />
                <span className="truncate">{location}</span>
              </span>
            </div>

            {event.min_price != null && (
              <div className="mt-4 sm:mt-6">
                <p className="text-[10px] uppercase tracking-wider text-amber-200/80 sm:text-sm">
                  Tickets from
                </p>
                <p className="text-2xl font-bold text-white sm:text-4xl lg:text-5xl">
                  {event.currency === "USD"
                    ? formatDisplayPrice({
                        usdAmount: event.min_price,
                        displayCurrency,
                        fx,
                      })
                    : formatPrice(event.min_price, event.currency)}
                </p>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col items-center rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md sm:rounded-2xl sm:p-6 lg:p-8">
            <div className="flex items-center justify-center gap-3 sm:gap-5">
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-white/30 bg-white/5 text-white/60 sm:h-16 sm:w-16">
                  <span className="text-base font-bold sm:text-xl">?</span>
                </div>
                <span className="text-[10px] font-semibold text-white/80 sm:text-sm">TBD</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300/80 sm:text-base">
                vs
              </span>
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-white/30 bg-white/5 text-white/60 sm:h-16 sm:w-16">
                  <span className="text-base font-bold sm:text-xl">?</span>
                </div>
                <span className="text-[10px] font-semibold text-white/80 sm:text-sm">TBD</span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400 sm:mt-4 sm:text-sm">
              Finalists confirmed after the semifinals
            </p>

            <Link
              href={getEventTicketHref(event)}
              className="mt-4 inline-flex w-full min-h-10 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:brightness-105 sm:mt-6 sm:w-auto sm:min-h-12 sm:gap-2 sm:px-8 sm:py-3.5 sm:text-base"
            >
              Get Final tickets
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            <Link
              href="/world-cup-2026/stages/final"
              className="mt-2.5 text-[11px] font-semibold text-amber-200/90 hover:text-amber-100 hover:underline sm:mt-4 sm:text-sm"
            >
              View Final pricing & schedule
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
