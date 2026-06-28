"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hourglass, Loader2 } from "lucide-react";
import type { EventWithRelations } from "@/types/database";
import { TicketFlowHeader } from "@/components/tickets/TicketFlowHeader";
import { TicketFlowFooter } from "@/components/tickets/TicketFlowFooter";
import { getEventTicketHref } from "@/lib/events/event-scarcity";
import { formatEventDate } from "@/lib/utils";

interface QueueStatusResponse {
  position: number;
  totalWaiting: number;
  admitted: boolean;
  progressPercent: number;
  estimatedWaitSeconds: number;
  queueDisabled?: boolean;
  error?: string;
}

interface QueuePageClientProps {
  event: EventWithRelations;
}

export function QueuePageClient({ event }: QueuePageClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<QueueStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(true);

  const goToTickets = useCallback(() => {
    router.replace(getEventTicketHref(event));
  }, [router, event]);

  const pollStatus = useCallback(async () => {
    const res = await fetch(`/api/queue/status?slug=${encodeURIComponent(event.slug)}`);
    if (!res.ok) {
      if (res.status === 401) return false;
      throw new Error("Could not check queue status");
    }
    const data = (await res.json()) as QueueStatusResponse;
    setStatus(data);
    if (data.queueDisabled || data.admitted) {
      goToTickets();
      return true;
    }
    return false;
  }, [event.slug, goToTickets]);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    async function start() {
      try {
        const joinRes = await fetch("/api/queue/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: event.slug }),
        });
        if (!joinRes.ok) throw new Error("Could not join queue");
        const joined = (await joinRes.json()) as QueueStatusResponse;
        if (cancelled) return;
        setStatus(joined);
        setJoining(false);

        if (joined.queueDisabled || joined.admitted) {
          goToTickets();
          return;
        }

        interval = setInterval(async () => {
          try {
            const done = await pollStatus();
            if (done && interval) clearInterval(interval);
          } catch {
            /* keep polling */
          }
        }, 2500);
      } catch {
        if (!cancelled) {
          setError("Something went wrong joining the queue. Please refresh.");
          setJoining(false);
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [event.slug, goToTickets, pollStatus]);

  const progress = status?.progressPercent ?? 12;
  const position = status?.position;
  const waitMins =
    status?.estimatedWaitSeconds != null
      ? Math.max(1, Math.ceil(status.estimatedWaitSeconds / 60))
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TicketFlowHeader event={event} />

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex justify-center">
            {joining ? (
              <Loader2 className="h-12 w-12 animate-spin text-sky-600" />
            ) : (
              <Hourglass className="h-12 w-12 text-sky-600" />
            )}
          </div>

          <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
            Popular event!
          </h1>
          <p className="mt-2 text-center text-slate-600">
            Fans are rushing to get tickets for{" "}
            <span className="font-medium text-slate-900">{event.title}</span>
            {event.event_date && (
              <> · {formatEventDate(event.event_date, event.event_time)}</>
            )}
          </p>

          <div className="mt-8">
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-center text-sm font-medium text-slate-700">
              {joining
                ? "Joining the queue…"
                : status?.admitted
                  ? "You're in! Redirecting…"
                  : position != null
                    ? `You're #${position.toLocaleString()} in line`
                    : "Holding your place in line…"}
            </p>
            {!joining && !status?.admitted && waitMins != null && (
              <p className="mt-1 text-center text-xs text-slate-500">
                Estimated wait ~{waitMins} min · please keep this tab open
              </p>
            )}
          </div>

          <p className="mt-8 text-center text-sm leading-relaxed text-slate-500">
            We&apos;re letting fans in steadily so everyone gets a fair shot at
            seats. Your place is saved if you refresh this page.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>
      <TicketFlowFooter />
    </div>
  );
}
