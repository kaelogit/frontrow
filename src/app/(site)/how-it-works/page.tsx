import Link from "next/link";
import { Search, Ticket, Mail, Shield, CreditCard } from "lucide-react";

export const metadata = {
  title: "How It Works",
  description: "Find, reserve, and receive tickets on Frontrowly in three simple steps.",
};

const steps = [
  {
    icon: Search,
    title: "Find your event",
    description:
      "Browse World Cup matches, knockouts, and more. Filter by date, city, or stage. Pick your ticket category and quantity.",
  },
  {
    icon: Ticket,
    title: "Choose your seats",
    description:
      "Select from live inventory — section, row, and category where available. Review your order before checkout.",
  },
  {
    icon: CreditCard,
    title: "Complete your order",
    description:
      "Guest checkout with your email — no account needed. Submit a reservation request or pay using the methods shown at checkout.",
  },
  {
    icon: Mail,
    title: "Receive your e-ticket",
    description:
      "After confirmation, your e-ticket with QR code is emailed to you. Show it on your phone or print at home.",
  },
  {
    icon: Shield,
    title: "Attend with confidence",
    description:
      "Every order is covered by our 100% guarantee. Need help? Our support team is one email away.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          How it works
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Getting tickets through Frontrowly is straightforward — find, book, and go.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl space-y-4">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 card-shadow sm:gap-5 sm:p-6"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
              {i + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <step.icon className="h-5 w-5 text-sky-500" />
                <h2 className="font-semibold text-slate-900">{step.title}</h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-sky-100 bg-sky-50/60 p-6 text-center">
        <p className="font-semibold text-slate-900">Ready to find tickets?</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/world-cup-2026"
            className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
          >
            World Cup 2026
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            All events
          </Link>
        </div>
      </div>
    </div>
  );
}
