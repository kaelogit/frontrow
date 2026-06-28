import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import {
  StageMatchTable,
  StagePricingTable,
} from "@/components/marketing/StageMatchTable";
import { getEvents } from "@/lib/data/events";
import {
  filterEventsForStage,
  getAllWorldCupStageSlugs,
  getWorldCupStage,
  stagePageHref,
} from "@/lib/marketing/world-cup-stages";
import { WORLD_CUP_STAGE_PAGES } from "@/lib/marketing/world-cup-stages";

interface StagePageProps {
  params: Promise<{ stage: string }>;
}

export async function generateStaticParams() {
  return getAllWorldCupStageSlugs().map((stage) => ({ stage }));
}

export async function generateMetadata({ params }: StagePageProps) {
  const { stage: slug } = await params;
  const stage = getWorldCupStage(slug);
  if (!stage) return { title: "World Cup 2026" };

  return {
    title: stage.seoTitle,
    description: stage.seoDescription,
  };
}

export default async function WorldCupStagePage({ params }: StagePageProps) {
  const { stage: slug } = await params;
  const stage = getWorldCupStage(slug);

  if (!stage) {
    notFound();
  }

  const allEvents = await getEvents({ competition: "world-cup-2026" });
  const stageEvents = filterEventsForStage(allEvents, stage);

  return (
    <>
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <Image
          src={stage.image}
          alt={stage.title}
          fill
          className="object-cover opacity-35"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-800/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <Link
            href="/world-cup-2026"
            className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            World Cup 2026
          </Link>

          {stage.slug === "final" && (
            <span className="mt-6 inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200">
              <Trophy className="h-3.5 w-3.5" />
              Match 104 · MetLife Stadium
            </span>
          )}

          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{stage.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">{stage.description}</p>

          {stage.slug === "final" && (
            <Link
              href="/world-cup-2026/new-york"
              className="mt-6 inline-block text-sm font-semibold text-emerald-300 hover:underline"
            >
              New York / New Jersey host city →
            </Link>
          )}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
          {WORLD_CUP_STAGE_PAGES.map((s) => (
            <Link
              key={s.slug}
              href={stagePageHref(s.slug)}
              className={
                s.slug === stage.slug
                  ? "rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-emerald-300"
              }
            >
              {s.shortTitle}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-slate-900">{stage.shortTitle} schedule</h2>
          <p className="mt-2 text-slate-600">
            {stageEvents.length} match{stageEvents.length !== 1 ? "es" : ""} · click through
            for tickets
          </p>
          <div className="mt-8">
            <StageMatchTable stage={stage} events={stageEvents} />
          </div>
          <StagePricingTable stage={stage} />
        </div>
      </section>
    </>
  );
}
