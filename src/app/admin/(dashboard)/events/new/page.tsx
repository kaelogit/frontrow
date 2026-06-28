import Link from "next/link";
import { EventForm } from "@/components/admin/EventForm";
import { getAdminLookups } from "@/lib/events/admin-events";
import { hasSupabaseConfig } from "@/lib/supabase/admin";

export const metadata = {
  title: "New event",
};

export default async function AdminNewEventPage() {
  const lookups = await getAdminLookups();

  return (
    <div>
      <Link href="/admin/events" className="text-sm text-zinc-500 hover:text-zinc-300">
        ← Events
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Add event</h1>
      <p className="mt-1 text-zinc-500">Create a match or concert listing</p>

      <div className="mt-8">
        <EventForm
          mode="create"
          lookups={lookups}
          supabaseReady={hasSupabaseConfig()}
        />
      </div>
    </div>
  );
}
