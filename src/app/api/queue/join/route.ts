import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/data/events";
import { setQueueToken, getQueueToken, setQueueAdmission } from "@/lib/queue/cookies";
import { joinQueue } from "@/lib/queue/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { slug?: string };
    const slug = body.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.queue_enabled) {
      return NextResponse.json({ error: "Queue not enabled" }, { status: 400 });
    }

    const existing = await getQueueToken(event.id);
    const status = await joinQueue(event.id, existing);

    await setQueueToken(event.id, status.token);
    if (status.admitted) {
      await setQueueAdmission(event.id, status.token);
    }

    return NextResponse.json({ ...status, eventSlug: slug });
  } catch (err) {
    console.error("[queue/join]", err);
    return NextResponse.json({ error: "Could not join queue" }, { status: 500 });
  }
}
