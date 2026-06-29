import Image from "next/image";
import Link from "next/link";
import type { MarketingGridCard } from "@/lib/marketing/world-cup-cards";
import { getMarketingCardFlagSrc } from "@/lib/marketing/world-cup-cards";
import { cn } from "@/lib/utils";

interface HubGridCardProps {
  item: MarketingGridCard;
}

export function HubGridCard({ item }: HubGridCardProps) {
  const flagSrc = getMarketingCardFlagSrc(item);

  return (
    <Link
      href={item.href}
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-800 shadow-md transition hover:shadow-xl"
    >
      {item.image ? (
        <Image
          src={item.image}
          alt=""
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950"
          aria-hidden
        />
      )}

      {flagSrc && (
        <div
          className={cn(
            "pointer-events-none absolute flex items-center justify-center",
            item.image
              ? "right-3 top-3 h-12 w-16 rounded-md bg-white/95 p-1 shadow-md"
              : "inset-0 opacity-[0.18]"
          )}
          aria-hidden
        >
          <Image
            src={flagSrc}
            alt=""
            width={item.image ? 56 : 120}
            height={item.image ? 42 : 90}
            className={cn(
              "object-cover",
              item.image ? "h-full w-full rounded-sm" : "h-24 w-32 sm:h-28 sm:w-40"
            )}
            unoptimized
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-slate-900/10" />

      {item.badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow">
          {item.badge}
        </span>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 text-white">
        <h3 className="text-lg font-bold leading-tight transition group-hover:text-emerald-200">
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-slate-200">{item.subtitle}</p>
        <span className="mt-2 inline-block text-xs font-semibold text-emerald-300 group-hover:underline">
          See tickets →
        </span>
      </div>
    </Link>
  );
}
