import Link from "next/link";
import { Shield, CheckCircle, Mail, Ticket, Clock } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: "Our Guarantee",
  description:
    "Frontrowly backs every ticket order with a 100% order guarantee — valid entry or we make it right.",
};

const guarantees = [
  {
    icon: Ticket,
    title: "Valid for entry",
    description:
      "Every ticket we confirm is genuine and valid for entry at the venue, in the category you purchased.",
  },
  {
    icon: Clock,
    title: "Delivered on time",
    description:
      "Your e-ticket arrives before the event unless we clearly state otherwise at checkout. We'll notify you if timing differs for your event.",
  },
  {
    icon: Shield,
    title: "We fix problems",
    description:
      "If something goes wrong on our side — invalid tickets, non-delivery, or a material listing error — we replace your tickets or refund you.",
  },
  {
    icon: Mail,
    title: "Human support",
    description:
      "Reach a real person at support@frontrowly.com with your order reference. We aim to respond within 24 hours on business days.",
  },
];

export default function GuaranteePage() {
  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10 shrink-0 text-sky-500" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            100% order guarantee
          </h1>
        </div>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          {SITE_NAME} is an independent ticket marketplace. We stand behind every
          confirmed order so you can buy with confidence — whether it&apos;s a World Cup
          knockout or a sold-out final.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {guarantees.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 card-shadow"
            >
              <Icon className="h-6 w-6 text-sky-500" />
              <h2 className="mt-3 font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </div>
          ))}
        </div>

        <section className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">What&apos;s covered</h2>
          <ul className="space-y-4">
            {[
              "Tickets not received by the stated delivery window (excluding delays caused by incorrect email addresses)",
              "Tickets rejected at the venue due to invalidity, not attendee eligibility or venue policy",
              "Material mismatch between your confirmed listing and what you receive (section, category, or quantity)",
              "Event officially cancelled — full refund per our refund policy",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-700">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span className="text-sm leading-relaxed sm:text-base">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">What&apos;s not covered</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>Change of mind after order confirmation</li>
            <li>Missing the event due to travel, visa, or personal scheduling</li>
            <li>Venue dress codes, age limits, or local entry restrictions</li>
            <li>Event postponement where your ticket remains valid for the new date</li>
            <li>Prices fluctuating after purchase on the secondary market</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">How to make a claim</h2>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Email{" "}
            <a href="mailto:support@frontrowly.com" className="text-sky-600 hover:underline">
              support@frontrowly.com
            </a>{" "}
            with your order reference, a description of the issue, and any supporting
            details (venue rejection notice, screenshots, etc.). We investigate promptly
            and will offer replacement tickets or a refund where the guarantee applies.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Full legal terms are in our{" "}
            <Link href="/terms" className="text-sky-600 hover:underline">
              Terms of service
            </Link>{" "}
            and{" "}
            <Link href="/refunds" className="text-sky-600 hover:underline">
              Refund policy
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
