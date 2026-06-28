import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shield, Star, Users, type LucideIcon } from "lucide-react";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";

const TRUST_ITEMS = [
  { icon: Shield, label: "Secure booking", iconClass: "text-sky-500" },
  { icon: Users, label: "Trusted by fans worldwide", iconClass: "text-sky-500" },
  { icon: Star, label: "VIP & hospitality options", iconClass: "text-amber-500" },
] as const;

function TrustItem({
  icon: Icon,
  label,
  iconClass,
}: {
  icon: LucideIcon;
  label: string;
  iconClass: string;
}) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[11px] text-slate-600 sm:gap-2 sm:text-sm">
      <Icon className={`h-3 w-3 shrink-0 sm:h-5 sm:w-5 ${iconClass}`} />
      {label}
    </span>
  );
}

function PremiumBadge({
  showStar,
  className,
}: {
  showStar: boolean;
  className?: string;
}) {
  return (
    <p className={cn("max-w-full font-semibold text-sky-700", className)}>
      {showStar && (
        <Star className="mr-1.5 inline h-4 w-4 shrink-0 fill-sky-500 text-sky-500" />
      )}
      Premium tickets to the world&apos;s biggest events
    </p>
  );
}

export function HomeHeroSection() {
  const marqueeItems = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <section className="relative min-h-[58vh] overflow-hidden sm:min-h-[75vh] lg:min-h-[85vh]">
      <Image
        src={IMAGES.hero}
        alt="Live stadium atmosphere"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/40 sm:bg-gradient-to-r sm:from-white/95 sm:via-white/80 sm:to-white/30" />
      <div className="relative mx-auto flex min-h-[58vh] max-w-7xl flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[75vh] sm:items-start sm:px-6 sm:py-16 sm:text-left lg:min-h-[85vh] lg:py-20">
        {/* Desktop only — top badge with star */}
        <div className="hidden sm:block">
          <PremiumBadge
            showStar
            className="animate-fade-up inline-block rounded-full bg-sky-100 px-4 py-1.5 text-sm"
          />
        </div>

        <h1 className="animate-fade-up-delay-1 mt-0 max-w-3xl text-[1.65rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:mt-6 sm:text-5xl lg:text-6xl">
          Live the moment.
          <br />
          <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
            Front row seats
          </span>{" "}
          await.
        </h1>
        <p className="animate-fade-up-delay-2 mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:mx-0 sm:mt-6 sm:text-lg">
          World Cup 2026, Premier League, NBA, concerts and more — hand-picked
          inventory at competitive prices for fans worldwide.
        </p>

        <div className="animate-fade-up-delay-2 mt-5 flex flex-col items-center gap-2 sm:mt-10 sm:flex-row sm:items-start sm:gap-4">
          <Link
            href="/world-cup-2026"
            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm shadow-sky-500/20 transition hover:brightness-105 sm:min-h-12 sm:gap-2 sm:px-7 sm:py-3.5 sm:text-base sm:shadow-lg sm:shadow-sky-500/30"
          >
            World Cup 2026
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
          <Link
            href="/events?competition=world-cup-2026"
            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50 sm:min-h-12 sm:gap-2 sm:border-2 sm:px-7 sm:py-3.5 sm:text-base"
          >
            Browse live matches
          </Link>
        </div>

        {/* Mobile: continuous sliding trust row */}
        <div className="mt-5 w-full sm:mt-14">
          <div className="relative -mx-4 overflow-hidden sm:hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent" />
            <div className="flex w-max animate-marquee items-center gap-5 py-0.5">
              {marqueeItems.map((item, index) => (
                <TrustItem key={`${item.label}-${index}`} {...item} />
              ))}
            </div>
          </div>

          <div className="hidden sm:flex sm:flex-wrap sm:gap-8">
            {TRUST_ITEMS.map((item) => (
              <TrustItem key={item.label} {...item} />
            ))}
          </div>
        </div>

        {/* Mobile only — below trust row, no star */}
        <div className="mt-3 sm:hidden">
          <PremiumBadge
            showStar={false}
            className="animate-fade-up-delay-2 text-[11px] leading-snug text-sky-600/90"
          />
        </div>
      </div>
    </section>
  );
}
