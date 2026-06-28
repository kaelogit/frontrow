import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Trophy } from "lucide-react";
import { WorldCupHub } from "@/components/marketing/WorldCupHub";
import { SocialProofBar } from "@/components/marketing/SocialProofBar";
import { getEvents } from "@/lib/data/events";
import { IMAGES } from "@/lib/images";
import { getSocialProofSettings } from "@/lib/social-proof/settings";

export const metadata = {
  title: "World Cup 2026 Tickets — USA, Canada & Mexico",
  description:
    "Buy FIFA World Cup 2026 tickets by city, national team, or knockout stage. Group stage, Round of 32, quarterfinals and Final.",
};

export default async function WorldCupPage() {
  const [events, socialProof] = await Promise.all([
    getEvents({ competition: "world-cup-2026" }),
    getSocialProofSettings(),
  ]);

  return (
    <>
      <section className="relative min-h-[55vh] overflow-hidden">
        <Image
          src={IMAGES.categories["world-cup-2026"]}
          alt="World Cup 2026"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/55 to-emerald-800/35" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="flex items-center gap-2 text-emerald-200">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              FIFA World Cup 2026
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            World Cup 2026 tickets
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-emerald-100">
            48 nations · 104 matches · 16 host cities. Browse by team, city, or
            knockout stage — from group games to the Final at MetLife Stadium.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-200">
              <MapPin className="h-4 w-4" /> USA · Canada · Mexico
            </span>
            <span className="text-emerald-200">11 June – 19 July 2026</span>
          </div>
          <SocialProofBar
            settings={socialProof}
            variant="hero"
            className="mt-4"
          />
          <Link
            href="/events?competition=world-cup-2026"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-emerald-800 shadow-lg transition hover:bg-emerald-50"
          >
            View full schedule
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {[
            {
              title: "By city",
              text: "Vancouver, LA, New York, Miami and 12 more host cities.",
            },
            {
              title: "By team",
              text: "Follow Brazil, USA, Mexico, England and every nation at the tournament.",
            },
            {
              title: "Knockout stages",
              text: "Round of 32 through to the Final — premium seats at every stage.",
            },
          ].map((block) => (
            <div key={block.title}>
              <h2 className="font-bold text-slate-900">{block.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{block.text}</p>
            </div>
          ))}
        </div>
      </section>

      <WorldCupHub events={events} />
    </>
  );
}
