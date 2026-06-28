import { RESERVATION_HOLD_HOURS, SITE_URL } from "@/lib/constants";
import { formatEventDate, formatPrice } from "@/lib/utils";
import {
  emailButton,
  emailEventHero,
  emailHeading,
  emailHighlightBox,
  emailInfoCard,
  emailLayout,
  emailMuted,
  emailParagraph,
  emailTotalRow,
} from "@/emails/layout";
import { formatEmailItemsText, renderEmailItemsTable } from "@/emails/items";
import type { EmailContent, EmailEventContext, EmailOrderItem } from "@/emails/types";
import { escapeHtml, resolveEventImageUrl } from "@/emails/utils";

export interface ReservationCustomerEmailParams {
  reference: string;
  customerName: string;
  event: EmailEventContext;
  items: EmailOrderItem[];
  total: number;
  currency?: string;
}

function formatVenue(event: EmailEventContext): string | null {
  const parts = [event.venueName, event.venueCity, event.venueCountry].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function buildReservationCustomerEmail(
  params: ReservationCustomerEmailParams
): EmailContent {
  const currency = params.currency ?? "USD";
  const imageUrl = resolveEventImageUrl(params.event);
  const venue = formatVenue(params.event);
  const confirmationUrl = `${SITE_URL}/order/${encodeURIComponent(params.reference)}/confirmation`;
  const totalFormatted = formatPrice(params.total, currency);
  const eventDate =
    params.event.date != null
      ? formatEventDate(params.event.date, params.event.time)
      : null;

  const subject = `Reservation received — ${params.reference}`;
  const preview = `We saved your seats for ${params.event.title}. Reference ${params.reference}.`;

  const text = `
Hi ${params.customerName},

We received your ticket reservation request.

Reference: ${params.reference}
Event: ${params.event.title}${eventDate ? `\nDate: ${eventDate}` : ""}${venue ? `\nVenue: ${venue}` : ""}

Tickets:
${formatEmailItemsText(params.items, currency)}

Total: ${totalFormatted}

We've saved your seats for ${RESERVATION_HOLD_HOURS} hours while you complete payment. Our team will contact you shortly with payment options.

View your order: ${confirmationUrl}

Thank you,
Frontrowly
`.trim();

  const infoRows = [
    { label: "Reference", value: escapeHtml(params.reference) },
    ...(eventDate ? [{ label: "Date", value: escapeHtml(eventDate) }] : []),
    ...(venue ? [{ label: "Venue", value: escapeHtml(venue) }] : []),
  ];

  const html = emailLayout({
    preview,
    title: subject,
    siteUrl: SITE_URL,
    body: `
      ${emailEventHero(imageUrl, params.event.title)}
      ${emailHeading("Reservation received")}
      ${emailParagraph(`Hi ${escapeHtml(params.customerName)},`)}
      ${emailMuted(`We've saved your seats for <strong>${RESERVATION_HOLD_HOURS} hours</strong> while you complete payment.`)}
      ${emailInfoCard([
        { label: "Event", value: escapeHtml(params.event.title) },
        ...infoRows,
      ])}
      ${renderEmailItemsTable(params.items, currency)}
      ${emailTotalRow(totalFormatted)}
      ${emailHighlightBox(
        `Our team will email you shortly with payment options. Once payment is confirmed, your e-ticket will be sent to this address.`
      )}
      ${emailButton(confirmationUrl, "View order details")}
    `,
  });

  return { subject, preview, html, text };
}
