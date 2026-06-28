import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Music } from "lucide-react";
import { IMAGES } from "@/lib/images";

export const metadata = {
  title: "Concerts & Festivals",
  description: "Premium tickets to concerts, festivals and live music events worldwide.",
};

export default function ConcertsPage() {
  return (
    <>
      <section className="relative min-h-[45vh] overflow-hidden">
        <Image
          src={IMAGES.categories.concerts}
          alt="Live concerts"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-purple-900/40 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Music className="h-8 w-8 text-pink-300" />
          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            Concerts & festivals
          </h1>
          <p className="mt-4 max-w-xl text-lg text-purple-100">
            Stadium tours, summer festivals, and once-in-a-lifetime live shows.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-900">Coming soon</h2>
          <p className="mt-4 text-slate-600">
            We&apos;re adding concert and festival inventory shortly. In the
            meantime, explore our sports events or get in touch for VIP requests.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/events"
              className="rounded-full bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-700"
            >
              Browse sports events
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
