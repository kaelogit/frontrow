import Link from "next/link";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/EventForm";
import { getAdminEventById, getAdminLookups } from "@/lib/events/admin-events";
import { hasSupabaseConfig } from "@/lib/supabase/admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getAdminEventById(id);
  return { title: event ? `Edit — ${event.title}` : "Edit event" };
}

export default async function AdminEditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const [event, lookups] = await Promise.all([
    getAdminEventById(id),
    getAdminLookups(),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/events" className="text-sm text-zinc-500 hover:text-zinc-300">
        ← Events
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit event</h1>
      <p className="mt-1 text-zinc-500">{event.title}</p>

      {created === "1" && (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Event created.{" "}
          <Link href={`/admin/events/${id}/listings`} className="underline">
            Add ticket listings →
          </Link>
        </p>
      )}

      <div className="mt-4">
        <Link
          href={`/admin/events/${id}/listings`}
          className="inline-flex rounded-lg border border-card-border px-4 py-2 text-sm hover:bg-card"
        >
          Manage listings
        </Link>
      </div>

      <div className="mt-8">
        <EventForm
          mode="edit"
          event={event}
          lookups={lookups}
          supabaseReady={hasSupabaseConfig()}
        />
      </div>
    </div>
  );
}
