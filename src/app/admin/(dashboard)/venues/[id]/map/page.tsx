import Link from "next/link";
import { notFound } from "next/navigation";
import { VenueMapManager } from "@/components/admin/VenueMapManager";
import { hasSupabaseConfig } from "@/lib/supabase/admin";
import {
  getAdminVenueById,
  getStadiumMapForVenue,
  getStadiumSectionsForVenue,
} from "@/lib/venues/admin-venues";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await getAdminVenueById(id);
  return { title: venue ? `Map — ${venue.name}` : "Venue map" };
}

export default async function AdminVenueMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await getAdminVenueById(id);

  if (!venue) {
    notFound();
  }

  const [stadiumMap, sections] = await Promise.all([
    getStadiumMapForVenue(id),
    getStadiumSectionsForVenue(id),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/admin/venues" className="text-zinc-500 hover:text-zinc-700">
          ← All venues
        </Link>
        <span className="text-zinc-300">·</span>
        <Link
          href={`/admin/venues/${id}/sections`}
          className="text-sky-600 hover:underline"
        >
          Sections & rows
        </Link>
      </div>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-zinc-900">Stadium map</h1>
        <p className="mt-1 text-zinc-500">
          {venue.name} · {venue.city}, {venue.country}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Venue slug: {venue.slug}
          {venue.stadium_map_slug ? ` · Map slug: ${venue.stadium_map_slug}` : ""}
        </p>
      </div>

      <div className="mt-8">
        <VenueMapManager
          venue={venue}
          stadiumMap={stadiumMap}
          sections={sections}
          supabaseReady={hasSupabaseConfig()}
        />
      </div>
    </div>
  );
}
