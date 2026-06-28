import type { EventWithRelations } from "@/types/database";
import { KnockoutMatchCard } from "@/components/marketing/home/KnockoutMatchCard";
import { SectionHeader } from "@/components/marketing/home/SectionHeader";

interface HomeKnockoutStagesSectionProps {
  quarterfinals: EventWithRelations[];
  semifinals: EventWithRelations[];
}

export function HomeKnockoutStagesSection({
  quarterfinals,
  semifinals,
}: HomeKnockoutStagesSectionProps) {
  if (quarterfinals.length === 0 && semifinals.length === 0) return null;

  return (
    <section className="bg-white py-12 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl space-y-12 sm:space-y-14">
        {quarterfinals.length > 0 && (
          <div>
            <div className="px-4 sm:px-0">
              <SectionHeader
                eyebrow="Knockout stage"
                title="Quarterfinals"
                description="Four knockout matches — July 9–11 across the USA"
                href="/world-cup-2026/stages/quarterfinals"
                linkLabel="Full QF schedule"
              />
            </div>

            {/* Mobile: horizontal slide */}
            <div className="mt-6 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory scrollbar-hide sm:hidden">
              {quarterfinals.map((event) => (
                <div
                  key={event.id}
                  className="w-[44vw] max-w-[168px] shrink-0 snap-start"
                >
                  <KnockoutMatchCard event={event} size="sm" />
                </div>
              ))}
            </div>

            <div className="mt-8 hidden grid-cols-2 gap-3 px-4 sm:grid sm:px-0 lg:grid-cols-4 lg:gap-4">
              {quarterfinals.map((event) => (
                <KnockoutMatchCard key={event.id} event={event} size="sm" />
              ))}
            </div>
          </div>
        )}

        {semifinals.length > 0 && (
          <div className="px-4 sm:px-0">
            <SectionHeader
              eyebrow="Knockout stage"
              title="Semifinals"
              description="Two matches decide who reaches the Final"
              href="/world-cup-2026/stages/semifinals"
              linkLabel="Full SF schedule"
            />
            <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
              {semifinals.map((event) => (
                <KnockoutMatchCard key={event.id} event={event} size="lg" />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
