import { cookies } from "next/headers";
import {
  QUEUE_ADMIT_COOKIE,
  QUEUE_ADMIT_TTL_SECONDS,
  QUEUE_TOKEN_COOKIE,
} from "@/lib/queue/constants";

function encode(eventId: string, token: string) {
  return `${eventId}:${token}`;
}

function decode(value: string | undefined): { eventId: string; token: string } | null {
  if (!value) return null;
  const idx = value.indexOf(":");
  if (idx <= 0) return null;
  return { eventId: value.slice(0, idx), token: value.slice(idx + 1) };
}

export async function getQueueToken(eventId: string): Promise<string | null> {
  const jar = await cookies();
  const parsed = decode(jar.get(QUEUE_TOKEN_COOKIE)?.value);
  if (!parsed || parsed.eventId !== eventId) return null;
  return parsed.token;
}

export async function getQueueAdmission(eventId: string): Promise<string | null> {
  const jar = await cookies();
  const parsed = decode(jar.get(QUEUE_ADMIT_COOKIE)?.value);
  if (!parsed || parsed.eventId !== eventId) return null;
  return parsed.token;
}

export async function setQueueToken(eventId: string, token: string) {
  const jar = await cookies();
  jar.set(QUEUE_TOKEN_COOKIE, encode(eventId, token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: QUEUE_ADMIT_TTL_SECONDS,
  });
}

export async function setQueueAdmission(eventId: string, token: string) {
  const jar = await cookies();
  jar.set(QUEUE_ADMIT_COOKIE, encode(eventId, token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: QUEUE_ADMIT_TTL_SECONDS,
  });
}
