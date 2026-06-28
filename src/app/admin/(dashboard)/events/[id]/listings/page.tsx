import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingsManager } from "@/components/admin/ListingsManager";
import { getAdminEventById } from "@/lib/events/admin-events";
import {
  getAdminListingsForEvent,
  getSectionOptionsForEvent,
} from "@/lib/listings/admin-listings";
import { hasSupabaseConfig } from "@/lib/supabase/admin";
import { getRowLabelsBySectionForVenue } from "@/lib/venues/admin-venues";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getAdminEventById(id);
  return { title: event ? `Listings — ${event.title}` : "Listings" };
}

export default async function AdminEventListingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getAdminEventById(id);

  if (!event) {
    notFound();
  }

  const [listings, sectionOptions, rowLabelsBySection] = await Promise.all([
    getAdminListingsForEvent(id),
    Promise.resolve(getSectionOptionsForEvent(event)),
    event.venue_id && hasSupabaseConfig()
      ? getRowLabelsBySectionForVenue(event.venue_id)
      : Promise.resolve({}),
  ]);

  return (
    <div>
      <Link
        href={`/admin/events/${id}/edit`}
        className="text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← Edit event
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ticket listings</h1>
          <p className="mt-1 text-zinc-500">{event.title}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {event.seat_map_enabled && event.slug && (
            <Link
              href={`/events/${event.slug}/tickets`}
              target="_blank"
              className="rounded-lg border border-card-border px-4 py-2 text-sm hover:bg-card"
            >
              Preview tickets ↗
            </Link>
          )}
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="rounded-lg border border-card-border px-4 py-2 text-sm hover:bg-card"
          >
            Event page ↗
          </Link>
        </div>
      </div>

      {!event.seat_map_enabled && (
        <p className="mt-4 text-sm text-amber-200/80">
          Tip: enable <strong>seat map</strong> on the event to use the interactive
          ticket flow.
        </p>
      )}

      <div className="mt-8">
        <ListingsManager
          eventId={id}
          currency={event.currency}
          listings={listings}
          sectionNumbers={sectionOptions.sections}
          zones={sectionOptions.zones}
          stadiumMapSlug={event.venue?.stadium_map_slug}
          rowLabelsBySection={rowLabelsBySection}
          supabaseReady={hasSupabaseConfig()}
        />
      </div>
    </div>
  );
}
