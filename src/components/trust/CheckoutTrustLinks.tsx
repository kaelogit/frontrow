import Link from "next/link";
import { Shield, Truck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutTrustLinksProps {
  className?: string;
}

const links = [
  {
    href: "/guarantee",
    icon: Shield,
    label: "100% order guarantee",
    detail: "Valid entry or we make it right",
  },
  {
    href: "/delivery",
    icon: Truck,
    label: "Ticket delivery",
    detail: "E-tickets by email before the event",
  },
  {
    href: "/refunds",
    icon: RotateCcw,
    label: "Refund policy",
    detail: "Cancellations & order issues",
  },
] as const;

export function CheckoutTrustLinks({ className }: CheckoutTrustLinksProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-slate-50/80 p-4",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Buy with confidence
      </p>
      <ul className="mt-3 space-y-2">
        {links.map(({ href, icon: Icon, label, detail }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-start gap-3 rounded-lg px-1 py-1 transition hover:bg-white"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
              <span>
                <span className="block text-sm font-medium text-slate-900 group-hover:text-sky-700">
                  {label}
                </span>
                <span className="block text-xs text-slate-500">{detail}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
