import Link from "next/link";
import { getAdminOrders } from "@/lib/orders/admin-queries";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatEventDate, formatPrice } from "@/lib/utils";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "reservation_requested", label: "Reservations" },
  { value: "pending_payment", label: "Pending payment" },
  { value: "paid", label: "Paid" },
  { value: "ticket_issued", label: "Ticket sent" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const orders = await getAdminOrders(
    params.status ? { status: params.status } : undefined
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-zinc-500">
        Reservation queue and payment confirmations
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const href = tab.value ? `/admin/orders?status=${tab.value}` : "/admin/orders";
          const active = (params.status ?? "") === tab.value;
          return (
            <Link
              key={tab.label}
              href={href}
              className={
                active
                  ? "rounded-full admin-chip-active px-3 py-1 text-xs"
                  : "rounded-full border border-card-border px-3 py-1 text-xs text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-card-border bg-card p-8 text-center text-zinc-500">
          <p>No orders yet.</p>
          <p className="mt-2 text-sm">
            Reservation requests appear here after checkout — or in dev mode after
            a test reservation.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-card-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-card-border bg-card text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.reference} className="border-b border-card-border/50">
                  <td className="px-4 py-3 font-mono text-xs">{order.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-xs text-zinc-500">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{order.event_title}</td>
                  <td className="px-4 py-3">
                    {formatPrice(order.total_amount, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {formatEventDate(order.created_at.slice(0, 10))}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.reference}`}
                      className="text-accent hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
