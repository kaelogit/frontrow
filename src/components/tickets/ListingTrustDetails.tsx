import Link from "next/link";
import {
  Armchair,
  Calendar,
  QrCode,
  ScrollText,
  Shield,
  Store,
  type LucideIcon,
} from "lucide-react";
import { getEventMatchDisplay } from "@/lib/events/match-display";
import { SITE_NAME } from "@/lib/constants";
import type { EventWithRelations, TicketListing } from "@/types/database";
import { formatEventDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ListingTrustDetailsProps {
  event: EventWithRelations;
  listing: TicketListing;
  ticketCount: number;
  className?: string;
}

interface DetailRow {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}

const GENERIC_PERK =
  /^(clear view|fan favorite|amazing|great|good|aisle seat|front row|second row|third row|\d+ tickets together|\d+ - \d+ tickets together)/i;

function sellerNotesFromListing(listing: TicketListing): string[] {
  const notes = listing.perks.filter((perk) => !GENERIC_PERK.test(perk.trim()));
  if (notes.length > 0) return notes;
  return [
    "Please note that you will need to use an iOS or Android mobile device to gain entry to your event.",
  ];
}

function buildDetailRows(
  event: EventWithRelations,
  listing: TicketListing,
  ticketCount: number
): DetailRow[] {
  const match = getEventMatchDisplay(event);
  const venueLine = event.venue
    ? `${event.venue.name}, ${event.venue.city}${event.venue.country ? `, ${event.venue.country}` : ""}`
    : "Venue TBA";

  const seatedTogether =
    ticketCount > 1 ||
    listing.perks.some((p) => /together|adjacent|side by side/i.test(p));

  const rows: DetailRow[] = [];

  if (seatedTogether) {
    rows.push({
      icon: Armchair,
      title: "You'll be seated together",
      description: "You are guaranteed to be sitting next to each other.",
    });
  }

  rows.push({
    icon: QrCode,
    title: "Mobile Tickets",
    description: "Mobile Tickets",
  });

  const sellerNotes = sellerNotesFromListing(listing);
  rows.push({
    icon: ScrollText,
    title: "Notes from the seller",
    description: sellerNotes.join(" "),
  });

  rows.push({
    icon: Shield,
    title: "Buyer's Guarantee Protected",
    description: `Your tickets are covered by ${SITE_NAME}'s 100% Buyer Guarantee.`,
    href: "/guarantee",
  });

  rows.push({
    icon: Store,
    title: `Sold by ${SITE_NAME}`,
    description: `You will complete checkout on ${SITE_NAME}.`,
  });

  const eventTitle = event.subtitle
    ? `${match.headline} | ${event.subtitle.replace(/ · World Cup 2026$/i, "")}`
    : match.headline;

  rows.push({
    icon: Calendar,
    title: eventTitle,
    description: `${formatEventDate(event.event_date, event.event_time)}\n${venueLine}`,
  });

  return rows;
}

export function ListingTrustDetails({
  event,
  listing,
  ticketCount,
  className,
}: ListingTrustDetailsProps) {
  const rows = buildDetailRows(event, listing, ticketCount);

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white", className)}>
      <ul className="divide-y divide-slate-100">
        {rows.map((row) => {
          const Icon = row.icon;
          const content = (
            <>
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-800" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{row.title}</p>
                {row.description.split("\n").map((line, i) => (
                  <p
                    key={`${row.title}-${i}`}
                    className="mt-0.5 text-sm leading-relaxed text-slate-500"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </>
          );

          return (
            <li key={row.title}>
              {row.href ? (
                <Link
                  href={row.href}
                  className="flex gap-4 px-5 py-4 transition hover:bg-slate-50"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex gap-4 px-5 py-4">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
