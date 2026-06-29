"use client";

import { useRouter } from "next/navigation";
import type { EventWithRelations, TicketListing } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { TicketFlowHeader } from "@/components/tickets/TicketFlowHeader";
import { TicketFlowFooter } from "@/components/tickets/TicketFlowFooter";
import { ScarcityBanner } from "@/components/tickets/ScarcityBanner";
import { PriceLockBanner } from "@/components/tickets/PriceLockBanner";
import { OrderSummaryCard } from "@/components/tickets/OrderSummaryCard";
import { MobileCheckoutBar } from "@/components/tickets/MobileCheckoutBar";
import { ListingTrustDetails } from "@/components/tickets/ListingTrustDetails";
import { ExpandableEventDescription } from "@/components/tickets/ExpandableEventDescription";
import { buildEventBreadcrumbs } from "@/lib/navigation/breadcrumbs";
import { saveCheckoutSession } from "@/lib/checkout/storage";
import { scarcityPercent } from "@/lib/tickets/filters";

interface ListingReviewClientProps {
  event: EventWithRelations;
  listing: TicketListing;
  ticketCount: number;
}

function listingLabel(listing: TicketListing): string {
  if (listing.product_name) return listing.product_name;
  if (listing.section_number) {
    return `Section ${listing.section_number}${listing.row_label ? ` · Row ${listing.row_label}` : ""}`;
  }
  return "Tickets";
}

function urgencyNote(listing: TicketListing, ticketCount: number): string | null {
  if (listing.quantity_available <= 2 && listing.section_number && listing.row_label) {
    return `Last tickets remaining in Row ${listing.row_label} in Section ${listing.section_number}`;
  }
  if (listing.quantity_available <= ticketCount) {
    return `Only ${listing.quantity_available} ticket${listing.quantity_available !== 1 ? "s" : ""} left at this price`;
  }
  return null;
}

export function ListingReviewClient({
  event,
  listing,
  ticketCount,
}: ListingReviewClientProps) {
  const router = useRouter();
  const scarcity = event.scarcity_override ?? scarcityPercent([listing]);
  const label = listingLabel(listing);
  const sectionTitle = listing.section_number
    ? `Section ${listing.section_number}${listing.row_label ? ` · Row ${listing.row_label}` : ""}`
    : label;

  const wasPrice = listing.compare_at_price;
  const showDeal = wasPrice != null && wasPrice > listing.price;

  const checkoutItem = {
    listingId: listing.id,
    categoryName: label,
    sectionNumber: listing.section_number ?? undefined,
    rowLabel: listing.row_label ?? undefined,
    quantity: ticketCount,
    unitPrice: listing.price,
  };

  const handleContinue = () => {
    saveCheckoutSession({
      eventId: event.id,
      eventSlug: event.slug,
      eventTitle: event.title,
      currency: event.currency,
      items: [checkoutItem],
    });
    router.push(`/events/${event.slug}/checkout`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <TicketFlowHeader
        event={event}
        breadcrumbs={buildEventBreadcrumbs(event, "review", sectionTitle)}
        showBackToTickets
        compact
      />
      <ScarcityBanner percent={scarcity} />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 pb-28 sm:px-6 lg:flex-row lg:pb-6">
        <div className="flex-1">
          <div className="mb-4 lg:hidden">
            <PriceLockBanner />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{sectionTitle}</h2>
            <p className="mt-1 text-slate-600">
              {ticketCount} ticket{ticketCount !== 1 ? "s" : ""} · Seated together
            </p>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-6">
              <div>
                {showDeal && (
                  <p className="text-sm text-slate-400 line-through">
                    {formatPrice(wasPrice, event.currency)}
                  </p>
                )}
                <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {formatPrice(listing.price, event.currency)}
                  <span className="ml-2 text-base font-normal text-slate-500">per ticket</span>
                </p>
                {listing.view_score != null && listing.view_label && (
                  <p className="mt-1 text-sm font-semibold text-sky-700">
                    {listing.view_score} · {listing.view_label}
                  </p>
                )}
              </div>
              {listing.section_number && (
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-500 sm:h-20 sm:w-20">
                  <span className="text-[10px] uppercase">Section</span>
                  <span className="text-lg font-bold text-sky-600 sm:text-xl">
                    §{listing.section_number}
                  </span>
                </div>
              )}
            </div>

            <ul className="mt-6 flex flex-wrap gap-2">
              {listing.badges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700"
                >
                  {badge}
                </li>
              ))}
              {listing.perks.map((perk) => (
                <li
                  key={perk}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                >
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          {event.description && (
            <ExpandableEventDescription
              description={event.description}
              className="mt-4"
            />
          )}

          <ListingTrustDetails
            event={event}
            listing={listing}
            ticketCount={ticketCount}
            className="mt-4"
          />
        </div>

        <aside className="hidden w-full shrink-0 space-y-4 lg:block lg:w-[380px]">
          <PriceLockBanner />
          <OrderSummaryCard
            items={[checkoutItem]}
            currency={event.currency}
            urgencyNote={urgencyNote(listing, ticketCount)}
            showContinue
            onContinue={handleContinue}
          />
        </aside>
      </div>

      <MobileCheckoutBar
        items={[checkoutItem]}
        currency={event.currency}
        primaryLabel="Continue"
        onPrimary={handleContinue}
      />

      <TicketFlowFooter showGuarantee={false} />
    </div>
  );
}
