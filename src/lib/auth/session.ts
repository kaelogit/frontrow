import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth/admin";

export interface AdminSession {
  email: string;
  devMode: boolean;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!hasSupabaseConfig()) {
    if (process.env.NODE_ENV === "development") {
      return { email: "dev@localhost", devMode: true };
    }
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdminEmail(user.email)) {
    return null;
  }

  return { email: user.email, devMode: false };
}
