import { z } from "zod";
import { NextResponse } from "next/server";
import { RESERVATION_HOLD_HOURS } from "@/lib/constants";
import { generateOrderReference } from "@/lib/utils";
import { isCryptoPaymentsEnabled } from "@/lib/crypto/config";
import { sendReservationEmails } from "@/lib/email";
import { hasSupabaseConfig, createAdminClient } from "@/lib/supabase/admin";
import { saveDemoOrder, type AdminOrder } from "@/lib/orders/demo-store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit-config";
import {
  releaseExpiredInventory,
  reserveCheckoutItems,
} from "@/lib/inventory/holds";

const checkoutSchema = z.object({
  eventId: z.string(),
  eventSlug: z.string(),
  items: z.array(
    z.object({
      categoryId: z.string().optional(),
      listingId: z.string().optional(),
      categoryName: z.string(),
      sectionNumber: z.string().optional(),
      rowLabel: z.string().optional(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })
  ).min(1),
  customerName: z.string().min(2, "Full name is required"),
  customerEmail: z.string().email(),
  customerPhone: z
    .string()
    .min(8, "Phone number is required")
    .max(24)
    .regex(/^\+?[\d\s().-]{7,}$/, "Enter a valid phone number with country code"),
  paymentMethod: z.enum(["card", "crypto", "reservation"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout data" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Rate limit checkout spam (IP + email).
    const gate = await enforceRateLimit({
      request,
      ...RATE_LIMITS.checkout,
      email: data.customerEmail,
    });
    if (!gate.ok) return gate.response;

    if (data.paymentMethod === "card") {
      return NextResponse.json(
        { error: "Card payments are under maintenance. Choose reservation." },
        { status: 400 }
      );
    }

    if (data.paymentMethod === "crypto") {
      if (!isCryptoPaymentsEnabled()) {
        return NextResponse.json(
          { error: "Crypto payments are not configured. Choose reservation." },
          { status: 503 }
        );
      }
    }

    if (hasSupabaseConfig()) {
      await releaseExpiredInventory();
    }

    const reference = generateOrderReference();
    const total = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const isReservation = data.paymentMethod === "reservation";
    const status = isReservation ? "reservation_requested" : "pending_payment";
    const reservedUntil = new Date(
      Date.now() + RESERVATION_HOLD_HOURS * 60 * 60 * 1000
    ).toISOString();

    const orderRecord = {
      reference,
      event_id: data.eventId,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      total_amount: total,
      currency: "USD",
      payment_method: data.paymentMethod,
      status,
      reserved_until: reservedUntil,
      payment_external_id: null as string | null,
    };

    if (hasSupabaseConfig()) {
      const supabase = createAdminClient();

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderRecord)
        .select("id")
        .single();

      if (orderError || !order) {
        console.error(orderError);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
      }

      const reserve = await reserveCheckoutItems(
        order.id,
        data.items.map((item) => ({
          listingId: item.listingId,
          categoryId: item.categoryId,
          quantity: item.quantity,
        })),
        reservedUntil
      );

      if (!reserve.ok) {
        await supabase.from("orders").delete().eq("id", order.id);
        return NextResponse.json({ error: reserve.message }, { status: 409 });
      }

      const orderItems = data.items.map((item) => ({
        order_id: order.id,
        category_id: item.categoryId ?? null,
        listing_id: item.listingId ?? null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) {
        console.error(itemsError);
        return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
      }
    } else {
      const demoOrder: AdminOrder = {
        id: reference,
        reference,
        event_id: data.eventId,
        event_title: data.eventSlug.replace(/-/g, " "),
        event_slug: data.eventSlug,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        total_amount: total,
        currency: "USD",
        payment_method: data.paymentMethod,
        status: status as AdminOrder["status"],
        payment_external_id: null,
        reserved_until: reservedUntil,
        paid_at: null,
        ticket_sent_at: null,
        admin_notes: null,
        created_at: new Date().toISOString(),
        items: data.items.map((item) => ({
          categoryName: item.categoryName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sectionNumber: item.sectionNumber,
          rowLabel: item.rowLabel,
        })),
      };
      saveDemoOrder(demoOrder);
    }

    if (isReservation) {
      await sendReservationEmails({
        reference,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        eventSlug: data.eventSlug,
        items: data.items,
        total,
      });

      return NextResponse.json({ reference, status: "reservation_requested" });
    }

    return NextResponse.json({
      reference,
      status: "pending_payment",
      total,
      crypto: true,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
