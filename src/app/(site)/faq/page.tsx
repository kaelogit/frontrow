import Link from "next/link";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about buying World Cup and live event tickets on Frontrowly.",
};

const faqSections = [
  {
    title: "Orders & checkout",
    items: [
      {
        q: "Do I need an account to buy tickets?",
        a: "No, You can enter your name and email at checkout. We'll send confirmations and tickets to that email.",
      },
      {
        q: "What is a reservation request?",
        a: "A reservation holds your selected tickets for a limited period while you complete payment. Our team will email you payment options. Your order is only confirmed once payment is received and you get a confirmation email with your order reference.",
      },
      {
        q: "Which payment methods do you accept?",
        a: "We currently accept reservation requests with follow-up payment instructions, Card payment and crypto — whatever is available will be shown at checkout.",
      },
      {
        q: "Can I buy tickets for someone else?",
        a: "Yes. Use your email for the order and tell us the attendee names if required. For group or corporate bookings, contact tickets@frontrowly.com.",
      },
      {
        q: "How do I check my order status?",
        a: "Use the link in your confirmation email or visit your order confirmation page with your reference number. For help, email support@frontrowly.com with your order reference.",
      },
    ],
  },
  {
    title: "Tickets & delivery",
    items: [
      {
        q: "When will I receive my tickets?",
        a: "Most e-tickets arrive within 24 hours of order confirmation. For some high-demand events, delivery may be closer to the event date — we'll always communicate expected timing in your confirmation email.",
      },
      {
        q: "How are tickets delivered?",
        a: "Electronically — usually as a PDF with a QR code sent to your email. You can show the QR on your phone or print the PDF. See our ticket delivery page for full details.",
      },
      {
        q: "Are the tickets guaranteed valid for entry?",
        a: "Yes. Every confirmed order is covered by our 100% order guarantee. If there's a problem with your tickets on our end, we replace them or refund you.",
      },
      {
        q: "Will my seats be together?",
        a: "When you select a quantity from a single listing, seats are sold as seated together unless the listing notes otherwise.",
      },
    ],
  },
  {
    title: "World Cup 2026",
    items: [
      {
        q: "Why do some matches show TBD teams?",
        a: "Knockout matches depend on earlier results. Placeholder labels like W89 or Winner Match 93 indicate which earlier match feeds each slot. Teams update once those matches are played.",
      },
      {
        q: "Can I buy Final tickets before teams are confirmed?",
        a: "Yes. Final and knockout inventory is available in advance. Your ticket is valid regardless of which teams qualify, subject to the event going ahead as scheduled.",
      },
      {
        q: "Do prices include fees?",
        a: "The price shown per ticket is what you pay for that listing quantity. Any additional fees will be disclosed clearly before you submit your order.",
      },
    ],
  },
  {
    title: "Changes, refunds & support",
    items: [
      {
        q: "What if an event is postponed?",
        a: "If an event is rescheduled, your tickets remain valid for the new date and time. If you cannot attend the new date, contact support — refunds are handled case by case.",
      },
      {
        q: "What if an event is cancelled?",
        a: "If an event is officially cancelled and not rescheduled, you are entitled to a full refund of the ticket price. See our refund policy for details.",
      },
      {
        q: "Can I cancel or change my order?",
        a: "Once an order is confirmed, tickets are generally non-refundable if you change your mind. Contact us as soon as possible if you made an error — we'll help where we can.",
      },
      {
        q: "Do you sell concert tickets?",
        a: "We're expanding into concerts and festivals. Check our concerts page or contact us for VIP requests.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-slate-600">
          Can&apos;t find what you need?{" "}
          <Link href="/contact" className="font-medium text-sky-600 hover:underline">
            Contact us
          </Link>{" "}
          or email{" "}
          <a href="mailto:support@frontrowly.com" className="text-sky-600 hover:underline">
            support@frontrowly.com
          </a>
          .
        </p>

        <div className="mt-10 space-y-10">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-sky-600">
                {section.title}
              </h2>
              <div className="mt-4 space-y-3">
                {section.items.map((faq) => (
                  <details
                    key={faq.q}
                    className="group rounded-xl border border-slate-200 bg-white card-shadow"
                  >
                    <summary className="cursor-pointer list-none px-5 py-4 pr-10 font-semibold text-slate-900 marker:content-none">
                      {faq.q}
                    </summary>
                    <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-sky-100 bg-sky-50/60 p-6 text-center">
          <p className="font-semibold text-slate-900">Still have questions?</p>
          <p className="mt-2 text-sm text-slate-600">
            Read our{" "}
            <Link href="/guarantee" className="text-sky-600 hover:underline">
              order guarantee
            </Link>
            ,{" "}
            <Link href="/delivery" className="text-sky-600 hover:underline">
              delivery info
            </Link>
            , or{" "}
            <Link href="/refunds" className="text-sky-600 hover:underline">
              refund policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
