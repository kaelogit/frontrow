import { SITE_URL } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import {
  emailButton,
  emailHeading,
  emailLayout,
  emailMuted,
  emailParagraph,
} from "@/emails/layout";
import type { EmailContent } from "@/emails/types";
import { escapeHtml } from "@/emails/utils";

export function buildCryptoCheckoutCustomerEmail(params: {
  customerName: string;
  reference: string;
  total: number;
  currency?: string;
}): EmailContent {
  const currency = params.currency ?? "USD";
  const amount = formatPrice(params.total, currency);
  const confirmationUrl = `${SITE_URL}/order/${encodeURIComponent(params.reference)}/confirmation`;
  const subject = `Complete your crypto payment — ${params.reference}`;

  const text = `
Hi ${params.customerName},

Your order ${params.reference} is on hold. Complete crypto payment on the checkout page to secure your seats.

Amount due: ${amount}

View order: ${confirmationUrl}

Frontrowly
`.trim();

  const html = emailLayout({
    preview: `Complete crypto payment for ${params.reference}`,
    title: subject,
    siteUrl: SITE_URL,
    body: `
      ${emailHeading("Complete your crypto payment")}
      ${emailParagraph(`Hi ${escapeHtml(params.customerName)},`)}
      ${emailParagraph(`Order <strong>${escapeHtml(params.reference)}</strong> is on hold. Finish payment on the checkout page to secure your seats.`)}
      ${emailParagraph(`Amount due: <strong>${amount}</strong>`)}
      ${emailButton(confirmationUrl, "View order")}
    `,
  });

  return { subject, preview: subject, text, html };
}

export function buildCryptoCheckoutAdminEmail(params: {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  currency?: string;
  eventTitle?: string;
}): EmailContent {
  const currency = params.currency ?? "USD";
  const amount = formatPrice(params.total, currency);
  const adminUrl = `${SITE_URL}/admin/orders/${encodeURIComponent(params.reference)}`;
  const subject = `[Frontrowly] Crypto checkout started — ${params.reference}`;

  const text = `
Crypto checkout in progress

Reference: ${params.reference}
${params.eventTitle ? `Event: ${params.eventTitle}\n` : ""}
Customer: ${params.customerName}
Email: ${params.customerEmail}
Phone: ${params.customerPhone ?? "N/A"}
Amount: ${amount}

Reply to this email to contact the customer.

Admin: ${adminUrl}
`.trim();

  const html = emailLayout({
    preview: `${params.customerName} started crypto checkout`,
    title: subject,
    siteUrl: SITE_URL,
    body: `
      ${emailHeading("Crypto checkout started")}
      ${emailParagraph(`<strong>${escapeHtml(params.customerName)}</strong> is completing crypto payment for order <strong>${escapeHtml(params.reference)}</strong>.`)}
      ${params.eventTitle ? emailParagraph(`Event: ${escapeHtml(params.eventTitle)}`) : ""}
      ${emailParagraph(`Amount: <strong>${amount}</strong>`)}
      ${emailParagraph(`Email: <a href="mailto:${escapeHtml(params.customerEmail)}">${escapeHtml(params.customerEmail)}</a>`)}
      ${emailMuted("Reply to this email to contact the customer directly.")}
      ${emailButton(adminUrl, "Open order in admin")}
    `,
  });

  return { subject, preview: subject, text, html };
}

export function buildCryptoPaidCustomerEmail(params: {
  customerName: string;
  reference: string;
  total: number;
  currency?: string;
}): EmailContent {
  const currency = params.currency ?? "USD";
  const amount = formatPrice(params.total, currency);
  const subject = `Payment confirmed — ${params.reference}`;

  const text = `
Hi ${params.customerName},

We received your crypto payment for order ${params.reference}.

Amount: ${amount}

We're preparing your tickets. You'll receive them in a separate email.

Frontrowly
`.trim();

  const html = emailLayout({
    preview: subject,
    title: subject,
    siteUrl: SITE_URL,
    body: `
      ${emailHeading("Payment confirmed")}
      ${emailParagraph(`Hi ${escapeHtml(params.customerName)},`)}
      ${emailParagraph(`Your crypto payment for order <strong>${escapeHtml(params.reference)}</strong> is confirmed.`)}
      ${emailParagraph(`Amount: <strong>${amount}</strong>`)}
      ${emailMuted("Your e-ticket will be sent to this email address shortly.")}
    `,
  });

  return { subject, preview: subject, text, html };
}

export function buildCryptoPaidAdminEmail(params: {
  reference: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency?: string;
  paymentId: string;
  externalId: string;
}): EmailContent {
  const currency = params.currency ?? "USD";
  const amount = formatPrice(params.total, currency);
  const adminUrl = `${SITE_URL}/admin/orders/${encodeURIComponent(params.reference)}`;
  const subject = `[Frontrowly] Crypto payment received — ${params.reference}`;

  const text = `
Crypto payment confirmed on-chain

Order: ${params.reference}
Customer: ${params.customerName} (${params.customerEmail})
Amount: ${amount}
Coin: ${params.paymentId}
Transaction: ${params.externalId}

Reply to this email to contact the customer.

Admin: ${adminUrl}
`.trim();

  const html = emailLayout({
    preview: subject,
    title: subject,
    siteUrl: SITE_URL,
    body: `
      ${emailHeading("Crypto payment received")}
      ${emailParagraph(`Order <strong>${escapeHtml(params.reference)}</strong>`)}
      ${emailParagraph(`${escapeHtml(params.customerName)} · ${escapeHtml(params.customerEmail)}`)}
      ${emailParagraph(`Amount: <strong>${amount}</strong>`)}
      ${emailParagraph(`Coin: ${escapeHtml(params.paymentId)}`)}
      ${emailParagraph(`Tx: <code>${escapeHtml(params.externalId)}</code>`)}
      ${emailMuted("Reply to this email to contact the customer. Mark paid / send ticket in admin if not already done.")}
      ${emailButton(adminUrl, "Open order in admin")}
    `,
  });

  return { subject, preview: subject, text, html };
}
