import Image from "next/image";
import { ChevronRight, MapPin } from "lucide-react";
import type { EventWithRelations } from "@/types/database";
import { MatchTeamsRow } from "@/components/events/MatchTeamsRow";
import { TrackEventClickLink } from "@/components/events/TrackEventClickLink";
import { getEventMatchDisplay } from "@/lib/events/match-display";
import {
  formatEventDateColumn,
  formatMatchLabel,
  getEventScarcityBadge,
  getEventTicketHref,
} from "@/lib/events/event-scarcity";
import { resolveEventHeroImage } from "@/lib/images";
import { formatPrice } from "@/lib/utils";
import { useDisplayCurrency, useFxSettings } from "@/components/site-settings/SiteSettingsProvider";
import { formatDisplayPrice } from "@/lib/fx/format";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventWithRelations;
  /** grid = image card for homepage; list = compact row for browse */
  variant?: "grid" | "list";
}

export function EventCard({ event, variant = "list" }: EventCardProps) {
  const match = getEventMatchDisplay(event);
  const dateCol = formatEventDateColumn(event.event_date, event.event_time);
  const matchLabel = formatMatchLabel(event.subtitle);
  const scarcityBadge = getEventScarcityBadge(event);
  const href = getEventTicketHref(event);
  const fx = useFxSettings();
  const displayCurrency = useDisplayCurrency();

  const location = event.venue
    ? `${event.venue.name}, ${event.venue.city}`
    : "Venue TBA";

  const { src: imageSrc, usePhoto } = resolveEventHeroImage(
    event.slug,
    event.competition?.slug ?? null,
    event.match_number,
    event.image_url
  );

  const mediaBlock = usePhoto ? (
    <Image
      src={imageSrc}
      alt={match.headline}
      fill
      className="object-cover transition duration-500 group-hover:scale-105"
      sizes={variant === "grid" ? "(max-width: 768px) 100vw, 33vw" : "144px"}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 px-4">
      <MatchTeamsRow event={event} variant="hero" showHeadline />
    </div>
  );

  if (variant === "grid") {
    return (
      <TrackEventClickLink
        eventSlug={event.slug}
        href={href}
        className="group card-shadow flex flex-col overflow-hidden rounded-xl bg-white transition duration-300 hover:ring-2 hover:ring-sky-200 sm:rounded-2xl"
      >
        <div className="relative aspect-[2/1] overflow-hidden sm:aspect-[16/10]">
          {mediaBlock}
          {event.competition && (
            <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-slate-800 shadow-sm backdrop-blur sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
              {event.competition.name}
            </span>
          )}
          {scarcityBadge && (
            <span
              className={cn(
                "absolute left-2 top-8 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm sm:left-3 sm:top-12 sm:px-2.5 sm:text-xs",
                scarcityBadge.className
              )}
            >
              {scarcityBadge.label}
            </span>
          )}
          {event.min_price != null && (
            <div className="absolute bottom-2 right-2 rounded-md bg-slate-900/85 px-2 py-1 text-[11px] font-bold text-white backdrop-blur sm:bottom-3 sm:right-3 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-sm">
              from{" "}
              {event.currency === "USD"
                ? formatDisplayPrice({
                    usdAmount: event.min_price,
                    displayCurrency,
                    fx,
                  })
                : formatPrice(event.min_price, event.currency)}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <MatchTeamsRow event={event} variant="compact" className="mb-2 sm:mb-3" />
          {match.hasTbd && (
            <h3 className="text-sm font-bold leading-tight text-slate-900 group-hover:text-sky-600 sm:text-base">
              {match.headline}
            </h3>
          )}
          {matchLabel && (
            <p className={`text-xs text-slate-500 sm:text-sm ${match.hasTbd ? "mt-0.5 sm:mt-1" : ""}`}>
              {matchLabel}
            </p>
          )}
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500 sm:mt-3 sm:gap-1.5 sm:text-sm">
            <MapPin className="h-3 w-3 shrink-0 text-sky-500 sm:h-3.5 sm:w-3.5" />
            <span className="truncate">{location}</span>
          </p>
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5 sm:mt-4 sm:pt-4">
            <span className="text-[10px] text-slate-500 sm:text-xs">
              {dateCol.weekday}, {dateCol.month} {dateCol.day}
            </span>
            <span className="flex items-center text-xs font-semibold text-sky-600 group-hover:underline sm:text-sm">
              See tickets
              <ChevronRight className="ml-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </div>
        </div>
      </TrackEventClickLink>
    );
  }

  return (
    <TrackEventClickLink
      eventSlug={event.slug}
      href={href}
      className="group card-shadow flex overflow-hidden rounded-2xl bg-white transition duration-300 hover:ring-2 hover:ring-sky-200"
    >
      <div className="relative hidden w-28 shrink-0 sm:block sm:w-36">
        {usePhoto ? (
          <Image
            src={imageSrc}
            alt={match.headline}
            fill
            className="object-cover"
            sizes="144px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 p-2">
            <MatchTeamsRow event={event} variant="hero" />
          </div>
        )}
      </div>

      <div className="flex w-[72px] shrink-0 flex-col items-center justify-center border-r border-slate-100 bg-slate-50 px-2 py-4 text-center sm:w-20">
        <span className="text-xs font-semibold uppercase tracking-wide text-sky-600">
          {dateCol.weekday}
        </span>
        <span className="text-2xl font-bold leading-none text-slate-900">{dateCol.day}</span>
        <span className="mt-0.5 text-xs font-medium text-slate-500">{dateCol.month}</span>
        {dateCol.time && (
          <span className="mt-2 text-[10px] font-medium text-slate-400">{dateCol.time}</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <MatchTeamsRow event={event} variant="compact" />
          {event.min_price != null && (
            <span className="shrink-0 text-sm font-bold text-slate-900">
              from{" "}
              {event.currency === "USD"
                ? formatDisplayPrice({
                    usdAmount: event.min_price,
                    displayCurrency,
                    fx,
                  })
                : formatPrice(event.min_price, event.currency)}
            </span>
          )}
        </div>

        {match.hasTbd && (
          <p className="mt-2 text-sm font-bold text-slate-900 group-hover:text-sky-600">
            {match.headline}
          </p>
        )}

        {matchLabel && (
          <p className="mt-1 text-sm font-medium text-slate-600">{matchLabel}</p>
        )}

        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />
          <span className="truncate">{location}</span>
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap gap-2">
            {scarcityBadge && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scarcityBadge.className}`}
              >
                {scarcityBadge.label}
              </span>
            )}
          </div>
          <span className="flex items-center text-sm font-semibold text-sky-600 group-hover:underline">
            See tickets
            <ChevronRight className="ml-0.5 h-4 w-4" />
          </span>
        </div>
      </div>
    </TrackEventClickLink>
  );
}
