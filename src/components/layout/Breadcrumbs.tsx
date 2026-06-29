import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/lib/navigation/breadcrumbs";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const parent =
    items.length >= 2 ? items[items.length - 2] : items.find((item) => item.href);

  return (
    <nav aria-label="Breadcrumb" className={className}>
      {parent?.href ? (
        <Link
          href={parent.href}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-sky-600 sm:hidden"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
          {parent.label}
        </Link>
      ) : null}

      <ol className="hidden flex-wrap items-center gap-1 text-sm text-slate-600 sm:flex">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
            {index > 0 ? (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            ) : null}
            {item.href ? (
              <Link href={item.href} className="truncate hover:text-sky-600">
                {item.label}
              </Link>
            ) : (
              <span className="truncate font-medium text-slate-900" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
