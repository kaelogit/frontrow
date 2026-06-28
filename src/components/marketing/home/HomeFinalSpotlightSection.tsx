import type { EventWithRelations } from "@/types/database";
import { WorldCupFinalSpotlight } from "@/components/marketing/WorldCupFinalSpotlight";

interface HomeFinalSpotlightSectionProps {
  event: EventWithRelations;
}

export function HomeFinalSpotlightSection({ event }: HomeFinalSpotlightSectionProps) {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <WorldCupFinalSpotlight event={event} />
      </div>
    </section>
  );
}
