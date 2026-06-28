import { notFound, redirect } from "next/navigation";
import { getEventBySlug } from "@/lib/data/events";
import { getEventTicketHref } from "@/lib/events/event-scarcity";
import { getQueueAdmission } from "@/lib/queue/cookies";
import { hasValidAdmission } from "@/lib/queue/store";
import { QueuePageClient } from "./QueuePageClient";

interface QueuePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: QueuePageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Waiting room" };
  return {
    title: `Waiting room — ${event.title}`,
    description: `Queue for tickets to ${event.title}`,
  };
}

export default async function QueuePage({ params }: QueuePageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  if (!event.queue_enabled) {
    redirect(getEventTicketHref(event));
  }

  const admitToken = await getQueueAdmission(event.id);
  if (admitToken && (await hasValidAdmission(event.id, admitToken))) {
    redirect(getEventTicketHref(event));
  }

  return <QueuePageClient event={event} />;
}
