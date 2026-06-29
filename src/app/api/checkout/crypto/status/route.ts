import { NextResponse } from "next/server";
import { isCryptoPaymentsEnabled } from "@/lib/crypto/config";

export async function GET() {
  return NextResponse.json({ enabled: isCryptoPaymentsEnabled() });
}
