import { notFound, redirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { getEventBySlug } from "@/lib/data/events";
import { getEventTicketHref } from "@/lib/events/event-scarcity";
import { getListingsForEvent } from "@/lib/data/listings";
import { enforceQueueOrRedirect } from "@/lib/queue/guard";
import { buildEventBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { ListingReviewClient } from "./ListingReviewClient";

interface ReviewPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ listing?: string; qty?: string }>;
}

export async function generateMetadata({ params }: ReviewPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Review tickets" };
  return { title: `Review tickets — ${event.title}` };
}

export default async function ListingReviewPage({ params, searchParams }: ReviewPageProps) {
  const { slug } = await params;
  const { listing: listingId, qty } = await searchParams;

  const event = await getEventBySlug(slug);
  if (!event) notFound();

  if (!listingId) {
    redirect(getEventTicketHref(event));
  }

  const ticketCount = Math.max(1, Math.min(10, parseInt(qty ?? "2", 10) || 2));

  await enforceQueueOrRedirect(event);

  const listings = await getListingsForEvent(event.id);
  const listing = listings.find((l) => l.id === listingId);

  if (!listing || listing.quantity_available < ticketCount) {
    redirect(getEventTicketHref(event));
  }

  const sectionTitle = listing.section_number
    ? `Section ${listing.section_number}${listing.row_label ? ` · Row ${listing.row_label}` : ""}`
    : listing.product_name ?? "Review listing";

  return (
    <>
      <JsonLd data={buildEventBreadcrumbJsonLd(event, "review", sectionTitle)} />
      <ListingReviewClient event={event} listing={listing} ticketCount={ticketCount} />
    </>
  );
}
