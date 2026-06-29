"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import type { SocialProofSettings } from "@/lib/social-proof/settings";

export async function updateSocialProofAction(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  if (!hasSupabaseConfig()) {
    return { error: "Connect Supabase to save settings." };
  }

  const enabled = formData.get("enabled") === "on";
  const purchaseToastsEnabled = formData.get("purchaseToastsEnabled") === "on";
  const viewersBase = Number(formData.get("viewersBase"));
  const viewersJitterPct = Number(formData.get("viewersJitterPct"));
  const viewersLabel = String(formData.get("viewersLabel") ?? "").trim();
  const followersBase = Number(formData.get("followersBase"));
  const followersJitterPct = Number(formData.get("followersJitterPct"));

  if (
    !Number.isFinite(viewersBase) ||
    !Number.isFinite(viewersJitterPct) ||
    !Number.isFinite(followersBase) ||
    !Number.isFinite(followersJitterPct) ||
    !viewersLabel
  ) {
    return { error: "Invalid values. Check all fields." };
  }

  const value: SocialProofSettings = {
    enabled,
    purchaseToastsEnabled,
    viewersBase: Math.max(0, Math.round(viewersBase)),
    viewersJitterPct: Math.min(20, Math.max(0, viewersJitterPct)),
    viewersLabel,
    followersBase: Math.max(0, Math.round(followersBase)),
    followersJitterPct: Math.min(20, Math.max(0, followersJitterPct)),
  };

  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").upsert({
    key: "social_proof",
    value,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/world-cup-2026");

  return { success: true };
}
