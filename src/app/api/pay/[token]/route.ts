import { NextResponse } from "next/server";
import { buildPublicOfferView } from "@/lib/payments/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const view = await buildPublicOfferView(token);

  if (!view) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(view);
}
