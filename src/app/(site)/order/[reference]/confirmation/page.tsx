import { notFound } from "next/navigation";
import { TrackOrderConfirmation } from "@/components/analytics/TrackOrderConfirmation";
import { OrderConfirmationView } from "@/components/order/OrderConfirmationView";
import { getConfirmationOrder } from "@/lib/orders/confirmation-order";

interface ConfirmationPageProps {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ demo_payment?: string; crypto_pending?: string }>;
}

export async function generateMetadata({ params }: ConfirmationPageProps) {
  const { reference } = await params;
  return {
    title: `Order ${reference}`,
    description: "Your Frontrowly order confirmation",
  };
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const { reference } = await params;
  const { demo_payment, crypto_pending } = await searchParams;

  const order = await getConfirmationOrder(reference);

  if (!order) {
    notFound();
  }

  return (
    <>
      <TrackOrderConfirmation order={order} />
      <OrderConfirmationView
        order={order}
        demoPayment={demo_payment === "1"}
        cryptoPending={crypto_pending === "1"}
      />
    </>
  );
}
