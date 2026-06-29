import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Ticket,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { AddToCalendarButton } from "@/components/order/AddToCalendarButton";
import { RESERVATION_HOLD_HOURS } from "@/lib/constants";
import { formatOrderItemLabel } from "@/lib/orders/format-order-item";
import type { ConfirmationOrder } from "@/lib/orders/confirmation-order";
import { formatEventDate, formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

interface OrderConfirmationViewProps {
  order: ConfirmationOrder;
  demoPayment?: boolean;
  cryptoPending?: boolean;
}

function getConfirmationState(
  order: ConfirmationOrder,
  demoPayment?: boolean,
  cryptoPending?: boolean
) {
  const isReservation = order.paymentMethod === "reservation";
  const isCrypto =
    order.paymentMethod === "crypto" &&
    (order.status === "pending_payment" || cryptoPending);
  const isPaid =
    order.status === "paid" ||
    order.status === "ticket_issued" ||
    order.status === "completed" ||
    demoPayment;
  const isTicketSent =
    Boolean(order.ticketSentAt) ||
    order.status === "ticket_issued" ||
    order.status === "completed";
  const isCancelled = order.status === "cancelled";
  const isExpired = order.status === "expired";

  return {
    isReservation,
    isCrypto,
    isPaid,
    isTicketSent,
    isCancelled,
    isExpired,
  };
}

function getHeadline(state: ReturnType<typeof getConfirmationState>) {
  if (state.isCancelled) return "Order cancelled";
  if (state.isExpired) return "Reservation expired";
  if (state.isReservation && !state.isPaid) return "Reservation received";
  if (state.isCrypto) return "Complete your crypto payment";
  if (state.isTicketSent) return "Your tickets are on the way";
  if (state.isPaid) return "Payment confirmed";
  return "Order placed";
}

function getSubheadline(
  order: ConfirmationOrder,
  state: ReturnType<typeof getConfirmationState>
) {
  if (state.isCancelled) {
    return "This order was cancelled. Contact support if you have questions.";
  }
  if (state.isExpired) {
    return "Your hold expired and tickets were released back to inventory.";
  }
  if (state.isReservation && !state.isPaid) {
    return `We've saved your seats for ${RESERVATION_HOLD_HOURS} hours while you complete payment.`;
  }
  if (state.isCrypto) {
    return "Finish payment in your wallet to secure your seats.";
  }
  if (state.isTicketSent) {
    return `E-tickets have been sent to ${order.customerEmail}.`;
  }
  if (state.isPaid) {
    return `We'll email your e-tickets to ${order.customerEmail} shortly.`;
  }
  return `Confirmation details were sent to ${order.customerEmail}.`;
}

function statusIcon(state: ReturnType<typeof getConfirmationState>) {
  if (state.isCancelled || state.isExpired) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-7 w-7 text-red-600" />
      </div>
    );
  }
  if (state.isCrypto) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
        <Clock className="h-7 w-7 text-amber-600" />
      </div>
    );
  }
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
      <CheckCircle2 className="h-7 w-7 text-success" />
    </div>
  );
}

function nextSteps(
  order: ConfirmationOrder,
  state: ReturnType<typeof getConfirmationState>
): { title: string; steps: string[] } {
  if (state.isCancelled || state.isExpired) {
    return {
      title: "Need help?",
      steps: [
        "Browse available events and place a new order",
        "Email support@frontrowly.com with your reference if you believe this is an error",
      ],
    };
  }

  if (state.isReservation && !state.isPaid) {
    return {
      title: "What happens next",
      steps: [
        "We received your reservation request",
        "Our team will email you soon with payment options",
        `Complete payment within ${RESERVATION_HOLD_HOURS} hours to keep your hold`,
        "E-tickets are delivered after payment is confirmed",
      ],
    };
  }

  if (state.isCrypto) {
    return {
      title: "What happens next",
      steps: [
        "Complete payment in your connected wallet (Trust Wallet, MetaMask, etc.)",
        "We confirm your USDC transfer on-chain to our wallet",
        "E-tickets are emailed to you once payment clears",
      ],
    };
  }

  return {
    title: "What happens next",
    steps: state.isTicketSent
      ? [
          "Check your inbox (and spam folder) for your e-tickets",
          "Bring the QR code or mobile ticket to the venue",
          "Arrive early — World Cup events have enhanced security",
        ]
      : [
          "We're preparing your e-tickets",
          "You'll receive them at the email on this order",
          "Save your order reference for support inquiries",
        ],
  };
}

