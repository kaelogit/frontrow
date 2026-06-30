"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/types/database";
import { LoadingButton } from "@/components/ui/LoadingButton";

type OrderAction =
  | "confirm_payment"
  | "mark_paid"
  | "send_ticket"
  | "complete"
  | "cancel"
  | "extend_hold";

interface OrderActionsProps {
  reference: string;
  status: OrderStatus;
}

const ACTIONS: Record<
  OrderStatus,
  { action: OrderAction; label: string; variant?: "danger" | "primary" }[]
> = {
  reservation_requested: [
    { action: "confirm_payment", label: "Confirm payment", variant: "primary" },
    { action: "cancel", label: "Cancel", variant: "danger" },
  ],
  pending_payment: [
    { action: "mark_paid", label: "Mark paid", variant: "primary" },
    { action: "extend_hold", label: "Extend hold 48h" },
    { action: "cancel", label: "Cancel", variant: "danger" },
  ],
  paid: [
    { action: "send_ticket", label: "Send ticket", variant: "primary" },
    { action: "cancel", label: "Cancel", variant: "danger" },
  ],
  ticket_issued: [{ action: "complete", label: "Mark completed", variant: "primary" }],
  completed: [],
  cancelled: [],
  expired: [],
};

export function OrderActions({ reference, status }: OrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<OrderAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions = ACTIONS[status];

  const runAction = async (action: OrderAction) => {
    setLoading(action);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${reference}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Action failed");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(null);
    }
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {actions.map(({ action, label, variant }) => (
          <LoadingButton
            key={action}
            disabled={loading !== null}
            loading={loading === action}
            loadingLabel={label}
            onClick={() => runAction(action)}
            className={
              variant === "primary"
                ? "admin-btn-primary"
                : variant === "danger"
                  ? "rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800 disabled:opacity-60"
                  : "rounded-lg border border-card-border px-4 py-2 text-sm disabled:opacity-60"
            }
          >
            {label}
          </LoadingButton>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
