import Link from "next/link";
import { Info } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

/** viagogo / Hellotickets-style independent marketplace disclaimer */
export function TrustMarketplaceNotice({ className }: { className?: string }) {
  return (
    <div
      className={`flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3.5 text-sm leading-relaxed text-amber-950 ${className ?? ""}`}
      role="note"
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <p>
        <strong className="font-semibold">{SITE_NAME} is an independent ticket marketplace.</strong>{" "}
        We are not the official box office or event organiser. Prices may be above or below face
        value. Every confirmed order is covered by our{" "}
        <Link href="/guarantee" className="font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700">
          100% order guarantee
        </Link>
        .
      </p>
    </div>
  );
}

interface TrustPageShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function TrustPageShell({ title, description, children }: TrustPageShellProps) {
  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <TrustMarketplaceNotice />
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{description}</p>
        {children}
      </div>
    </div>
  );
}

export const TRUST_POLICY_LINKS = [
  { href: "/guarantee", label: "Order guarantee" },
  { href: "/delivery", label: "Ticket delivery" },
  { href: "/refunds", label: "Refunds" },
  { href: "/faq", label: "FAQ" },
] as const;

export function TrustPolicyNav({ className }: { className?: string }) {
  return (
    <nav
      className={`flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 ${className ?? ""}`}
      aria-label="Related policies"
    >
      {TRUST_POLICY_LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="hover:text-sky-600">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
