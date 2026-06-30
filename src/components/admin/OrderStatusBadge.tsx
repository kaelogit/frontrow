import type { OrderStatus } from "@/types/database";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<OrderStatus, string> = {
  reservation_requested: "bg-amber-100 text-amber-900",
  pending_payment: "bg-blue-100 text-blue-900",
  paid: "bg-emerald-100 text-emerald-900",
  ticket_issued: "bg-emerald-100 text-emerald-800",
  completed: "bg-zinc-200 text-zinc-800",
  cancelled: "bg-red-100 text-red-900",
  expired: "bg-zinc-100 text-zinc-600",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  reservation_requested: "Reservation requested",
  pending_payment: "Pending payment",
  paid: "Paid",
  ticket_issued: "Ticket sent",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
