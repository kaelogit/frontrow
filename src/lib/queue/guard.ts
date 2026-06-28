import { redirect } from "next/navigation";
import type { EventWithRelations } from "@/types/database";
import { getQueueAdmission } from "@/lib/queue/cookies";
import { hasValidAdmission } from "@/lib/queue/store";

export async function enforceQueueOrRedirect(event: EventWithRelations) {
  if (!event.queue_enabled) return;

  const admitToken = await getQueueAdmission(event.id);
  if (admitToken && (await hasValidAdmission(event.id, admitToken))) {
    return;
  }

  redirect(`/events/${event.slug}/queue`);
}
