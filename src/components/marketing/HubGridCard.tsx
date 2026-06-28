import Image from "next/image";
import Link from "next/link";
import type { HubGridItem } from "@/lib/marketing/world-cup-nav";

interface HubGridCardProps {
  item: HubGridItem;
}

export function HubGridCard({ item }: HubGridCardProps) {
  return (
    <Link
      href={item.href}
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 shadow-md transition hover:shadow-xl"
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
      {item.badge && (
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow">
          {item.badge}
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-lg font-bold leading-tight group-hover:text-emerald-200 transition">
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
