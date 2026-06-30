import Link from "next/link";
import { Shield, Smartphone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SITE_NAME } from "@/lib/constants";
import { WORLD_CUP_CITY_PAGES } from "@/lib/marketing/world-cup-cities";

const helpLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact us" },
  { href: "/guarantee", label: "100% order guarantee" },
  { href: "/delivery", label: "Ticket delivery" },
  { href: "/refunds", label: "Refunds" },
  { href: "/how-it-works", label: "How it works" },
] as const;

const companyLinks = [
  { href: "/about", label: "About us" },
  { href: "/world-cup-2026", label: "World Cup 2026" },
  { href: "/events", label: "All events" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
] as const;

/** Host cities — same slugs as `/world-cup-2026/[city]` pages */
const cityLinks = [...WORLD_CUP_CITY_PAGES]
  .sort((a, b) => {
    if (a.hostsFinal) return -1;
    if (b.hostsFinal) return 1;
    return a.name.localeCompare(b.name);
  })
  .map((city) => ({
    href: `/world-cup-2026/${city.slug}`,
    label: city.name.replace(" / New Jersey", " / NJ"),
  }));

function PaymentIcons() {
  const methods = [
    { id: "visa", label: "Visa" },
    { id: "mc", label: "Mastercard" },
    { id: "amex", label: "Amex" },
    { id: "apple", label: "Apple Pay" },
    { id: "crypto", label: "Crypto" },
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {methods.map((m) => (
        <span
          key={m.id}
          className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-600"
          title={m.label}
        >
          {m.label}
        </span>
      ))}
      <span className="text-xs text-slate-400">Card checkout coming soon</span>
    </div>
  );
}

function AppDownloadPlaceholder() {
  return (
    <div className="flex flex-wrap gap-2">
      {["App Store", "Google Play"].map((store) => (
        <span
          key={store}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-500"
          title={`${store} app — coming soon`}
        >
          <Smartphone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span>
            {store}
            <span className="ml-1.5 text-[10px] font-medium uppercase text-slate-400">
              Soon
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand + guarantee */}
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Your front row to the world&apos;s biggest sports and live events.
              Premium seats, verified delivery, backed by our order guarantee.
            </p>

            <Link
              href="/guarantee"
              className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <Shield className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-slate-900">100% order guarantee</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Valid entry or we replace your tickets or refund you. Every confirmed order
                  is protected.
                </p>
              </div>
            </Link>

            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              {SITE_NAME} is an independent ticket marketplace — not the official box office.
              Prices may differ from face value.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
            <div>
              <p className="text-sm font-semibold text-slate-900">Help</p>
              <ul className="mt-4 space-y-2.5">
                {helpLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-sky-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <a
                href="mailto:support@frontrowly.com"
                className="mt-4 inline-block text-sm font-medium text-sky-600 hover:underline"
              >
                support@frontrowly.com
              </a>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">World Cup host cities</p>
              <ul className="mt-4 space-y-2.5">
                {cityLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-sky-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/world-cup-2026"
                className="mt-4 inline-block text-sm font-medium text-sky-600 hover:underline"
              >
                All World Cup matches →
              </Link>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">Company</p>
              <ul className="mt-4 space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-sky-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
