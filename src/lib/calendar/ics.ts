function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIcsUtc(date: string, time?: string | null): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hour = 12, minute = 0] = (time ?? "12:00").split(":").map(Number);
  return `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
}

function escapeIcs(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildCalendarIcs(params: {
  uid: string;
  title: string;
  startDate: string;
  startTime?: string | null;
  durationHours?: number;
  location: string;
  description: string;
}): string {
  const start = toIcsUtc(params.startDate, params.startTime);
  const duration = params.durationHours ?? 3;
  const [y, m, d] = params.startDate.split("-").map(Number);
  const [hour = 12, minute = 0] = (params.startTime ?? "12:00").split(":").map(Number);
  const endDate = new Date(y, m - 1, d, hour + duration, minute);
  const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Frontrowly//Order Confirmation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(params.uid)}@frontrowly.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(params.title)}`,
    `LOCATION:${escapeIcs(params.location)}`,
    `DESCRIPTION:${escapeIcs(params.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
