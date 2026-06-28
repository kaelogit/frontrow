import Link from "next/link";
import { getAdminEvents } from "@/lib/events/admin-events";
import { formatEventDate, formatPrice, isUuid } from "@/lib/utils";
import { eventHasTbdTeams } from "@/lib/events/match-display";
import { hasSupabaseConfig } from "@/lib/supabase/admin";
import { shouldUseMockData } from "@/lib/data/mock-mode";

function ticketCount(event: Awaited<ReturnType<typeof getAdminEvents>>[number]) {
  const listings = event.ticket_listings ?? [];
  if (listings.length > 0) {
    return listings.reduce(
      (sum, l) => sum + (l.quantity_available ?? 0),
      0
    );
  }
  const categories = event.ticket_categories ?? [];
  return categories.reduce((sum, c) => sum + c.quantity_available, 0);
}

export default async function AdminEventsPage() {
  const events = await getAdminEvents();
  const supabaseReady = hasSupabaseConfig();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Events</h1>
        {supabaseReady ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/events/import"
              className="rounded-lg border border-card-border px-4 py-2 text-sm font-semibold hover:bg-card"
            >
              Import CSV
            </Link>
            <Link
              href="/admin/events/new"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black"
            >
              + Add event
            </Link>
          </div>
        ) : (
          <span className="text-xs text-zinc-500">Connect Supabase to add events</span>
        )}
      </div>

      {!supabaseReady && !shouldUseMockData() && (
        <p className="mt-4 text-sm text-amber-200/80">
          Connect Supabase to manage live events. Production will not show demo data.
        </p>
      )}

      {shouldUseMockData() && (
        <p className="mt-4 text-sm text-amber-200/80">
          Development mode — showing mock events (no Supabase keys in{" "}
          <code className="text-amber-100">.env.local</code>).
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-xl border border-card-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-card-border bg-card text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Tickets</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const canEdit = supabaseReady && isUuid(event.id);
              return (
                <tr key={event.id} className="border-b border-card-border/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-zinc-500">{event.subtitle}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {eventHasTbdTeams(event) && (
                        <span className="inline-block rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-medium text-amber-200">
                          TBD teams
                        </span>
                      )}
                      {event.seat_map_enabled && (
                        <span className="inline-block text-xs text-accent">Map enabled</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatEventDate(event.event_date, event.event_time)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-zinc-400">{event.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {event.min_price != null
                      ? formatPrice(event.min_price, event.currency)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{ticketCount(event)} left</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      {canEdit && (
                        <>
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="text-accent hover:underline"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/listings`}
                            className="text-accent hover:underline"
                          >
                            Listings
                          </Link>
                        </>
                      )}
                      <Link
                        href={`/events/${event.slug}`}
                        className="text-zinc-400 hover:text-white hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
