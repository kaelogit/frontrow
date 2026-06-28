import Image from "next/image";
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
import { cn } from "@/lib/utils";
import { ChevronRight, MapPin } from "lucide-react";

interface KnockoutMatchCardProps {
  event: EventWithRelations;
  size?: "sm" | "lg";
}

export function KnockoutMatchCard({ event, size = "sm" }: KnockoutMatchCardProps) {
  const match = getEventMatchDisplay(event);
  const dateCol = formatEventDateColumn(event.event_date, event.event_time);
  const matchLabel = formatMatchLabel(event.subtitle);
  const scarcityBadge = getEventScarcityBadge(event);
  const href = getEventTicketHref(event);
  const isSemifinal = size === "lg";

  const venueLine = event.venue
    ? `${event.venue.city}${event.venue.country ? ` · ${event.venue.country}` : ""}`
    : "Venue TBA";

  const { src: imageSrc, usePhoto } = resolveEventHeroImage(
    event.slug,
    event.competition?.slug ?? null,
    event.match_number,
    event.image_url
  );

  return (
    <TrackEventClickLink
      eventSlug={event.slug}
      href={href}
      className={cn(
        "group relative block w-full overflow-hidden rounded-xl shadow-md transition duration-300 hover:shadow-xl sm:rounded-2xl",
        isSemifinal
          ? "aspect-[16/11] ring-1 ring-amber-400/30 sm:aspect-[16/9]"
          : "aspect-[3/4] sm:aspect-[4/5]"
      )}
    >
      {usePhoto ? (
        <Image
          src={imageSrc}
          alt={match.headline}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes={
            isSemifinal
              ? "(max-width: 640px) 100vw, 50vw"
              : "(max-width: 640px) 45vw, 25vw"
          }
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 px-3">
          <MatchTeamsRow event={event} variant="hero" showHeadline />
        </div>
      )}

      {/* Stage-specific overlay gradient */}
      <div
        className={cn(
          "absolute inset-0",
          isSemifinal
            ? "bg-gradient-to-t from-indigo-950/95 via-indigo-950/50 to-amber-900/10"
            : "bg-gradient-to-t from-emerald-950/95 via-slate-900/45 to-transparent"
        )}
      />

      {isSemifinal && (
        <div className="absolute right-0 top-0 bg-gradient-to-l from-amber-400 to-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-950 sm:px-4 sm:text-xs">
          Semifinal
        </div>
      )}

      {!isSemifinal && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />
      )}

      {/* All copy lives on the image */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col",
          isSemifinal ? "gap-2 p-3 sm:gap-3 sm:p-5" : "gap-1.5 p-2.5 sm:gap-2 sm:p-4"
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded-full font-bold uppercase tracking-wide text-white backdrop-blur",
              isSemifinal
                ? "bg-indigo-500/80 px-2.5 py-0.5 text-[10px] sm:px-3 sm:text-xs"
                : "bg-emerald-600/80 px-2 py-0.5 text-[9px] sm:text-[10px]"
            )}
          >
            Match {event.match_number ?? "—"}
          </span>
          {scarcityBadge && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-semibold backdrop-blur",
                isSemifinal ? "text-[10px] sm:text-xs" : "text-[9px] sm:text-[10px]",
                scarcityBadge.className
              )}
            >
              {scarcityBadge.label}
            </span>
          )}
        </div>

        <MatchTeamsRow
          event={event}
          variant="inverse"
          className={isSemifinal ? "mt-0.5" : ""}
        />

        {match.hasTbd && (
          <p
            className={cn(
              "font-bold leading-tight text-white",
              isSemifinal ? "text-sm sm:text-base" : "text-xs sm:text-sm"
            )}
          >
            {match.headline}
          </p>
        )}

        {matchLabel && (
          <p
            className={cn(
              "text-white/75",
              isSemifinal ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs"
            )}
          >
            {matchLabel}
          </p>
        )}

        <div
          className={cn(
            "flex items-end justify-between gap-2 border-t border-white/15 pt-2",
            isSemifinal && "sm:pt-3"
          )}
        >
          <div className="min-w-0">
            <p
              className={cn(
                "text-white/90",
                isSemifinal ? "text-xs sm:text-sm" : "text-[10px] sm:text-xs"
              )}
            >
              {dateCol.weekday}, {dateCol.month} {dateCol.day}
              {dateCol.time ? ` · ${dateCol.time}` : ""}
            </p>
            <p
              className={cn(
                "mt-0.5 flex items-center gap-1 text-white/65",
                isSemifinal ? "text-[11px] sm:text-xs" : "text-[9px] sm:text-[10px]"
              )}
            >
              <MapPin className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
              <span className="truncate">{venueLine}</span>
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-0.5">
            {event.min_price != null && (
              <span
                className={cn(
                  "font-bold text-white",
                  isSemifinal ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                )}
              >
                {formatPrice(event.min_price, event.currency)}
              </span>
            )}
            <span
              className={cn(
                "flex items-center font-semibold text-amber-300 group-hover:underline",
                isSemifinal ? "text-[11px] sm:text-xs" : "text-[10px]"
              )}
            >
              Tickets
              <ChevronRight className="ml-0.5 h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </TrackEventClickLink>
  );
}
