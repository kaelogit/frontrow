import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import { updatePaymentOfferAdmin } from "@/lib/payments/store";

const patchSchema = z.object({
  amount: z.number().positive().optional(),
  method_label: z.string().min(1).optional(),
  instructions: z.record(z.string(), z.string()).optional(),
  expiry_minutes: z.number().int().positive().optional(),
  revoke: z.boolean().optional(),
  reset_timer: z.boolean().optional(),
  sync_credential: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const offer = await updatePaymentOfferAdmin(id, parsed.data);
  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  return NextResponse.json({ offer });
}
