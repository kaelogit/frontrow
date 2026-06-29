"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import type { FxSettings } from "@/lib/fx/settings";

function readRate(formData: FormData, code: string): number | undefined {
  const raw = String(formData.get(`rate_${code}`) ?? "").trim();
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

export async function updateFxSettingsAction(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  if (!hasSupabaseConfig()) {
    return { error: "Connect Supabase to save settings." };
  }

  const enabled = formData.get("enabled") === "on";
  const disclaimer = String(formData.get("disclaimer") ?? "").trim();

  const value: FxSettings = {
    enabled,
    base: "USD",
    rates: {
      EUR: readRate(formData, "EUR"),
      GBP: readRate(formData, "GBP"),
      CAD: readRate(formData, "CAD"),
      AED: readRate(formData, "AED"),
      BRL: readRate(formData, "BRL"),
    },
    disclaimer: disclaimer || "Estimated conversion. Checkout in USD.",
  };

  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").upsert({
    key: "fx",
    value,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/world-cup-2026");
  return { success: true };
}

