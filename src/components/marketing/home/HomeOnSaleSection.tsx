import type { EventWithRelations } from "@/types/database";
import { EventCard } from "@/components/events/EventCard";
import { SocialProofBar } from "@/components/marketing/SocialProofBar";
import { SectionHeader } from "@/components/marketing/home/SectionHeader";
import type { SocialProofSettings } from "@/lib/social-proof/settings";

interface HomeOnSaleSectionProps {
  events: EventWithRelations[];
  socialProof: SocialProofSettings;
}

export function HomeOnSaleSection({ events, socialProof }: HomeOnSaleSectionProps) {
  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <SocialProofBar settings={socialProof} className="mb-8 sm:mb-10" />
        <SectionHeader
          eyebrow="Live inventory"
          title="On sale now"
          description={`${events.length} World Cup matches with live inventory`}
          href="/events?competition=world-cup-2026"
          linkLabel="View all matches"
        />
        <div className="mt-6 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {events.slice(0, 9).map((event) => (
            <EventCard key={event.id} event={event} variant="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}
