import { SITE_URL } from "@/lib/constants";
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

export interface TicketConfirmationEmailParams {
  reference: string;
  customerName: string;
  event: EmailEventContext;
  items?: EmailOrderItem[];
  total?: number;
  currency?: string;
}

function formatVenue(event: EmailEventContext): string | null {
  const parts = [event.venueName, event.venueCity, event.venueCountry].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function buildTicketConfirmationEmail(
  params: TicketConfirmationEmailParams
): EmailContent {
  const currency = params.currency ?? "USD";
  const imageUrl = resolveEventImageUrl(params.event);
  const confirmationUrl = `${SITE_URL}/order/${encodeURIComponent(params.reference)}/confirmation`;
  const eventDate =
    params.event.date != null
      ? formatEventDate(params.event.date, params.event.time)
      : null;
  const venue = formatVenue(params.event);
  const hasItems = Boolean(params.items?.length);

  const subject = `Your tickets — ${params.reference}`;
  const preview = `Payment confirmed for ${params.event.title}. Order ${params.reference}.`;

  const itemsText = hasItems
    ? `\n\nTickets:\n${formatEmailItemsText(params.items!, currency)}`
    : "";
  const totalText =
    params.total != null ? `\n\nTotal: ${formatPrice(params.total, currency)}` : "";

  const text = `
Hi ${params.customerName},

Your payment has been confirmed for ${params.event.title}.

Order reference: ${params.reference}${eventDate ? `\nDate: ${eventDate}` : ""}${venue ? `\nVenue: ${venue}` : ""}${itemsText}${totalText}

Your e-ticket details are included with this email. Present your tickets at the venue entrance.

View your order: ${confirmationUrl}

See you at the event!
Frontrowly
`.trim();

  const bodyParts = [
    emailEventHero(imageUrl, params.event.title),
    emailHeading("Payment confirmed"),
    emailParagraph(`Hi ${escapeHtml(params.customerName)},`),
    emailMuted(
      `Your payment for <strong>${escapeHtml(params.event.title)}</strong> is confirmed.`
    ),
    emailInfoCard([
      { label: "Reference", value: escapeHtml(params.reference) },
      ...(eventDate ? [{ label: "Date", value: escapeHtml(eventDate) }] : []),
      ...(venue ? [{ label: "Venue", value: escapeHtml(venue) }] : []),
    ]),
  ];

  if (hasItems) {
    bodyParts.push(renderEmailItemsTable(params.items!, currency));
    if (params.total != null) {
      bodyParts.push(emailTotalRow(formatPrice(params.total, currency)));
    }
  }

  bodyParts.push(
    emailHighlightBox(
      `Your e-ticket is ready. Check your inbox for delivery details or view your order online. Present your tickets at the venue entrance.`
    ),
    emailButton(confirmationUrl, "View order & tickets")
  );

  const html = emailLayout({
    preview,
    title: subject,
    siteUrl: SITE_URL,
    body: bodyParts.join(""),
  });

  return { subject, preview, html, text };
}
