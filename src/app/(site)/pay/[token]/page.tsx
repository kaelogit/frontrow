import { notFound } from "next/navigation";
import { PaymentOfferClient } from "@/components/payments/PaymentOfferClient";
import { buildPublicOfferView } from "@/lib/payments/store";

interface PayPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PayPageProps) {
  const { token } = await params;
  const view = await buildPublicOfferView(token);
  return {
    title: view ? `Pay ${view.orderReference}` : "Payment",
    robots: { index: false, follow: false },
  };
}

export default async function PayPage({ params }: PayPageProps) {
  const { token } = await params;
  const view = await buildPublicOfferView(token);

  if (!view) notFound();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <PaymentOfferClient initial={view} />
    </div>
  );
}
