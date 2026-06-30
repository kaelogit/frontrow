import { getEventBySlug } from "@/lib/data/events";
import type { AdminOrder } from "@/lib/orders/demo-store";
import {
  eventToEmailContext,
  fallbackEventContext,
  orderToEmailContext,
} from "@/emails/event-context";
import {
  buildCryptoCheckoutAdminEmail,
  buildCryptoCheckoutCustomerEmail,
  buildCryptoPaidAdminEmail,
  buildCryptoPaidCustomerEmail,
} from "@/emails/crypto-checkout";
import { buildReservationAdminEmail } from "@/emails/reservation-admin";
import { buildReservationCustomerEmail } from "@/emails/reservation-customer";
import { buildTicketConfirmationEmail } from "@/emails/ticket-confirmation";
import {
  buildPaymentOfferCustomerEmail,
  buildPaymentSubmittedAdminEmail,
  buildPaymentSubmittedCustomerEmail,
} from "@/emails/payment-offer";
import type { EmailOrderItem } from "@/emails/types";
import { getAdminInboxEmail, getFromEmail, getSupportReplyToEmail } from "@/lib/email-config";

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

async function getResendClient() {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return null;
  const { Resend } = await import("resend");
  return new Resend(resendKey);
}

export async function sendReservationEmails(params: ReservationEmailParams) {
  const adminEmail = getAdminInboxEmail();
  const fromEmail = getFromEmail();
  const supportReplyTo = getSupportReplyToEmail();

  const event = await resolveEventForReservation(params.eventSlug);
  const adminContent = buildReservationAdminEmail({ ...params, event });
  const customerContent = buildReservationCustomerEmail({ ...params, event });

  const resend = await getResendClient();
  if (!resend) {
    console.log("[Email] Reservation — admin:\n", adminContent.text);
    console.log("[Email] Reservation — customer:\n", customerContent.text);
    return;
  }

  await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: params.customerEmail,
      subject: adminContent.subject,
      text: adminContent.text,
      html: adminContent.html,
    }),
    resend.emails.send({
      from: fromEmail,
      to: params.customerEmail,
      replyTo: supportReplyTo,
      subject: customerContent.subject,
      text: customerContent.text,
      html: customerContent.html,
    }),
  ]);
}

export async function sendCryptoCheckoutEmails(params: {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventSlug: string;
  total: number;
  currency?: string;
}) {
  const adminEmail = getAdminInboxEmail();
  const fromEmail = getFromEmail();
  const supportReplyTo = getSupportReplyToEmail();

  const event = await resolveEventForReservation(params.eventSlug);
  const adminContent = buildCryptoCheckoutAdminEmail({
    ...params,
    eventTitle: event.title,
  });
  const customerContent = buildCryptoCheckoutCustomerEmail({
    customerName: params.customerName,
    reference: params.reference,
    total: params.total,
    currency: params.currency,
  });

  const resend = await getResendClient();
  if (!resend) {
    console.log("[Email] Crypto checkout — admin:\n", adminContent.text);
    console.log("[Email] Crypto checkout — customer:\n", customerContent.text);
    return;
  }

  await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: params.customerEmail,
      subject: adminContent.subject,
      text: adminContent.text,
      html: adminContent.html,
    }),
    resend.emails.send({
      from: fromEmail,
      to: params.customerEmail,
      replyTo: supportReplyTo,
      subject: customerContent.subject,
      text: customerContent.text,
      html: customerContent.html,
    }),
  ]);
}

export async function sendCryptoPaidEmails(params: {
  reference: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency?: string;
  paymentId: string;
  externalId: string;
}) {
  const adminEmail = getAdminInboxEmail();
  const fromEmail = getFromEmail();
  const supportReplyTo = getSupportReplyToEmail();

  const customerContent = buildCryptoPaidCustomerEmail({
    customerName: params.customerName,
    reference: params.reference,
    total: params.total,
    currency: params.currency,
  });
  const adminContent = buildCryptoPaidAdminEmail(params);

  const resend = await getResendClient();
  if (!resend) {
    console.log("[Email] Crypto paid — customer:\n", customerContent.text);
    console.log("[Email] Crypto paid — admin:\n", adminContent.text);
    return;
  }

  await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: params.customerEmail,
      replyTo: supportReplyTo,
      subject: customerContent.subject,
      text: customerContent.text,
      html: customerContent.html,
    }),
    resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: params.customerEmail,
      subject: adminContent.subject,
      text: adminContent.text,
      html: adminContent.html,
    }),
  ]);
}

export async function sendTicketEmail(params: TicketEmailParams) {
  const fromEmail = getFromEmail();
  const supportReplyTo = getSupportReplyToEmail();

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

  const resend = await getResendClient();
  if (!resend) {
    console.log("[Email] Ticket confirmation:\n", content.text);
    return;
  }

  await resend.emails.send({
    from: fromEmail,
    to: params.customerEmail,
    replyTo: supportReplyTo,
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

export async function sendPaymentOfferEmail(params: {
  customerName: string;
  customerEmail: string;
  orderReference: string;
  amount: number;
  currency: string;
  methodLabel: string;
  token: string;
  expiryMinutes: number;
}) {
  const fromEmail = getFromEmail();
  const supportReplyTo = getSupportReplyToEmail();
  const content = buildPaymentOfferCustomerEmail(params);

  const resend = await getResendClient();
  if (!resend) {
    console.log("[Email] Payment offer:\n", content.text);
    return;
  }

  await resend.emails.send({
    from: fromEmail,
    to: params.customerEmail,
    replyTo: supportReplyTo,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });
}

export async function sendPaymentSubmittedEmails(params: {
  customerName: string;
  customerEmail: string;
  orderReference: string;
  methodLabel: string;
  amount: number;
  currency: string;
  receiptUrl: string;
  customerNote?: string | null;
}) {
  const adminEmail = getAdminInboxEmail();
  const fromEmail = getFromEmail();
  const supportReplyTo = getSupportReplyToEmail();

  const customer = buildPaymentSubmittedCustomerEmail({
    customerName: params.customerName,
    orderReference: params.orderReference,
  });
  const admin = buildPaymentSubmittedAdminEmail(params);

  const resend = await getResendClient();
  if (!resend) {
    console.log("[Email] Payment submitted — customer:\n", customer.text);
    console.log("[Email] Payment submitted — admin:\n", admin.text);
    return;
  }

  await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: params.customerEmail,
      replyTo: supportReplyTo,
      subject: customer.subject,
      text: customer.text,
      html: customer.html,
    }),
    resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: params.customerEmail,
      subject: admin.subject,
      text: admin.text,
      html: admin.html,
    }),
  ]);
}

interface ContactEmailParams {
  name: string;
  email: string;
  message: string;
  orderReference?: string;
}

export async function sendContactEmails(params: ContactEmailParams) {
  const adminEmail = getAdminInboxEmail();
  const fromEmail = getFromEmail();
  const supportReplyTo = getSupportReplyToEmail();

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

  const resend = await getResendClient();
  if (!resend) {
    console.log("[Email] Contact — admin:\n", adminText);
    console.log("[Email] Contact — customer:\n", customerText);
    return;
  }

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
      replyTo: supportReplyTo,
      subject: customerSubject,
      text: customerText,
    }),
  ]);
}
