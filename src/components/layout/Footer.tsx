import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SITE_NAME } from "@/lib/constants";

const footerLinks = {
  events: [
    { href: "/world-cup-2026", label: "World Cup 2026" },
    { href: "/events?competition=premier-league", label: "Premier League" },
    { href: "/events?competition=nba", label: "NBA" },
    { href: "/concerts", label: "Concerts" },
    { href: "/events", label: "All events" },
  ],
  company: [
    { href: "/about", label: "About us" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/guarantee", label: "Our guarantee" },
    { href: "/contact", label: "Contact" },
  ],
  support: [
    { href: "/faq", label: "FAQ" },
    { href: "/delivery", label: "Ticket delivery" },
    { href: "/refunds", label: "Refunds" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Your front row to the world&apos;s biggest sports and live events.
              Premium tickets, trusted service, unforgettable experiences.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Events</p>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.events.map((link) => (
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
          <div>
            <p className="text-sm font-semibold text-slate-900">Company</p>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.company.map((link) => (
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
          <div>
            <p className="text-sm font-semibold text-slate-900">Support</p>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.support.map((link) => (
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
              className="mt-4 block text-sm text-sky-600 hover:underline"
            >
              support@frontrowly.com
            </a>
          </div>
        </div>
        <p className="mt-12 border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          <span className="mx-2">·</span>
          <Link href="/privacy" className="hover:text-sky-600">
            Privacy
          </Link>
          <span className="mx-2">·</span>
          <Link href="/terms" className="hover:text-sky-600">
            Terms
          </Link>
        </p>
      </div>
    </footer>
  );
}
