import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Trophy } from "lucide-react";
import { CityMatchList } from "@/components/marketing/CityMatchList";
import { getEvents } from "@/lib/data/events";
import {
  filterEventsForCity,
  getAllWorldCupCitySlugs,
  getWorldCupCity,
} from "@/lib/marketing/world-cup-cities";

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return getAllWorldCupCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }: CityPageProps) {
  const { city: slug } = await params;
  const city = getWorldCupCity(slug);
  if (!city) return { title: "World Cup 2026" };

  return {
    title: city.seoTitle,
    description: city.seoDescription,
  };
}

export default async function WorldCupCityPage({ params }: CityPageProps) {
  const { city: slug } = await params;
  const city = getWorldCupCity(slug);

  if (!city) {
    notFound();
  }

  const allEvents = await getEvents({ competition: "world-cup-2026" });
  const cityEvents = filterEventsForCity(allEvents, city);

  return (
    <>
      <section className="relative overflow-hidden bg-emerald-950 text-white">
        <Image
          src={city.image}
          alt={city.name}
          fill
          className="object-cover opacity-40"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/80 to-emerald-900/60" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <Link
            href="/world-cup-2026"
            className="inline-flex items-center gap-1 text-sm text-emerald-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            World Cup 2026
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {city.hostsFinal && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200">
                <Trophy className="h-3.5 w-3.5" />
                Final host city
              </span>
            )}
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              {city.country}
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            World Cup 2026 · {city.name}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-lg text-emerald-100">
            <MapPin className="h-5 w-5 shrink-0" />
            {city.venue} · {city.dateRangeLabel}
          </p>
          <p className="mt-4 max-w-2xl text-emerald-100/90">{city.description}</p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-lg font-bold text-slate-900">About {city.venue}</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">
            {city.venueBlurb}
          </p>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-slate-900">Matches in {city.name}</h2>
          <p className="mt-2 text-slate-600">
            Chronological schedule · verified resale tickets
          </p>
          <div className="mt-8">
            <CityMatchList city={city} events={cityEvents} />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-slate-600">
            Looking for other host cities?{" "}
            <Link href="/world-cup-2026" className="font-semibold text-emerald-600 hover:underline">
              Browse all World Cup 2026 destinations
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
