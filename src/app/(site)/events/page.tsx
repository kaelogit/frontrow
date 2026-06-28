import { Suspense } from "react";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { SocialProofBar } from "@/components/marketing/SocialProofBar";
import { getCompetitions, getEvents } from "@/lib/data/events";
import {
  applyBrowseFilters,
  buildBrowseFilterOptions,
  parseBrowseFilters,
} from "@/lib/events/browse-filters";
import { getSocialProofSettings } from "@/lib/social-proof/settings";

interface EventsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export const metadata = {
  title: "Events",
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const filters = parseBrowseFilters(params);

  const [baseEvents, competitions, socialProof] = await Promise.all([
    getEvents({ competition: filters.competition }),
    getCompetitions(),
    getSocialProofSettings(),
  ]);

  const filterOptions = buildBrowseFilterOptions(baseEvents);
  const events = applyBrowseFilters(baseEvents, filters);

  const activeComp = competitions.find((c) => c.slug === filters.competition);

  return (
    <div className="bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900">
          {activeComp ? activeComp.name : "All events"}
        </h1>

        <SocialProofBar settings={socialProof} className="mt-6" />

        <Suspense fallback={null}>
          <EventFilters
            competitions={competitions}
            options={filterOptions}
            resultCount={events.length}
          />
        </Suspense>

        {events.length === 0 ? (
          <p className="mt-16 text-center text-slate-500">
            No events match your filters.{" "}
            <a href="/events" className="font-semibold text-sky-600 hover:underline">
              Clear filters
            </a>
          </p>
        ) : (
          <div className="mt-10 flex flex-col gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
