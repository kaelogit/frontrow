import Link from "next/link";
import { LegalPageShell } from "@/components/marketing/LegalPageShell";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: "Terms of Service",
  description: `Terms and conditions for using ${SITE_NAME} and purchasing tickets.`,
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of service"
      description={`These terms govern your use of ${SITE_NAME} and any ticket purchase or reservation made through our website.`}
      updated="June 27, 2026"
    >
      <h2>1. Agreement</h2>
      <p>
        By accessing frontrowly.com or placing an order, you agree to these Terms of
        Service and our{" "}
        <Link href="/privacy">Privacy policy</Link>. If you do not agree, do not use
        the site.
      </p>

      <h2>2. About Frontrowly</h2>
      <p>
        {SITE_NAME} is an <strong>independent ticket marketplace</strong>. We are not
        the event organiser, venue, or primary ticket issuer unless stated otherwise on
        a specific listing. Ticket prices may be above or below face value depending on
        demand, category, and availability.
      </p>
      <p>
        We manage our own inventory and work with trusted supply partners. Availability
        shown on the site is subject to change until your order is confirmed.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 18 years old (or the age of majority in your jurisdiction)
        to purchase tickets. You are responsible for ensuring you meet any venue,
        competition, or local entry requirements.
      </p>

      <h2>4. Orders and reservations</h2>
      <ul>
        <li>
          Browsing and checkout do not require an account — we use your email for order
          communication.
        </li>
        <li>
          A <strong>reservation request</strong> holds inventory for a limited period
          while payment is arranged. Confirmation is subject to successful payment and
          final verification.
        </li>
        <li>
          An order is not complete until you receive a confirmation email with your
          order reference.
        </li>
        <li>
          We may refuse or cancel orders suspected of fraud, pricing errors, or
          insufficient inventory.
        </li>
      </ul>

      <h2>5. Pricing and fees</h2>
      <p>
        Prices are displayed in the currency shown at checkout (typically USD). The
        total shown before you confirm includes the ticket price for your selected
        quantity. Any service or delivery fees will be disclosed before you submit your
        order.
      </p>
      <p>
        We reserve the right to correct obvious pricing errors and to cancel orders
        placed at erroneous prices, with a full refund of any amount paid.
      </p>

      <h2>6. Payment</h2>
      <p>
        Accepted payment methods are shown at checkout and may change over time. Card
        and cryptocurrency options may be offered on a phased basis. Until confirmed,
        reservation requests do not guarantee ticket allocation.
      </p>

      <h2>7. Ticket delivery</h2>
      <p>
        Tickets are delivered electronically unless otherwise stated. Delivery timing
        depends on the event and inventory type — see our{" "}
        <Link href="/delivery">Ticket delivery</Link> page. You are responsible for
        providing a valid email address and checking spam folders.
      </p>

      <h2>8. Order guarantee</h2>
      <p>
        Every confirmed order is covered by our{" "}
        <Link href="/guarantee">100% order guarantee</Link>: valid tickets for entry,
        or we make it right including replacement or refund as applicable.
      </p>

      <h2>9. Refunds and cancellations</h2>
      <p>
        Refund eligibility depends on event status and timing. See our full{" "}
        <Link href="/refunds">Refund policy</Link>. In general:
      </p>
      <ul>
        <li>Officially cancelled events — full refund of ticket price</li>
        <li>Postponed events — tickets valid for the new date; refunds case by case</li>
        <li>Customer change of mind — generally non-refundable once confirmed</li>
      </ul>

      <h2>10. Event changes</h2>
      <p>
        Organisers may change dates, times, venues, or line-ups. We are not
        responsible for changes made by third parties but will communicate known
        updates and follow our refund policy where applicable.
      </p>

      <h2>11. Prohibited conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use bots, scrapers, or automated tools to access inventory unfairly</li>
        <li>Resell tickets in violation of venue or local laws</li>
        <li>Provide false information at checkout</li>
        <li>Attempt to circumvent queue or hold systems</li>
      </ul>

      <h2>12. Intellectual property</h2>
      <p>
        Site content, branding, and design are owned by {SITE_NAME} or our licensors.
        Event names, logos, and trademarks belong to their respective owners and are
        used for identification only.
      </p>

      <h2>13. Disclaimer</h2>
      <p>
        The site and tickets are provided &quot;as is&quot; to the fullest extent
        permitted by law. We do not guarantee uninterrupted access to the website. Our
        liability is limited as set out below.
      </p>

      <h2>14. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {SITE_NAME} is not liable for indirect,
        incidental, or consequential damages arising from use of the site or attendance
        at an event. Our total liability for any claim relating to an order is limited
        to the amount you paid for that order.
      </p>
      <p>
        Nothing in these terms excludes liability that cannot be excluded under
        applicable consumer protection law.
      </p>

      <h2>15. Disputes</h2>
      <p>
        Contact{" "}
        <a href="mailto:support@frontrowly.com">support@frontrowly.com</a> first — we
        aim to resolve issues within 48 hours. If we cannot resolve a dispute, governing
        law and jurisdiction will depend on your location and our registered entity;
        contact us for details applicable to your order.
      </p>

      <h2>16. Changes</h2>
      <p>
        We may update these terms. The &quot;Last updated&quot; date reflects the
        current version. Material changes affecting existing orders will be handled
        fairly and in line with applicable law.
      </p>
    </LegalPageShell>
  );
}
