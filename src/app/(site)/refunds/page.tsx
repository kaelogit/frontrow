import Link from "next/link";
import { RotateCcw, CalendarX, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Refunds",
  description: "Frontrowly refund policy for cancelled events, postponements, and order issues.",
};

const scenarios = [
  {
    icon: CalendarX,
    title: "Event cancelled",
    body: "If an event is officially cancelled and not rescheduled, you receive a full refund of the ticket price paid to Frontrowly. Processing typically takes 5–10 business days depending on your payment method.",
  },
  {
    icon: RotateCcw,
    title: "Event postponed",
    body: "Your tickets remain valid for the new date and time. If you cannot attend the rescheduled event, contact support with your order reference — refunds are reviewed case by case and are not automatic.",
  },
  {
    icon: HelpCircle,
    title: "Order issues",
    body: "Invalid tickets, non-delivery, or a material listing error may qualify under our order guarantee — replacement tickets or a full refund where applicable.",
  },
];

export default function RefundsPage() {
  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Refund policy
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          We want you to feel confident booking with Frontrowly. This policy explains
          when refunds apply for marketplace ticket orders.
        </p>

        <div className="mt-10 space-y-4">
          {scenarios.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 card-shadow"
            >
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-sky-500" />
              <div>
                <h2 className="font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Generally non-refundable</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600 sm:text-base">
            <li>Change of mind after your order is confirmed</li>
            <li>Partial attendance or unused tickets</li>
            <li>Travel, accommodation, or other costs related to the event</li>
            <li>Incorrect attendee details provided by you at checkout</li>
            <li>Denial of entry due to venue policy, age limits, or conduct — not ticket validity</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">How to request a refund</h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-600 sm:text-base">
            <li>
              Email{" "}
              <a href="mailto:support@frontrowly.com" className="text-sky-600 hover:underline">
                support@frontrowly.com
              </a>{" "}
              with your order reference
            </li>
            <li>Explain the reason and attach any official cancellation notice if available</li>
            <li>We confirm eligibility within 48 hours on business days</li>
            <li>Approved refunds are returned to the original payment method where possible</li>
          </ol>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="font-semibold text-slate-900">Marketplace notice</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Frontrowly is an independent reseller. Ticket prices may differ from face
            value. Refunds cover the amount you paid to us for tickets — not price
            differences if you repurchase elsewhere. Consumer rights in your country may
            provide additional protections; nothing here limits those where applicable.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            See also our{" "}
            <Link href="/guarantee" className="text-sky-600 hover:underline">
              Order guarantee
            </Link>
            ,{" "}
            <Link href="/terms" className="text-sky-600 hover:underline">
              Terms of service
            </Link>
            , and{" "}
            <Link href="/faq" className="text-sky-600 hover:underline">
              FAQ
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
