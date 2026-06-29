import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/admin";

export interface SocialProofSettings {
  enabled: boolean;
  purchaseToastsEnabled: boolean;
  viewersBase: number;
  viewersJitterPct: number;
  viewersLabel: string;
  followersBase: number;
  followersJitterPct: number;
}

export const DEFAULT_SOCIAL_PROOF: SocialProofSettings = {
  enabled: true,
  purchaseToastsEnabled: true,
  viewersBase: 204_807,
  viewersJitterPct: 4,
  viewersLabel: "World Cup events",
  followersBase: 88_600,
  followersJitterPct: 2,
};

function parseSocialProof(raw: unknown): SocialProofSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_SOCIAL_PROOF;
  const o = raw as Record<string, unknown>;
  return {
    enabled: o.enabled !== false,
    purchaseToastsEnabled: o.purchaseToastsEnabled !== false,
    viewersBase:
      typeof o.viewersBase === "number" ? o.viewersBase : DEFAULT_SOCIAL_PROOF.viewersBase,
    viewersJitterPct:
      typeof o.viewersJitterPct === "number"
        ? o.viewersJitterPct
        : DEFAULT_SOCIAL_PROOF.viewersJitterPct,
    viewersLabel:
      typeof o.viewersLabel === "string" ? o.viewersLabel : DEFAULT_SOCIAL_PROOF.viewersLabel,
    followersBase:
      typeof o.followersBase === "number"
        ? o.followersBase
        : DEFAULT_SOCIAL_PROOF.followersBase,
    followersJitterPct:
      typeof o.followersJitterPct === "number"
        ? o.followersJitterPct
        : DEFAULT_SOCIAL_PROOF.followersJitterPct,
  };
}

export async function getSocialProofSettings(): Promise<SocialProofSettings> {
  if (!hasSupabaseConfig()) return DEFAULT_SOCIAL_PROOF;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "social_proof")
      .maybeSingle();

    if (error || !data?.value) return DEFAULT_SOCIAL_PROOF;
    return parseSocialProof(data.value);
  } catch {
    return DEFAULT_SOCIAL_PROOF;
  }
}
