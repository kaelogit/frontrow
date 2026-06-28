import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/data/events";
import { getQueueToken, setQueueAdmission } from "@/lib/queue/cookies";
import { getQueueStatus } from "@/lib/queue/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim();
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.queue_enabled) {
      return NextResponse.json({ admitted: true, queueDisabled: true });
    }

    const token = await getQueueToken(event.id);
    if (!token) {
      return NextResponse.json({ error: "No queue session" }, { status: 401 });
    }

    const status = await getQueueStatus(event.id, token);

    if (status.admitted) {
      await setQueueAdmission(event.id, token);
    }

    return NextResponse.json({ ...status, eventSlug: slug });
  } catch (err) {
    console.error("[queue/status]", err);
    return NextResponse.json({ error: "Could not read queue status" }, { status: 500 });
  }
}
