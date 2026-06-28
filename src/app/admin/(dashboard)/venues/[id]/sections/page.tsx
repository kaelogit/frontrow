import Link from "next/link";
import { notFound } from "next/navigation";
import { VenueSectionsManager } from "@/components/admin/VenueSectionsManager";
import { hasSupabaseConfig } from "@/lib/supabase/admin";
import {
  getAdminVenueById,
  getStadiumSectionsWithRows,
} from "@/lib/venues/admin-venues";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await getAdminVenueById(id);
  return { title: venue ? `Sections — ${venue.name}` : "Venue sections" };
}

export default async function AdminVenueSectionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await getAdminVenueById(id);

  if (!venue) {
    notFound();
  }

  const sections = await getStadiumSectionsWithRows(id);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/admin/venues" className="text-zinc-500 hover:text-zinc-700">
          ← All venues
        </Link>
        <span className="text-zinc-300">·</span>
        <Link
          href={`/admin/venues/${id}/map`}
          className="text-sky-600 hover:underline"
        >
          Stadium map
        </Link>
      </div>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-zinc-900">Sections & rows</h1>
        <p className="mt-1 text-zinc-500">
          {venue.name} · {venue.city}, {venue.country}
        </p>
      </div>

      <div className="mt-8">
        <VenueSectionsManager
          venue={venue}
          sections={sections}
          supabaseReady={hasSupabaseConfig()}
        />
      </div>
    </div>
  );
}
