import { NextResponse } from "next/server";
import { z } from "zod";
import { RESERVATION_HOLD_HOURS } from "@/lib/constants";
import { getAdminSession } from "@/lib/auth/session";
import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import {
  getDemoOrder,
  updateDemoOrder,
  type AdminOrder,
} from "@/lib/orders/demo-store";
import { sendTicketEmail, ticketEmailFromOrder } from "@/lib/email";
import type { OrderStatus } from "@/types/database";
import {
  extendOrderHold,
  finalizeOrderInventory,
  releaseOrderInventory,
} from "@/lib/inventory/holds";

const actionSchema = z.object({
  action: z.enum([
    "confirm_payment",
    "mark_paid",
    "send_ticket",
    "complete",
    "cancel",
    "extend_hold",
  ]),
  note: z.string().optional(),
});

function nextStatus(
  current: OrderStatus,
  action: z.infer<typeof actionSchema>["action"]
): OrderStatus | null {
  switch (action) {
    case "confirm_payment":
      return current === "reservation_requested" ? "pending_payment" : null;
    case "mark_paid":
      return current === "pending_payment" ? "paid" : null;
    case "send_ticket":
      return current === "paid" ? "ticket_issued" : null;
    case "complete":
      return current === "ticket_issued" ? "completed" : null;
    case "cancel":
      return ["reservation_requested", "pending_payment", "paid"].includes(current)
        ? "cancelled"
        : null;
    case "extend_hold":
      return current === "pending_payment" ? current : null;
    default:
      return null;
  }
}

async function loadOrder(reference: string): Promise<AdminOrder | null> {
  if (!hasSupabaseConfig()) {
    return getDemoOrder(reference);
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, event:events(title, slug)")
    .eq("reference", reference)
    .single();

  if (!data) return getDemoOrder(reference);

  const event = data.event as { title?: string; slug?: string } | null;

  return {
    id: data.id,
    reference: data.reference,
    event_id: data.event_id,
    event_title: event?.title ?? "Unknown event",
    event_slug: event?.slug ?? "",
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    total_amount: Number(data.total_amount),
    currency: data.currency,
    payment_method: data.payment_method,
    status: data.status,
    payment_external_id: data.payment_external_id,
    reserved_until: data.reserved_until,
    paid_at: data.paid_at,
    ticket_sent_at: data.ticket_sent_at,
    admin_notes: data.admin_notes,
    created_at: data.created_at,
    items: [],
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reference } = await params;
  const body = await request.json();
  const parsed = actionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { action, note } = parsed.data;
  const order = await loadOrder(reference);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const newStatus = nextStatus(order.status, action);

  if (action !== "extend_hold" && !newStatus) {
    return NextResponse.json(
      { error: `Cannot ${action.replace("_", " ")} from status ${order.status}` },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {};

  if (action === "extend_hold") {
    if (order.status !== "pending_payment") {
      return NextResponse.json({ error: "Can only extend pending payments" }, { status: 400 });
    }
    const newExpiry = new Date(
      Date.now() + RESERVATION_HOLD_HOURS * 60 * 60 * 1000
    ).toISOString();
    patch.reserved_until = newExpiry;
    if (hasSupabaseConfig()) {
      await extendOrderHold(order.id, newExpiry);
    }
  } else {
    patch.status = newStatus;
    if (action === "mark_paid") patch.paid_at = now;
    if (action === "send_ticket") patch.ticket_sent_at = now;
  }

  if (note) {
    patch.admin_notes = [order.admin_notes, note].filter(Boolean).join("\n");
  }

  if (!hasSupabaseConfig()) {
    updateDemoOrder(reference, patch as Partial<AdminOrder>);
  } else {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("orders")
      .update(patch)
      .eq("reference", reference);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    if (action === "cancel") {
      await releaseOrderInventory(order.id);
    } else if (action === "mark_paid") {
      await finalizeOrderInventory(order.id);
    }
  }

  if (action === "send_ticket") {
    await sendTicketEmail(ticketEmailFromOrder(order));
  }

  return NextResponse.json({ ok: true, status: patch.status ?? order.status });
}
