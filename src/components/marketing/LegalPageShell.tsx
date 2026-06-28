import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LegalPageShellProps {
  title: string;
  description?: string;
  updated?: string;
  children: ReactNode;
  className?: string;
}

export function LegalPageShell({
  title,
  description,
  updated,
  children,
  className,
}: LegalPageShellProps) {
  return (
    <div className={cn("px-4 py-12 sm:px-6 sm:py-16", className)}>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{description}</p>
        )}
        {updated && (
          <p className="mt-3 text-sm text-slate-500">Last updated: {updated}</p>
        )}
        <div className="prose prose-slate mt-10 max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline">
          {children}
        </div>
        <p className="mt-12 border-t border-slate-200 pt-8 text-sm text-slate-500">
          Questions?{" "}
          <Link href="/contact" className="font-medium text-sky-600 hover:underline">
            Contact us
          </Link>{" "}
          or email{" "}
          <a href="mailto:support@frontrowly.com" className="text-sky-600 hover:underline">
            support@frontrowly.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
