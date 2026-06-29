import Link from "next/link";
import { ArrowLeft, Heart, Share2, X } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Logo } from "@/components/brand/Logo";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";
import { getEventMatchDisplay } from "@/lib/events/match-display";
import { getEventTicketHref } from "@/lib/events/event-scarcity";
import type { EventWithRelations } from "@/types/database";
import { formatEventDate } from "@/lib/utils";

interface TicketFlowHeaderProps {
  event: EventWithRelations;
  breadcrumbs?: BreadcrumbItem[];
  showBackToTickets?: boolean;
  onBack?: () => void;
  backLabel?: string;
  compact?: boolean;
  /** Single-line sticky bar when main header scrolls away */
  collapsed?: boolean;
}

export function TicketFlowHeader({
  event,
  breadcrumbs,
  showBackToTickets,
  onBack,
  backLabel = "Back",
  compact = false,
  collapsed = false,
}: TicketFlowHeaderProps) {
  const match = getEventMatchDisplay(event);
  const venueName = event.venue?.name ?? "Venue TBA";
  const venueLine = event.venue
    ? `${event.venue.name}, ${event.venue.city}, ${event.venue.country}`
    : "Venue TBA";

  const headerLabel = event.competition?.slug === "world-cup-2026"
    ? `World Cup Tickets · ${venueName}`
    : `${event.competition?.name ?? "Tickets"} · ${venueName}`;

  const titleLine = event.subtitle
    ? `${match.headline} — ${event.subtitle.replace(/ · World Cup 2026$/i, "")}`
    : match.headline;

  const backHref = showBackToTickets
    ? getEventTicketHref(event)
    : `/events/${event.slug}`;

  const backControl = onBack ? (
    <button
      type="button"
      onClick={onBack}
      className="rounded-lg p-2 hover:bg-slate-100"
      aria-label={backLabel}
    >
      {compact || collapsed ? <X className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
    </button>
  ) : (
    <Link
      href={backHref}
      className="rounded-lg p-2 hover:bg-slate-100"
      aria-label={backLabel}
    >
      <ArrowLeft className="h-5 w-5" />
    </Link>
  );

  if (collapsed) {
    return (
      <header className="border-b border-slate-200 bg-white text-slate-900">
        <div className="mx-auto flex max-w-[1800px] items-center gap-2 px-4 py-2 sm:px-6">
          {backControl}
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
            {titleLine}
          </p>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-slate-200 bg-white text-slate-900">
      {!compact && (
        <div className="border-b border-slate-100">
          <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-2.5 sm:px-6">
            <Logo size="sm" />
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="rounded-md border border-slate-200 px-2 py-1 font-medium">USD</span>
              <span className="rounded-md border border-slate-200 px-2 py-1 font-medium">EN</span>
            </div>
          </div>
        </div>
      )}

      {breadcrumbs && breadcrumbs.length > 0 ? (
        <div className="border-b border-slate-100 px-4 py-2 sm:px-6">
          <div className="mx-auto max-w-[1800px]">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-[1800px] items-start gap-3 px-4 py-3 sm:px-6">
        {backControl}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{headerLabel}</p>
          <h1 className="mt-0.5 text-base font-bold leading-snug sm:text-lg">{titleLine}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {formatEventDate(event.event_date, event.event_time)}
          </p>
          <p className="text-sm text-slate-500">{venueLine}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Favorite"
          >
            <Heart className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
