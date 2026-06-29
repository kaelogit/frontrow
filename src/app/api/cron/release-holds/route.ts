import { NextResponse } from "next/server";
import { releaseExpiredInventory } from "@/lib/inventory/holds";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** Release expired reservation holds — manual trigger; production runs via Supabase pg_cron. */
export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const released = await releaseExpiredInventory();
  return NextResponse.json({ ok: true, ordersExpired: released });
}

export async function GET(request: Request) {
  return POST(request);
}
