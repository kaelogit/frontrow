import { Mail, MessageCircle, Clock } from "lucide-react";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Frontrowly for ticket help, VIP requests, and order support.",
};

export default function ContactPage() {
  return (
    <div className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Contact us
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Questions about an event, reservation, or VIP package? Our team typically
          replies within 24 hours on business days.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Mail,
              title: "General support",
              detail: "support@frontrowly.com",
              href: "mailto:support@frontrowly.com",
            },
            {
              icon: MessageCircle,
              title: "VIP & groups",
              detail: "vip@frontrowly.com",
              href: "mailto:vip@frontrowly.com",
            },
            {
              icon: Clock,
              title: "Response time",
              detail: "Within 24 hours",
            },
          ].map(({ icon: Icon, title, detail, href }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 card-shadow"
            >
              <Icon className="h-6 w-6 text-sky-500" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              {href ? (
                <a href={href} className="mt-1 block text-sm text-sky-600 hover:underline">
                  {detail}
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-600">{detail}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
