import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  name: string;
  tagline: string;
  description: string;
  href: string;
  image: string;
}

export function CategoryCard({
  name,
  tagline,
  description,
  href,
  image,
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group card-shadow relative flex h-72 overflow-hidden rounded-2xl transition duration-300"
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
          {tagline}
        </p>
        <h3 className="mt-1 text-xl font-bold">{name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/85">{description}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-300 group-hover:gap-2 transition-all">
          Explore <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
