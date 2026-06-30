import { NextResponse } from "next/server";
import { buildPublicOfferView, startPaymentOffer } from "@/lib/payments/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const offer = await startPaymentOffer(token);

  if (!offer) {
    return NextResponse.json({ error: "Cannot start payment" }, { status: 400 });
  }

  const view = await buildPublicOfferView(token);
  if (!view) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(view);
}