function paymentLabel(method: ConfirmationOrder["paymentMethod"], status: OrderStatus) {
  if (method === "reservation" && status === "reservation_requested") {
    return "Reservation request";
  }
  if (method === "crypto") return "Crypto (USDC)";
  if (method === "card") return "Card";
  return "Reservation";
}

export function OrderConfirmationView({
  order,
  demoPayment,
  cryptoPending,
}: OrderConfirmationViewProps) {
  const state = getConfirmationState(order, demoPayment, cryptoPending);
  const headline = getHeadline(state);
  const subheadline = getSubheadline(order, state);
  const steps = nextSteps(order, state);
  const event = order.event;
  const venueLine = [event?.venueName, event?.venueCity, event?.venueCountry]
    .filter(Boolean)
    .join(", ");
  const calendarLocation = venueLine || "Venue TBA";
  const supportSubject = encodeURIComponent(`Order ${order.reference}`);
  const supportHref = `mailto:support@frontrowly.com?subject=${supportSubject}`;

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto w-fit">{statusIcon(state)}</div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {headline}
          </h1>
          <p className="mt-2 text-slate-600">{subheadline}</p>
          <p className="mt-4 inline-flex rounded-full border border-card-border bg-surface px-4 py-1.5 font-mono text-sm text-slate-700">
            {order.reference}
          </p>
        </div>

        {event && (
          <section className="mt-10 overflow-hidden rounded-2xl border border-card-border bg-white card-shadow">
            <div className="relative aspect-[21/9] w-full bg-surface">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
            <div className="p-5 sm:p-6">
              {event.subtitle && (
                <p className="text-sm font-medium text-primary">{event.subtitle}</p>
              )}
              <h2 className="mt-1 text-xl font-bold text-slate-900">{event.title}</h2>
              {event.eventDate && (
                <p className="mt-2 text-sm text-slate-600">
                  {formatEventDate(event.eventDate, event.eventTime)}
                </p>
              )}
              {venueLine && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  {venueLine}
                </p>
              )}
            </div>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-card-border bg-white p-5 sm:p-6 card-shadow">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-slate-900">Your tickets</h2>
          </div>
          <ul className="mt-4 divide-y divide-card-border">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-slate-900">
                    {formatOrderItemLabel(item)}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {item.quantity} ticket{item.quantity !== 1 ? "s" : ""} ·{" "}
                    {formatPrice(item.unitPrice, order.currency)} each
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-slate-900">
                  {formatPrice(item.quantity * item.unitPrice, order.currency)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4">
            <span className="text-sm text-slate-600">Total</span>
            <span className="text-xl font-bold text-slate-900">
              {formatPrice(order.totalAmount, order.currency)}
            </span>
          </div>
          <dl className="mt-4 grid gap-3 border-t border-card-border pt-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Payment</dt>
              <dd className="font-medium capitalize text-slate-900">
                {paymentLabel(order.paymentMethod, order.status)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{order.customerEmail}</dd>
            </div>
            {order.reservedUntil && state.isReservation && !state.isPaid && (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Hold expires</dt>
                <dd className="font-medium text-slate-900">
                  {formatEventDate(order.reservedUntil.slice(0, 10))}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="mt-6 rounded-2xl border border-card-border bg-white p-5 sm:p-6 card-shadow">
          <h2 className="font-semibold text-slate-900">{steps.title}</h2>
          <ol className="mt-4 space-y-3">
            {steps.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-surface p-4">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-slate-600">
              Questions?{" "}
              <a href={supportHref} className="font-medium text-primary hover:underline">
                support@frontrowly.com
              </a>{" "}
              — include reference <span className="font-mono">{order.reference}</span>
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          {event?.eventDate && !state.isCancelled && !state.isExpired && (
            <AddToCalendarButton
              uid={order.reference}
              title={event.title}
              startDate={event.eventDate}
              startTime={event.eventTime}
              location={calendarLocation}
              description={`Frontrowly order ${order.reference}. ${formatOrderItemLabel(order.items[0] ?? { quantity: 1, unitPrice: 0 })}`}
            />
          )}
          {event?.slug && (
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-card-border bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary/40 hover:bg-surface"
            >
              View event
            </Link>
          )}
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Browse more events
          </Link>
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <HelpCircle className="h-4 w-4" />
          <Link href="/guarantee" className="hover:text-primary hover:underline">
            Buyer guarantee
          </Link>
          <span>·</span>
          <Link href="/delivery" className="hover:text-primary hover:underline">
            Delivery info
          </Link>
          <span>·</span>
          <Link href="/refunds" className="hover:text-primary hover:underline">
            Refunds
          </Link>
        </p>
      </div>
    </div>
  );
}
