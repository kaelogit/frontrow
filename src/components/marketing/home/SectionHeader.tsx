import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  /** Center title/description on mobile; left-align from sm up */
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  eyebrow,
  href,
  linkLabel,
  centered = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        centered && "text-center sm:text-left",
        className
      )}
    >
      <div className={cn("min-w-0", centered && "sm:max-w-none")}>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 sm:text-sm">
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl",
            centered && "mx-auto sm:mx-0"
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-2 max-w-2xl text-base leading-relaxed text-slate-600 sm:mt-3 sm:text-lg",
              centered && "mx-auto sm:mx-0"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-sky-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 sm:w-auto sm:border-0 sm:bg-transparent sm:px-0 sm:shadow-none sm:hover:bg-transparent sm:hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 sm:hidden" />
        </Link>
      )}
    </div>
  );
}
