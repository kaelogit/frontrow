import { Footer } from "@/components/layout/Footer";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { PurchaseToastShell } from "@/components/marketing/PurchaseToastShell";
import { SiteOrganizationJsonLd } from "@/components/seo/SiteOrganizationJsonLd";
import { SiteSettingsProvider } from "@/components/site-settings/SiteSettingsProvider";
import { getFxSettings } from "@/lib/fx/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fx = await getFxSettings();

  return (
    <SiteSettingsProvider fx={fx}>
      <SiteOrganizationJsonLd />
      <div className="flex min-h-screen flex-col">
        <SiteChrome />
        <main className="flex-1 pt-[var(--site-chrome-height)]">{children}</main>
        <Footer />
        <PurchaseToastShell />
      </div>
    </SiteSettingsProvider>
  );
}
