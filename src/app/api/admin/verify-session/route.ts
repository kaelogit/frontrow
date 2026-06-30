import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

/** After client sign-in, confirm the session email is on the admin allowlist. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdminEmail(user.email)) {
    await supabase.auth.signOut();
    return NextResponse.json({ authorized: false });
  }

  return NextResponse.json({ authorized: true, email: user.email });
}
