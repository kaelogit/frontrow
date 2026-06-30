import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrderByReference } from "@/lib/orders/admin-queries";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderActions } from "@/components/admin/OrderActions";
import { PaymentOfferManager } from "@/components/admin/PaymentOfferManager";
import { formatEventDate, formatPrice } from "@/lib/utils";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = await getAdminOrderByReference(reference);

  if (!order) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl font-bold">{order.reference}</h1>
          <p className="mt-1 text-zinc-500">
            Placed {formatEventDate(order.created_at.slice(0, 10))}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-card-border bg-card p-5">
          <h2 className="font-semibold">Customer</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-zinc-500">Name</dt>
              <dd>{order.customer_name}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd>
                <a
                  href={`mailto:${order.customer_email}`}
                  className="text-accent hover:underline"
                >
                  {order.customer_email}
                </a>
              </dd>
            </div>
            {order.customer_phone && (
              <div>
                <dt className="text-zinc-500">Phone</dt>
                <dd>{order.customer_phone}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-xl border border-card-border bg-card p-5">
          <h2 className="font-semibold">Event</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-zinc-500">Match</dt>
              <dd>
                {order.event_slug ? (
                  <Link
                    href={`/events/${order.event_slug}`}
                    className="text-accent hover:underline"
                  >
                    {order.event_title}
                  </Link>
                ) : (
                  order.event_title
                )}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Payment</dt>
              <dd className="capitalize">{order.payment_method}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Total</dt>
              <dd className="text-lg font-bold">
                {formatPrice(order.total_amount, order.currency)}
              </dd>
            </div>
            {order.reserved_until && (
              <div>
                <dt className="text-zinc-500">Hold until</dt>
                <dd>{formatEventDate(order.reserved_until.slice(0, 10))}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-card-border bg-card p-5">
        <h2 className="font-semibold">Tickets</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between border-b border-card-border/50 pb-2">
              <span>
                {item.categoryName ??
                  [item.sectionNumber && `Section ${item.sectionNumber}`, item.rowLabel && `Row ${item.rowLabel}`]
                    .filter(Boolean)
                    .join(" · ") ??
                  "Ticket"}
                {" × "}
                {item.quantity}
              </span>
              <span>{formatPrice(item.quantity * item.unitPrice, order.currency)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-card-border bg-card p-5">
        <PaymentOfferManager
          reference={order.reference}
          defaultAmount={order.total_amount}
          currency={order.currency}
        />
      </section>

      <section className="mt-6 rounded-xl border border-card-border bg-card p-5">
        <h2 className="font-semibold">Actions</h2>
        <div className="mt-4">
          <OrderActions reference={order.reference} status={order.status} />
        </div>
      </section>
    </div>
  );
}
