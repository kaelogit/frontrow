import type { TicketListing } from "@/types/database";
import { SectionViewPreview } from "@/components/stadium/SectionViewPreview";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: TicketListing;
  currency: string;
  ticketCount: number;
  venueAbbrev?: string;
  mapSlug?: string | null;
  onHover?: (section: string | null) => void;
  onView: (listing: TicketListing) => void;
  isBestDeal?: boolean;
}

export function ListingCard({
  listing,
  currency,
  ticketCount,
  mapSlug,
  onView,
  onHover,
  isBestDeal,
}: ListingCardProps) {
  const title =
    listing.product_name ??
    (listing.section_number
      ? `Section ${listing.section_number}`
      : "Ticket option");

  const rowLine = listing.row_label ? `Row ${listing.row_label}` : null;
  const wasPrice = listing.compare_at_price;
  const showDeal = wasPrice != null && wasPrice > listing.price;
  const onlyLeft = listing.quantity_available <= 4;

  return (
    <div
      onMouseEnter={() => onHover?.(listing.section_number)}
      onMouseLeave={() => onHover?.(null)}
      className="flex w-full gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-sky-200 hover:shadow-sm"
    >
      <SectionViewPreview
        mapSlug={mapSlug}
        sectionNumber={listing.section_number}
        variant="compact"
      />

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">
          {[rowLine, `${ticketCount} ticket${ticketCount !== 1 ? "s" : ""} together`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {listing.perks.slice(0, 2).map((perk) => (
            <li
              key={perk}
              className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
            >
              {perk}
            </li>
          ))}
          {isBestDeal && (
            <li className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              Best deal
            </li>
          )}
          {listing.badges.map((badge) => (
            <li
              key={badge}
              className="rounded bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700"
            >
              {badge}
            </li>
          ))}
        </ul>
        {onlyLeft && (
          <p className="mt-1.5 text-xs font-medium text-amber-700">
            Only {listing.quantity_available} left
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        <div className="text-right">
          {showDeal && (
            <p className="text-sm text-slate-400 line-through">
              {formatPrice(wasPrice, currency)}
            </p>
          )}
          <p className="text-xs font-medium text-emerald-600">
            {showDeal ? "Now" : ""}
          </p>
          <p className="text-xl font-bold text-slate-900">
            {formatPrice(listing.price, currency)}
          </p>
          {listing.view_score != null && listing.view_label && (
            <p className="mt-1 text-xs font-semibold text-sky-700">
              {listing.view_score} {listing.view_label}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onView(listing)}
          className={cn(
            "rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700",
            "hover:bg-sky-50"
          )}
        >
          View ticket
        </button>
      </div>
    </div>
  );
}
