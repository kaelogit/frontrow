import { NextResponse } from "next/server";
import { sendTicketEmail, ticketEmailFromOrder } from "@/lib/email";
import { getAdminOrderByReference } from "@/lib/orders/admin-queries";
import { hasSupabaseConfig, createAdminClient } from "@/lib/supabase/admin";

/**
 * WalletConnect Pay webhook — adjust payload parsing per live dashboard docs.
 */
export async function POST(request: Request) {
  let event: {
    type?: string;
    data?: {
      referenceId?: string;
      status?: string;
      id?: string;
    };
  };

  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reference = event.data?.referenceId;
  const status = event.data?.status;

  if (!reference || status !== "succeeded") {
    return NextResponse.json({ received: true });
  }

  if (hasSupabaseConfig()) {
    const supabase = createAdminClient();

    const { data: order } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("reference", reference)
      .select("*, events(title)")
      .single();

    if (order) {
      const fullOrder = await getAdminOrderByReference(reference);
      await sendTicketEmail(
        fullOrder
          ? ticketEmailFromOrder(fullOrder)
          : {
              customerEmail: order.customer_email,
              customerName: order.customer_name,
              reference: order.reference,
              eventTitle:
                (order.events as { title: string })?.title ?? "Your event",
            }
      );

      await supabase
        .from("orders")
        .update({
          status: "ticket_issued",
          ticket_sent_at: new Date().toISOString(),
        })
        .eq("reference", reference);
    }
  }

  return NextResponse.json({ received: true });
}
