import { SITE_URL } from "@/lib/constants";
import { formatEventDate, formatPrice } from "@/lib/utils";
import {
  emailButton,
  emailEventHero,
  emailHeading,
  emailInfoCard,
  emailLayout,
  emailMuted,
  emailParagraph,
  emailTotalRow,
} from "@/emails/layout";
import { formatEmailItemsText, renderEmailItemsTable } from "@/emails/items";
import type { EmailContent, EmailEventContext, EmailOrderItem } from "@/emails/types";
import { escapeHtml, resolveEventImageUrl } from "@/emails/utils";

export interface ReservationAdminEmailParams {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  event: EmailEventContext;
  items: EmailOrderItem[];
  total: number;
  currency?: string;
}

export function buildReservationAdminEmail(
  params: ReservationAdminEmailParams
): EmailContent {
  const currency = params.currency ?? "USD";
  const imageUrl = resolveEventImageUrl(params.event);
  const adminUrl = `${SITE_URL}/admin/orders`;
  const totalFormatted = formatPrice(params.total, currency);
  const eventDate =
    params.event.date != null
      ? formatEventDate(params.event.date, params.event.time)
      : null;

  const subject = `[Frontrowly] New reservation ${params.reference}`;
  const preview = `${params.customerName} requested tickets for ${params.event.title}.`;

  const text = `
New reservation request on Frontrowly

Reference: ${params.reference}
Event: ${params.event.title}${eventDate ? ` (${eventDate})` : ""}

Customer: ${params.customerName}
Email: ${params.customerEmail}
Phone: ${params.customerPhone ?? "N/A"}

Tickets:
${formatEmailItemsText(params.items, currency)}

Total: ${totalFormatted}

Reply to the customer with payment options, then confirm in admin:
${adminUrl}
`.trim();

  const html = emailLayout({
    preview,
    title: subject,
    siteUrl: SITE_URL,
    body: `
      ${emailEventHero(imageUrl, params.event.title)}
      ${emailHeading("New reservation request")}
      ${emailParagraph(`<strong>${escapeHtml(params.customerName)}</strong> submitted a reservation for <strong>${escapeHtml(params.event.title)}</strong>.`)}
      ${emailInfoCard([
        { label: "Reference", value: escapeHtml(params.reference) },
        { label: "Customer", value: escapeHtml(params.customerName) },
        { label: "Email", value: `<a href="mailto:${escapeHtml(params.customerEmail)}" style="color:#0284c7;text-decoration:none;">${escapeHtml(params.customerEmail)}</a>` },
        { label: "Phone", value: escapeHtml(params.customerPhone ?? "N/A") },
        ...(eventDate ? [{ label: "Date", value: escapeHtml(eventDate) }] : []),
      ])}
      ${renderEmailItemsTable(params.items, currency)}
      ${emailTotalRow(totalFormatted)}
      ${emailMuted("Reply to the customer with payment options, then update the order in admin.")}
      ${emailButton(adminUrl, "Open admin orders")}
    `,
  });

  return { subject, preview, html, text };
}
