import { getSocialProofSettings } from "@/lib/social-proof/settings";
import { SocialProofSettingsForm } from "./SocialProofSettingsForm";
import { getFxSettings } from "@/lib/fx/settings";
import { FxSettingsForm } from "./FxSettingsForm";

export default async function AdminSettingsPage() {
  const socialProof = await getSocialProofSettings();
  const fx = await getFxSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-zinc-500">Site configuration and environment</p>

      <SocialProofSettingsForm settings={socialProof} />
      <FxSettingsForm settings={fx} />

      <div className="mt-8 space-y-4 rounded-xl border border-card-border bg-card p-6 text-sm text-zinc-500">
        <h2 className="text-lg font-semibold text-white">Environment variables</h2>
        <p>
          Configure via environment variables in{" "}
          <code className="text-zinc-300">.env.local</code>. See README for details.
        </p>
        <ul className="list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <code>ADMIN_EMAILS</code> — your personal email(s) allowed to sign in at{" "}
            <code>/admin/login</code> only (e.g. <code>you@frontrowly.com</code>)
          </li>
          <li>
            <code>ADMIN_EMAIL</code> — operator inbox that receives new reservation /
            payment alerts (e.g. <code>support@frontrowly.com</code>). Reply on those
            emails goes to the customer.
          </li>
          <li>
            <code>FROM_EMAIL</code> — sender on outbound mail (e.g.{" "}
            <code>tickets@frontrowly.com</code>)
          </li>
          <li>
            <code>RESEND_API_KEY</code> — required for emails to send in production
          </li>
          <li>
            <code>NEXT_PUBLIC_SUPABASE_*</code> — database and admin auth
          </li>
        </ul>
      </div>
    </div>
  );
}
