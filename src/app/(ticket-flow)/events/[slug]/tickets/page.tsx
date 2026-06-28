import { notFound, redirect } from "next/navigation";
import { getEventBySlug } from "@/lib/data/events";
import { getEventTicketHref } from "@/lib/events/event-scarcity";
import { enforceQueueOrRedirect } from "@/lib/queue/guard";

interface TicketsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TicketsPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Tickets" };
  return {
    title: `Tickets — ${event.title}`,
    description: `Select seats for ${event.title}`,
  };
}

/** Legacy route — ticket browser lives on the event page as a modal overlay. */
export default async function TicketsPage({ params }: TicketsPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  await enforceQueueOrRedirect(event);
  redirect(getEventTicketHref(event));
}
