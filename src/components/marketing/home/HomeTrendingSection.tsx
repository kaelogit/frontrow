import type { EventWithRelations } from "@/types/database";
import { EventCard } from "@/components/events/EventCard";
import { SocialProofBar } from "@/components/marketing/SocialProofBar";
import type { SocialProofSettings } from "@/lib/social-proof/settings";
import Link from "next/link";

interface HomeTrendingSectionProps {
  events: EventWithRelations[];
  socialProof: SocialProofSettings;
}

export function HomeTrendingSection({ events, socialProof }: HomeTrendingSectionProps) {
  return (
    <section className="bg-slate-50 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <SocialProofBar settings={socialProof} className="mb-10" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">On sale now</h2>
            <p className="mt-2 text-slate-600">
              {events.length} World Cup matches with live inventory — updated daily
            </p>
          </div>
          <Link
            href="/events?competition=world-cup-2026"
            className="text-sm font-semibold text-sky-600 hover:underline"
          >
            View all matches →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 9).map((event) => (
            <EventCard key={event.id} event={event} variant="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}
