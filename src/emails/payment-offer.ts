import { SITE_URL } from "@/lib/constants";
import { paymentOfferUrl } from "@/lib/payments/tokens";
import {
  emailButton,
  emailHeading,
  emailLayout,
  emailMuted,
  emailParagraph,
} from "@/emails/layout";
import type { EmailContent } from "@/emails/types";
import { escapeHtml } from "@/emails/utils";
import { formatPrice } from "@/lib/utils";

export function buildPaymentOfferCustomerEmail(params: {
  customerName: string;
  orderReference: string;
  amount: number;
  currency: string;
  methodLabel: string;
  token: string;
  expiryMinutes: number;
}): EmailContent {
  const link = paymentOfferUrl(params.token);
  const amount = formatPrice(params.amount, params.currency);
  const duration = formatExpiryLabel(params.expiryMinutes);
  const subject = `Payment link — ${params.orderReference}`;

  const text = `
Hi ${params.customerName},

Complete payment for order ${params.orderReference}.

Amount: ${amount}
Method: ${params.methodLabel}

${link}

When you open the link and begin payment, you'll have ${duration} to complete it.

Frontrowly
`.trim();

  const html = emailLayout({
    preview: `Pay ${amount} for ${params.orderReference}`,
    title: subject,
    siteUrl: SITE_URL,
    body: `
      ${emailHeading("Complete your payment")}
      ${emailParagraph(`Order <strong>${escapeHtml(params.orderReference)}</strong>`)}
      ${emailParagraph(`Amount due: <strong>${amount}</strong>`)}
      ${emailParagraph(`Method: ${escapeHtml(params.methodLabel)}`)}
      ${emailButton(link, "Open payment page")}
      ${emailMuted(`The timer starts when you open the link and begin payment. You'll have ${escapeHtml(duration)} to complete it.`)}
    `,
  });

  return { subject, preview: `Pay ${amount} for ${params.orderReference}`, text, html };
}

function formatExpiryLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function buildPaymentSubmittedCustomerEmail(params: {
  customerName: string;
  orderReference: string;
}): EmailContent {
  const subject = `Payment received — verifying ${params.orderReference}`;

  const text = `
Hi ${params.customerName},

We received your payment proof for order ${params.orderReference}. Our team is verifying it now.

Frontrowly
`.trim();

  const html = emailLayout({
    preview: subject,
    title: subject,
    siteUrl: SITE_URL,
    body: `
      ${emailHeading("Payment received")}
      ${emailParagraph(`We're verifying your payment for order <strong>${escapeHtml(params.orderReference)}</strong>.`)}
      ${emailMuted("We'll email you once confirmed.")}
    `,
  });

  return { subject, preview: subject, text, html };
}

export function buildPaymentSubmittedAdminEmail(params: {
  orderReference: string;
  customerName: string;
  customerEmail: string;
  methodLabel: string;
  amount: number;
  currency: string;
  receiptUrl: string;
  customerNote?: string | null;
}): EmailContent {
  const amount = formatPrice(params.amount, params.currency);
  const subject = `[Frontrowly] Payment proof — ${params.orderReference}`;

  const text = `
Payment proof submitted

Order: ${params.orderReference}
Customer: ${params.customerName} (${params.customerEmail})
Method: ${params.methodLabel}
Amount: ${amount}
Receipt: ${params.receiptUrl}
${params.customerNote ? `Note: ${params.customerNote}` : ""}
`.trim();

  const html = emailLayout({
    preview: subject,
    title: subject,
    siteUrl: SITE_URL,
    body: `
      ${emailHeading("Payment proof submitted")}
      ${emailParagraph(`Order <strong>${escapeHtml(params.orderReference)}</strong>`)}
      ${emailParagraph(`${escapeHtml(params.customerName)} · ${escapeHtml(params.customerEmail)}`)}
      ${emailParagraph(`Amount: <strong>${amount}</strong>`)}
      ${emailParagraph(`Method: ${escapeHtml(params.methodLabel)}`)}
      ${emailParagraph(`<a href="${escapeHtml(params.receiptUrl)}">View receipt</a>`)}
      ${params.customerNote ? emailParagraph(escapeHtml(params.customerNote)) : ""}
    `,
  });

  return { subject, preview: subject, text, html };
}
