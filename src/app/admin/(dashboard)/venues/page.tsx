import Link from "next/link";
import {
  countRowsForVenue,
  countSectionsForVenue,
  getAdminVenues,
} from "@/lib/venues/admin-venues";
import { hasSupabaseConfig } from "@/lib/supabase/admin";
import { listStadiumMapSlugs } from "@/lib/stadium/registry";

export default async function AdminVenuesPage() {
  const venues = await getAdminVenues();
  const supabaseReady = hasSupabaseConfig();
  const programmaticMaps = listStadiumMapSlugs();

  const sectionCounts = supabaseReady
    ? await Promise.all(venues.map((v) => countSectionsForVenue(v.id)))
    : venues.map(() => 0);

  const rowCounts = supabaseReady
    ? await Promise.all(venues.map((v) => countRowsForVenue(v.id)))
    : venues.map(() => 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Venues</h1>
      <p className="mt-1 text-zinc-500">
        Upload SVG maps and sync section inventory per stadium
      </p>

      {!supabaseReady && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Connect Supabase to manage venue maps.
        </p>
      )}

      <p className="mt-4 text-xs text-zinc-500">
        Programmatic maps in code: {programmaticMaps.join(", ")}
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-card-border bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-card-border bg-slate-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Venue</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Map slug</th>
              <th className="px-4 py-3 font-medium">Sections</th>
              <th className="px-4 py-3 font-medium">Rows</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {venues.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No venues in database. Run World Cup seed SQL first.
                </td>
              </tr>
            ) : (
              venues.map((venue, index) => (
                <tr key={venue.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{venue.name}</p>
                    <p className="text-xs text-zinc-500">{venue.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {venue.city}, {venue.country}
                  </td>
                  <td className="px-4 py-3">
                    {venue.stadium_map_slug ? (
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800">
                        {venue.stadium_map_slug}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700">
                    {sectionCounts[index]}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700">
                    {rowCounts[index]}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {supabaseReady ? (
                      <div className="flex flex-col items-end gap-1 sm:flex-row sm:gap-3">
                        <Link
                          href={`/admin/venues/${venue.id}/map`}
                          className="font-semibold text-sky-600 hover:underline"
                        >
                          Map
                        </Link>
                        <Link
                          href={`/admin/venues/${venue.id}/sections`}
                          className="font-semibold text-sky-600 hover:underline"
                        >
                          Sections
                        </Link>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
