import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/data/events";
import { enforceQueueOrRedirect } from "@/lib/queue/guard";
import { CheckoutFlowClient } from "./CheckoutFlowClient";

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Checkout" };
  return { title: `Checkout — ${event.title}` };
}

export default async function EventCheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  await enforceQueueOrRedirect(event);

  return <CheckoutFlowClient event={event} />;
}
