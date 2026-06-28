import Link from "next/link";
import { LegalPageShell } from "@/components/marketing/LegalPageShell";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your personal information.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy policy"
      description={`${SITE_NAME} respects your privacy. This policy explains what we collect when you browse or buy tickets, how we use it, and your choices.`}
      updated="June 27, 2026"
    >
      <h2>1. Who we are</h2>
      <p>
        {SITE_NAME} operates an independent ticket marketplace at frontrowly.com. We
        sell and facilitate the sale of tickets to live sports and entertainment
        events. For privacy questions, contact{" "}
        <a href="mailto:support@frontrowly.com">support@frontrowly.com</a>.
      </p>

      <h2>2. Information we collect</h2>
      <p>When you use our site or place an order, we may collect:</p>
      <ul>
        <li>
          <strong>Contact details</strong> — name, email address, phone number (if
          provided)
        </li>
        <li>
          <strong>Order information</strong> — event, ticket category, quantity, price,
          order reference, payment method selected
        </li>
        <li>
          <strong>Communications</strong> — messages you send via our contact form or
          email
        </li>
        <li>
          <strong>Technical data</strong> — IP address, browser type, device type,
          pages viewed, and approximate location derived from IP
        </li>
        <li>
          <strong>Preferences</strong> — region and currency selection stored in cookies
        </li>
      </ul>
      <p>
        We do not require you to create an account. Checkout is guest-only using your
        email address.
      </p>

      <h2>3. How we use your information</h2>
      <p>We use personal data to:</p>
      <ul>
        <li>Process reservations and ticket orders</li>
        <li>Send order confirmations, delivery instructions, and support replies</li>
        <li>Respond to contact and VIP enquiries</li>
        <li>Prevent fraud and protect the security of our platform</li>
        <li>Improve our website, inventory, and customer experience</li>
        <li>Comply with legal obligations</li>
      </ul>
      <p>
        We may use aggregated, anonymised browsing data (for example, event page views)
        to show approximate social proof such as &quot;fans viewed this event&quot; —
        never tied to your identity.
      </p>

      <h2>4. Legal bases (EEA / UK visitors)</h2>
      <p>If you are in the EEA or UK, we process personal data on these bases:</p>
      <ul>
        <li>
          <strong>Contract</strong> — to fulfil your ticket order or reservation
        </li>
        <li>
          <strong>Legitimate interests</strong> — fraud prevention, analytics, and
          improving our service
        </li>
        <li>
          <strong>Consent</strong> — where required for non-essential cookies or
          marketing (when offered)
        </li>
        <li>
          <strong>Legal obligation</strong> — where we must retain or disclose data by
          law
        </li>
      </ul>

      <h2>5. Sharing your information</h2>
      <p>We do not sell your personal information. We may share data with:</p>
      <ul>
        <li>
          <strong>Service providers</strong> — email delivery (e.g. Resend), hosting,
          payment processors when card or crypto checkout is enabled
        </li>
        <li>
          <strong>Venue / fulfilment partners</strong> — only as needed to deliver valid
          tickets
        </li>
        <li>
          <strong>Authorities</strong> — if required by law or to protect our rights
        </li>
      </ul>
      <p>
        Providers are bound by contracts requiring them to protect your data and use it
        only for the services they perform for us.
      </p>

      <h2>6. Cookies and local storage</h2>
      <p>We use cookies and similar technologies for:</p>
      <ul>
        <li>Remembering your region and currency preference</li>
        <li>Session and checkout continuity</li>
        <li>Understanding how visitors use the site</li>
      </ul>
      <p>
        You can control cookies through your browser settings. Disabling essential
        cookies may affect checkout or locale selection.
      </p>

      <h2>7. Data retention</h2>
      <p>
        We keep order and contact records for as long as needed to fulfil orders, handle
        disputes and refunds, and meet tax and legal requirements — typically up to
        seven years for financial records. Marketing enquiries are retained until
        resolved, then deleted or anonymised within a reasonable period.
      </p>

      <h2>8. Security</h2>
      <p>
        We use industry-standard measures including HTTPS, access controls, and secure
        hosting. No method of transmission over the internet is 100% secure; we cannot
        guarantee absolute security.
      </p>

      <h2>9. Your rights</h2>
      <p>Depending on where you live, you may have the right to:</p>
      <ul>
        <li>Access, correct, or delete your personal data</li>
        <li>Object to or restrict certain processing</li>
        <li>Data portability</li>
        <li>Withdraw consent where processing is consent-based</li>
        <li>Lodge a complaint with your local data protection authority</li>
      </ul>
      <p>
        To exercise these rights, email{" "}
        <a href="mailto:support@frontrowly.com">support@frontrowly.com</a> with your
        order reference if applicable. We respond within 30 days where required by
        law.
      </p>

      <h2>10. International transfers</h2>
      <p>
        We may process data in the United States and other countries where our
        providers operate. Where required, we use appropriate safeguards such as
        standard contractual clauses.
      </p>

      <h2>11. Children</h2>
      <p>
        Our services are not directed at children under 16. We do not knowingly collect
        data from children. Contact us if you believe a child has provided personal
        information.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update this policy from time to time. Material changes will be reflected
        on this page with an updated date. Continued use of the site after changes
        constitutes acceptance of the revised policy.
      </p>

      <h2>13. Related policies</h2>
      <p>
        See also our{" "}
        <Link href="/terms">Terms of service</Link>,{" "}
        <Link href="/refunds">Refund policy</Link>, and{" "}
        <Link href="/guarantee">Order guarantee</Link>.
      </p>
    </LegalPageShell>
  );
}
