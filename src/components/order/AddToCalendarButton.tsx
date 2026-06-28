"use client";

import { CalendarPlus } from "lucide-react";
import { buildCalendarIcs } from "@/lib/calendar/ics";

interface AddToCalendarButtonProps {
  uid: string;
  title: string;
  startDate: string;
  startTime?: string | null;
  location: string;
  description: string;
}

export function AddToCalendarButton({
  uid,
  title,
  startDate,
  startTime,
  location,
  description,
}: AddToCalendarButtonProps) {
  function handleClick() {
    const ics = buildCalendarIcs({
      uid,
      title,
      startDate,
      startTime,
      location,
      description,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${uid.replace(/[^a-z0-9-]/gi, "-")}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary/40 hover:bg-surface"
    >
      <CalendarPlus className="h-4 w-4 text-primary" />
      Add to calendar
    </button>
  );
}
