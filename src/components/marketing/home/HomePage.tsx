import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/marketing/CategoryCard";
import { SectionHeader } from "@/components/marketing/home/SectionHeader";
import { HomeFinalSpotlightSection } from "@/components/marketing/home/HomeFinalSpotlightSection";
import { HomeHeroSection } from "@/components/marketing/home/HomeHeroSection";
import { HomeKnockoutStagesSection } from "@/components/marketing/home/HomeKnockoutStagesSection";
import { HomeOnSaleSection } from "@/components/marketing/home/HomeOnSaleSection";
import { HomeTrendingNowSection } from "@/components/marketing/home/HomeTrendingNowSection";
import {
  getViagogoLiveEvents,
  getWorldCupFinalEvent,
} from "@/lib/data/events";
import { eventMatchesRound } from "@/lib/events/browse-filters";
import { MARKETING_CATEGORIES } from "@/lib/marketing/categories";
import { IMAGES } from "@/lib/images";
import { getSocialProofSettings } from "@/lib/social-proof/settings";

function sortByDate(events: Awaited<ReturnType<typeof getViagogoLiveEvents>>) {
  return [...events].sort(
    (a, b) =>
      a.event_date.localeCompare(b.event_date) ||
      (a.event_time ?? "").localeCompare(b.event_time ?? "")
  );
}

export async function HomePage() {
  const [liveEvents, finalEvent, socialProof] = await Promise.all([
    getViagogoLiveEvents(),
    getWorldCupFinalEvent(),
    getSocialProofSettings(),
  ]);

  const onSale = liveEvents.filter((e) => e.slug !== "world-cup-final-match-104");
  const quarterfinals = sortByDate(
    liveEvents.filter((e) => eventMatchesRound(e, "quarterfinals"))
  );
  const semifinals = sortByDate(
    liveEvents.filter((e) => eventMatchesRound(e, "semifinals"))
  );

  return (
    <>
      <HomeHeroSection />

      <section className="bg-white px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="What are you going to see?"
            description="From the World Cup final to courtside NBA and sold-out concerts — find your next unforgettable experience."
            centered
          />
          <div className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
            {MARKETING_CATEGORIES.map((cat) => (
              <CategoryCard key={cat.slug} {...cat} />
            ))}
          </div>
        </div>
      </section>

      <HomeTrendingNowSection events={onSale} />

      <HomeOnSaleSection events={onSale} socialProof={socialProof} />

      <HomeKnockoutStagesSection
        quarterfinals={quarterfinals}
        semifinals={semifinals}
      />

      {finalEvent && <HomeFinalSpotlightSection event={finalEvent} />}

      <section className="px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-8 sm:gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl card-shadow">
            <Image
              src={IMAGES.experience}
              alt="Friends enjoying a live event"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 sm:text-sm">
              Why Frontrowly
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:mt-3 sm:text-3xl lg:text-4xl">
              More than a ticket — it&apos;s the experience
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:mt-4 sm:text-lg">
              We curate premium inventory for the events that matter most. Whether
              you&apos;re flying in for the World Cup or treating your team to a
              hospitality package, we make getting there simple.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-sky-600 hover:underline"
            >
              Learn more about us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 sm:pb-20">
        <div className="relative mx-auto min-h-[280px] max-w-7xl overflow-hidden rounded-2xl sm:min-h-[320px] sm:rounded-3xl">
          <Image
            src={IMAGES.categories["world-cup-2026"]}
            alt="World Cup 2026"
            fill
            className="object-cover"
            sizes="1280px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-teal-800/70" />
          <div className="relative px-5 py-10 sm:px-14 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200 sm:text-sm">
              FIFA World Cup 2026
            </p>
            <h2 className="mt-2 max-w-xl text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl lg:text-4xl">
              48 teams. 3 countries. One tournament of a lifetime.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-emerald-100 sm:mt-4 sm:text-base">
              Group stage, knockouts, and the final — browse every match on sale
              across USA, Canada and Mexico.
            </p>
            <Link
              href="/world-cup-2026"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 sm:mt-8 sm:w-auto sm:text-base"
            >
              Explore World Cup tickets
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
