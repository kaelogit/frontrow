import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminEmail } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Email + password sign-in; sets session cookies and verifies admin allowlist. */
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase is not configured on this environment." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.trim().toLowerCase(),
    password: parsed.data.password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const email = data.user?.email;
  if (!email || !isAdminEmail(email)) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "This email is not authorized for admin access." },
      { status: 403 }
    );
  }

  if (getAdminEmails().length === 0) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "ADMIN_EMAILS is not configured on this server." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, email });
}

function getAdminEmails(): string[] {
  const raw =
    process.env.ADMIN_EMAILS ??
    process.env.ADMIN_EMAIL ??
    "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
