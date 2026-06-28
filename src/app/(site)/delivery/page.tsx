import Link from "next/link";
import { Smartphone, Printer, Clock, Mail, QrCode } from "lucide-react";

export const metadata = {
  title: "Ticket Delivery",
  description:
    "How Frontrowly delivers e-tickets — timing, formats, and what to expect at the venue.",
};

const methods = [
  {
    icon: Smartphone,
    title: "Mobile e-ticket",
    description:
      "Open the PDF from your confirmation email on your phone. The QR code is scanned at the gate — no printing required.",
  },
  {
    icon: Printer,
    title: "Print at home",
    description:
      "Download and print your PDF if you prefer paper. Ensure the QR code is clear and not cropped.",
  },
  {
    icon: QrCode,
    title: "One QR per order",
    description:
      "Depending on the event, you may receive one QR for your group or individual codes per seat. Instructions are in your email.",
  },
];

export default function DeliveryPage() {
  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Ticket delivery
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          All Frontrowly tickets are delivered electronically — fast, secure, and ready
          for the venue. No physical shipping unless explicitly stated on a VIP or
          hospitality package.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {methods.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 card-shadow"
            >
              <Icon className="h-7 w-7 text-sky-500" />
              <h2 className="mt-3 font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </div>
          ))}
        </div>

        <section className="mt-12 space-y-6">
          <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-5">
            <Clock className="mt-0.5 h-6 w-6 shrink-0 text-sky-600" />
            <div>
              <h2 className="font-semibold text-slate-900">When will I get my tickets?</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                <li>
                  <strong className="text-slate-800">Most events:</strong> within 24 hours
                  of order confirmation
                </li>
                <li>
                  <strong className="text-slate-800">High-demand matches:</strong> delivery
                  may be scheduled closer to the event — we&apos;ll email the expected date
                </li>
                <li>
                  <strong className="text-slate-800">After purchase:</strong> check spam and
                  promotions folders; add tickets@frontrowly.com to your contacts
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">At the venue</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600 sm:text-base">
              <li>Arrive with the same name used at checkout if ID checks apply</li>
              <li>Have your QR ready with screen brightness up — avoid cracked or dim screens</li>
              <li>Some venues require the original purchaser&apos;s ID — we&apos;ll note this in your email if applicable</li>
              <li>International buyers: ensure your phone works offline or save a screenshot if advised in your delivery email</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Hospitality & VIP</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Premium packages may include separate lounge access instructions, wristbands,
              or will-call pickup. Full details are sent with your confirmation. For VIP
              enquiries before purchase, email{" "}
              <a href="mailto:vip@frontrowly.com" className="text-sky-600 hover:underline">
                vip@frontrowly.com
              </a>
              .
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 card-shadow">
            <Mail className="mt-0.5 h-6 w-6 shrink-0 text-sky-500" />
            <div>
              <h2 className="font-semibold text-slate-900">Haven&apos;t received your tickets?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Email{" "}
                <a href="mailto:support@frontrowly.com" className="text-sky-600 hover:underline">
                  support@frontrowly.com
                </a>{" "}
                with your order reference. If delivery is overdue per your confirmation
                email, our{" "}
                <Link href="/guarantee" className="text-sky-600 hover:underline">
                  order guarantee
                </Link>{" "}
                applies.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
