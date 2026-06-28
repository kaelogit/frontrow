import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import { shouldUseMockData } from "@/lib/data/mock-mode";
import { computeAdmission } from "@/lib/queue/admission";
import { DEFAULT_QUEUE_ADMISSION_RATE } from "@/lib/queue/constants";
import { randomUUID } from "crypto";

export interface QueueSessionRow {
  token: string;
  event_id: string;
  position: number;
  created_at: string;
  admitted_at: string | null;
}

export interface QueueStatus {
  token: string;
  position: number;
  totalWaiting: number;
  admitted: boolean;
  progressPercent: number;
  estimatedWaitSeconds: number;
  admissionsPerMinute: number;
}

interface MockSession {
  token: string;
  eventId: string;
  position: number;
  createdAt: number;
  admittedAt: number | null;
}

function mockStore(): Map<string, MockSession[]> {
  const g = globalThis as typeof globalThis & { __frontrowlyQueue?: Map<string, MockSession[]> };
  if (!g.__frontrowlyQueue) g.__frontrowlyQueue = new Map();
  return g.__frontrowlyQueue;
}

function useMockQueue() {
  return shouldUseMockData() || !hasSupabaseConfig();
}

async function getEventQueueRate(eventId: string): Promise<number> {
  if (!hasSupabaseConfig()) return DEFAULT_QUEUE_ADMISSION_RATE;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("events")
    .select("queue_admission_rate")
    .eq("id", eventId)
    .maybeSingle();
  return data?.queue_admission_rate ?? DEFAULT_QUEUE_ADMISSION_RATE;
}

function statusFromSessions(
  session: { token: string; position: number; createdAt: number },
  all: { position: number; createdAt: number }[],
  rate: number,
  admittedAt: number | null
): QueueStatus {
  const queueStartMs = Math.min(...all.map((s) => s.createdAt));
  const result = computeAdmission({
    position: session.position,
    joinedAtMs: session.createdAt,
    queueStartMs,
    admissionsPerMinute: rate,
    totalWaiting: all.length,
  });

  const admitted = admittedAt != null || result.admitted;

  return {
    token: session.token,
    position: session.position,
    totalWaiting: all.length,
    admitted,
    progressPercent: admitted ? 100 : result.progressPercent,
    estimatedWaitSeconds: admitted ? 0 : result.estimatedWaitSeconds,
    admissionsPerMinute: rate,
  };
}

export async function joinQueue(eventId: string, existingToken?: string | null): Promise<QueueStatus> {
  const rate = await getEventQueueRate(eventId);

  if (useMockQueue()) {
    const store = mockStore();
    const list = store.get(eventId) ?? [];

    if (existingToken) {
      const found = list.find((s) => s.token === existingToken);
      if (found) {
        return statusFromSessions(found, list, rate, found.admittedAt);
      }
    }

    const token = randomUUID();
    const session: MockSession = {
      token,
      eventId,
      position: list.length + 1,
      createdAt: Date.now(),
      admittedAt: null,
    };
    list.push(session);
    store.set(eventId, list);

    const status = statusFromSessions(session, list, rate, null);
    if (status.admitted) session.admittedAt = Date.now();
    return status;
  }

  const supabase = createAdminClient();

  if (existingToken) {
    const { data: existing } = await supabase
      .from("queue_sessions")
      .select("token, event_id, position, created_at, admitted_at")
      .eq("event_id", eventId)
      .eq("token", existingToken)
      .maybeSingle();

    if (existing) {
      return getQueueStatus(eventId, existingToken);
    }
  }

  const { data: maxRow } = await supabase
    .from("queue_sessions")
    .select("position")
    .eq("event_id", eventId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (maxRow?.position ?? 0) + 1;
  const token = randomUUID();

  const { error } = await supabase.from("queue_sessions").insert({
    event_id: eventId,
    token,
    position: nextPosition,
  });

  if (error) throw new Error(error.message);

  return getQueueStatus(eventId, token);
}

export async function getQueueStatus(eventId: string, token: string): Promise<QueueStatus> {
  const rate = await getEventQueueRate(eventId);

  if (useMockQueue()) {
    const list = mockStore().get(eventId) ?? [];
    const session = list.find((s) => s.token === token);
    if (!session) throw new Error("Queue session not found");

    const status = statusFromSessions(session, list, rate, session.admittedAt);
    if (status.admitted && !session.admittedAt) {
      session.admittedAt = Date.now();
    }
    return status;
  }

  const supabase = createAdminClient();

  const { data: session, error } = await supabase
    .from("queue_sessions")
    .select("token, event_id, position, created_at, admitted_at")
    .eq("event_id", eventId)
    .eq("token", token)
    .maybeSingle();

  if (error || !session) throw new Error("Queue session not found");

  const { data: allRows } = await supabase
    .from("queue_sessions")
    .select("position, created_at, admitted_at")
    .eq("event_id", eventId)
    .order("position", { ascending: true });

  const all = (allRows ?? []).map((r) => ({
    position: r.position,
    createdAt: new Date(r.created_at).getTime(),
  }));

  const createdAt = new Date(session.created_at).getTime();
  const admittedAt = session.admitted_at ? new Date(session.admitted_at).getTime() : null;

  let status = statusFromSessions(
    { token: session.token, position: session.position, createdAt },
    all,
    rate,
    admittedAt
  );

  if (status.admitted && !session.admitted_at) {
    await supabase
      .from("queue_sessions")
      .update({ admitted_at: new Date().toISOString() })
      .eq("event_id", eventId)
      .eq("token", token);
    status = { ...status, admitted: true, progressPercent: 100, estimatedWaitSeconds: 0 };
  }

  return status;
}

export async function hasValidAdmission(eventId: string, token: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const status = await getQueueStatus(eventId, token);
    return status.admitted;
  } catch {
    return false;
  }
}
