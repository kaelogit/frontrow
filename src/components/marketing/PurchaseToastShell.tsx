import { getSocialProofSettings } from "@/lib/social-proof/settings";
import { PurchaseToast } from "@/components/marketing/PurchaseToast";

/** Server wrapper — hides toasts when disabled in admin settings */
export async function PurchaseToastShell() {
  const settings = await getSocialProofSettings();
  if (!settings.enabled || !settings.purchaseToastsEnabled) {
    return null;
  }
  return <PurchaseToast />;
}
