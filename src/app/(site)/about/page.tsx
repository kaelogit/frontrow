import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IMAGES } from "@/lib/images";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: "About Us",
  description: `Learn about ${SITE_NAME} — premium tickets to the world's biggest live events.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-slate-50 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            About {SITE_NAME}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            We help fans worldwide secure premium seats to the events that matter most —
            with a focus on trust, transparency, and unforgettable live experiences.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl card-shadow">
            <Image
              src={IMAGES.experience}
              alt="Fans at a live event"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-5 text-slate-600 leading-relaxed">
            <p>
              {SITE_NAME} was built for fans who don&apos;t want to miss the big moments
              — World Cup finals, knockout stages, NBA playoffs, and sold-out stadium
              shows.
            </p>
            <p>
              Unlike massive aggregators, we manage our own ticket inventory. That means
              real availability, clear pricing, and a team you can reach when you need
              help.
            </p>
            <p>
              Whether you&apos;re booking from London, Dubai, or São Paulo, we&apos;re
              here to get you in the door — backed by our{" "}
              <Link href="/guarantee" className="font-medium text-sky-600 hover:underline">
                100% order guarantee
              </Link>
              .
            </p>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 font-semibold text-sky-600 hover:underline"
            >
              How it works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
