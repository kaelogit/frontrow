import { getEventBySlug } from "@/lib/data/events";
import type { AdminOrder } from "@/lib/orders/demo-store";
import {
  eventToEmailContext,
  fallbackEventContext,
  orderToEmailContext,
} from "@/emails/event-context";
import { buildReservationAdminEmail } from "@/emails/reservation-admin";
import { buildReservationCustomerEmail } from "@/emails/reservation-customer";
import { buildTicketConfirmationEmail } from "@/emails/ticket-confirmation";
import type { EmailOrderItem } from "@/emails/types";

interface ReservationEmailParams {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventSlug: string;
  items: EmailOrderItem[];
  total: number;
  currency?: string;
}

export interface TicketEmailParams {
  customerEmail: string;
  customerName: string;
  reference: string;
  eventTitle: string;
  eventSlug?: string;
  items?: EmailOrderItem[];
  total?: number;
  currency?: string;
  order?: AdminOrder;
}

async function resolveEventForReservation(eventSlug: string) {
  const event = await getEventBySlug(eventSlug);
  if (event) return eventToEmailContext(event);
  return fallbackEventContext(eventSlug);
}

function resolveEventForTicket(params: TicketEmailParams) {
  if (params.order) return orderToEmailContext(params.order);
  return fallbackEventContext(params.eventSlug ?? "", params.eventTitle);
}

export async function sendReservationEmails(params: ReservationEmailParams) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@frontrowly.com";
  const fromEmail = process.env.FROM_EMAIL ?? "tickets@frontrowly.com";
  const resendKey = process.env.RESEND_API_KEY;

  const event = await resolveEventForReservation(params.eventSlug);
  const adminContent = buildReservationAdminEmail({ ...params, event });
  const customerContent = buildReservationCustomerEmail({ ...params, event });

  if (!resendKey) {
    console.log("[Email] Reservation — admin:\n", adminContent.text);
    console.log("[Email] Reservation — customer:\n", customerContent.text);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: adminContent.subject,
      text: adminContent.text,
      html: adminContent.html,
    }),
    resend.emails.send({
      from: fromEmail,
      to: params.customerEmail,
      subject: customerContent.subject,
      text: customerContent.text,
      html: customerContent.html,
    }),
  ]);
}

export async function sendTicketEmail(params: TicketEmailParams) {
  const fromEmail = process.env.FROM_EMAIL ?? "tickets@frontrowly.com";
  const resendKey = process.env.RESEND_API_KEY;

  const event = resolveEventForTicket(params);
  const items = params.items ?? params.order?.items;
  const total = params.total ?? params.order?.total_amount;
  const currency = params.currency ?? params.order?.currency ?? "USD";

  const content = buildTicketConfirmationEmail({
    reference: params.reference,
    customerName: params.customerName,
    event,
    items,
    total,
    currency,
  });

  if (!resendKey) {
    console.log("[Email] Ticket confirmation:\n", content.text);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  await resend.emails.send({
    from: fromEmail,
    to: params.customerEmail,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });
}

export function ticketEmailFromOrder(order: AdminOrder) {
  return {
    customerEmail: order.customer_email,
    customerName: order.customer_name,
    reference: order.reference,
    eventTitle: order.event_title,
    eventSlug: order.event_slug,
    items: order.items,
    total: order.total_amount,
    currency: order.currency,
    order,
  };
}

interface ContactEmailParams {
  name: string;
  email: string;
  message: string;
  orderReference?: string;
}

export async function sendContactEmails(params: ContactEmailParams) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "support@frontrowly.com";
  const fromEmail = process.env.FROM_EMAIL ?? "tickets@frontrowly.com";
  const resendKey = process.env.RESEND_API_KEY;

  const adminSubject = `Contact: ${params.name}${params.orderReference ? ` (${params.orderReference})` : ""}`;
  const adminText = [
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    params.orderReference ? `Order reference: ${params.orderReference}` : null,
    "",
    params.message,
  ]
    .filter(Boolean)
    .join("\n");

  const customerSubject = "We received your message — Frontrowly";
  const customerText = `Hi ${params.name},

Thanks for contacting Frontrowly. We've received your message and aim to reply within 24 hours on business days.

If your enquiry is about an existing order, include your order reference in any follow-up emails.

— The Frontrowly team`;

  if (!resendKey) {
    console.log("[Email] Contact — admin:\n", adminText);
    console.log("[Email] Contact — customer:\n", customerText);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: params.email,
      subject: adminSubject,
      text: adminText,
    }),
    resend.emails.send({
      from: fromEmail,
      to: params.email,
      subject: customerSubject,
      text: customerText,
    }),
  ]);
}
