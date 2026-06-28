import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { getAdminDashboardStats } from "@/lib/admin/dashboard-stats";
import { formatEventDate, formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const kpiCards = [
    { label: "Active events", value: String(stats.activeEvents), href: "/admin/events" },
    {
      label: "Open reservations",
      value: String(stats.openReservations),
      href: "/admin/orders?status=reservation_requested",
      highlight: stats.openReservations > 0,
    },
    {
      label: "Pending payments",
      value: String(stats.pendingPayments),
      href: "/admin/orders?status=pending_payment",
    },
    {
      label: "Paid revenue",
      value: formatPrice(stats.paidRevenue),
      href: "/admin/orders?status=paid",
    },
    { label: "Orders today", value: String(stats.ordersToday), href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-zinc-500">Manage events, tickets, and orders</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-xl border bg-card p-5 transition hover:border-primary/40 ${
              stat.highlight
                ? "border-amber-500/40 bg-amber-500/5"
                : "border-card-border"
            }`}
          >
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
          </Link>
        ))}
      </div>

      {stats.openReservations > 0 && (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <strong>{stats.openReservations} reservation request(s)</strong> waiting for
          review.{" "}
          <Link href="/admin/orders?status=reservation_requested" className="underline">
            Open queue →
          </Link>
        </div>
      )}

      <div className="mt-10 grid gap-8 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="mt-4 rounded-xl border border-card-border bg-card p-8 text-center text-zinc-500">
              No orders yet.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-card-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-card-border bg-card text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr
                      key={order.reference}
                      className="border-b border-card-border/50 hover:bg-card/60"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.reference}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {order.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-zinc-500">{order.customer_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="line-clamp-1">{order.event_title}</p>
                        {order.event_date ? (
                          <p className="text-xs text-zinc-500">
                            {formatEventDate(order.event_date, order.event_time)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatPrice(order.total_amount, order.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold">Low stock events</h2>
            <Link href="/admin/events" className="text-sm text-primary hover:underline">
              All events
            </Link>
          </div>

          {stats.lowStockEvents.length === 0 ? (
            <div className="mt-4 rounded-xl border border-card-border bg-card p-6 text-sm text-zinc-500">
              No events are running low on inventory.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.lowStockEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/admin/events/${event.id}/listings`}
                    className="block rounded-xl border border-card-border bg-card p-4 transition hover:border-primary/40"
                  >
                    <p className="font-medium line-clamp-2">{event.title}</p>
                    <p className="mt-2 text-sm text-zinc-500">
                      {event.available} tickets left
                      {event.scarcityPercent != null
                        ? ` · ${event.scarcityPercent}% remaining`
                        : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-10">
        <h2 className="font-semibold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/events/new"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black"
          >
            New event
          </Link>
          <Link
            href="/admin/events"
            className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium"
          >
            Manage events
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium"
          >
            View orders
          </Link>
        </div>
      </div>
    </div>
  );
}
