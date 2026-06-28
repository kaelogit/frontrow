import { Footer } from "@/components/layout/Footer";
import { SiteChrome } from "@/components/layout/SiteChrome";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteChrome />
      <main className="flex-1 pt-[var(--site-chrome-height)]">{children}</main>
      <Footer />
    </div>
  );
}
