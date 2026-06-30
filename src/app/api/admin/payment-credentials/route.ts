import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import {
  listAllCredentialsAdmin,
  removeCredential,
  upsertCredential,
} from "@/lib/payments/store";
import type { PaymentCredentialType } from "@/lib/payments/types";

const credentialSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  type: z.enum([
    "wire_us",
    "swift",
    "cashapp",
    "apple_pay",
    "zelle",
    "paypal",
    "crypto",
    "other",
  ]),
  details: z.record(z.string()),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const credentials = await listAllCredentialsAdmin();
  return NextResponse.json({ credentials });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = credentialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const credential = await upsertCredential({
    id: parsed.data.id,
    label: parsed.data.label,
    type: parsed.data.type as PaymentCredentialType,
    details: parsed.data.details,
    is_active: parsed.data.is_active,
  });

  return NextResponse.json({ credential });
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await removeCredential(id);
  return NextResponse.json({ ok: true });
}
