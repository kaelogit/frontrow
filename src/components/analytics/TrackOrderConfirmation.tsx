"use client";

import { useEffect, useRef } from "react";
import type { ConfirmationOrder } from "@/lib/orders/confirmation-order";
import { clearCheckoutSession } from "@/lib/checkout/storage";
import { trackOrderComplete } from "@/lib/analytics/funnel";

interface TrackOrderConfirmationProps {
  order: ConfirmationOrder;
}

export function TrackOrderConfirmation({ order }: TrackOrderConfirmationProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    clearCheckoutSession();

    trackOrderComplete({
      reference: order.reference,
      eventSlug: order.event?.slug ?? "unknown",
      paymentMethod: order.paymentMethod,
      status: order.status,
      total: order.totalAmount,
      currency: order.currency,
    });
  }, [order]);

  return null;
}
