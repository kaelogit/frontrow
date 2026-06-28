import { z } from "zod";
import type { AdminLookups } from "@/lib/events/admin-events";
import { eventFormSchema, type EventFormValues } from "@/lib/events/event-form";
import { slugify } from "@/lib/utils";

export const CSV_COLUMNS = [
  "title",
  "slug",
  "subtitle",
  "match_number",
  "description",
  "competition_slug",
  "venue_slug",
  "event_date",
  "event_time",
  "home_team_slug",
  "away_team_slug",
  "home_team_label",
  "away_team_label",
  "min_price",
  "currency",
  "status",
  "featured",
  "seat_map_enabled",
  "queue_enabled",
  "queue_admission_rate",
  "scarcity_override",
  "image_url",
] as const;

export const SAMPLE_CSV = `title,slug,subtitle,match_number,description,competition_slug,venue_slug,event_date,event_time,home_team_slug,away_team_slug,home_team_label,away_team_label,min_price,currency,status,featured,seat_map_enabled,queue_enabled,queue_admission_rate,scarcity_override,image_url
W89 vs W90,world-cup-match-97,Quarterfinal · Match 97 · World Cup 2026,97,FIFA World Cup 2026 Quarterfinal,world-cup-2026,gillette-stadium,2026-07-09,16:00,,,W89,W90,810,USD,scheduled,false,true,false,,4,/images/events/match-97.jpg
W93 vs W94,world-cup-qf-match-98,Quarterfinal · Match 98 · World Cup 2026,98,FIFA World Cup 2026 Quarterfinal,world-cup-2026,sofi-stadium,2026-07-10,12:00,,,W93,W94,810,USD,scheduled,false,true,false,,3,/images/events/match-98.jpg`;

const csvRowSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  subtitle: z.string().optional(),
  match_number: z.string().optional(),
  description: z.string().optional(),
  competition_slug: z.string().optional(),
  venue_slug: z.string().min(1, "venue_slug is required"),
  event_date: z.string().min(1),
  event_time: z.string().optional(),
  home_team_slug: z.string().optional(),
  away_team_slug: z.string().optional(),
  home_team_label: z.string().optional(),
  away_team_label: z.string().optional(),
  min_price: z.string().optional(),
  currency: z.string().optional(),
  status: z.string().optional(),
  featured: z.string().optional(),
  seat_map_enabled: z.string().optional(),
  queue_enabled: z.string().optional(),
  queue_admission_rate: z.string().optional(),
  scarcity_override: z.string().optional(),
  image_url: z.string().optional(),
});

export interface ParsedImportRow {
  line: number;
  values: EventFormValues | null;
  errors: string[];
  warnings: string[];
  slug: string | null;
}

export interface CsvParseResult {
  headers: string[];
  rows: ParsedImportRow[];
  validCount: number;
  errorCount: number;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseCsvText(text: string): { headers: string[]; records: Record<string, string>[] } {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], records: [] };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const records = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? "";
    });
    return record;
  });

  return { headers, records };
}

function parseBool(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  const v = value.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

function resolveIdBySlug<T extends { id: string; slug: string }>(
  items: T[],
  slug: string | undefined,
  label: string
): { id: string | null; error?: string } {
  if (!slug?.trim()) return { id: null };
  const match = items.find((item) => item.slug === slug.trim());
  if (!match) return { id: null, error: `Unknown ${label} slug: ${slug}` };
  return { id: match.id };
}

export function parseEventsCsv(csvText: string, lookups: AdminLookups): CsvParseResult {
  const { headers, records } = parseCsvText(csvText);
  const rows: ParsedImportRow[] = [];

  if (headers.length === 0) {
    return { headers: [], rows: [], validCount: 0, errorCount: 1 };
  }

  if (!headers.includes("title") || !headers.includes("venue_slug") || !headers.includes("event_date")) {
    return {
      headers,
      rows: [
        {
          line: 1,
          values: null,
          errors: ["CSV must include title, venue_slug, and event_date columns."],
          warnings: [],
          slug: null,
        },
      ],
      validCount: 0,
      errorCount: 1,
    };
  }

  records.forEach((record, index) => {
    const line = index + 2;
    const errors: string[] = [];
    const warnings: string[] = [];

    const parsedRow = csvRowSchema.safeParse(record);
    if (!parsedRow.success) {
      rows.push({
        line,
        values: null,
        errors: parsedRow.error.errors.map((e) => e.message),
        warnings,
        slug: record.slug ?? null,
      });
      return;
    }

    const row = parsedRow.data;
    const slug = row.slug?.trim() || slugify(row.title);
    if (!slug) errors.push("Could not derive slug from title.");

    const competitionSlug = row.competition_slug?.trim() || "world-cup-2026";
    const competition = resolveIdBySlug(lookups.competitions, competitionSlug, "competition");
    if (competition.error) errors.push(competition.error);

    const venue = resolveIdBySlug(lookups.venues, row.venue_slug, "venue");
    if (venue.error) errors.push(venue.error);

    const homeTeam = resolveIdBySlug(lookups.teams, row.home_team_slug, "home team");
    if (homeTeam.error) errors.push(homeTeam.error);

    const awayTeam = resolveIdBySlug(lookups.teams, row.away_team_slug, "away team");
    if (awayTeam.error) errors.push(awayTeam.error);

    if (!homeTeam.id && !row.home_team_label?.trim()) {
      warnings.push("No home team or home_team_label — TBD placeholder recommended.");
    }
    if (!awayTeam.id && !row.away_team_label?.trim()) {
      warnings.push("No away team or away_team_label — TBD placeholder recommended.");
    }

    const formValues = {
      title: row.title.trim(),
      slug,
      subtitle: row.subtitle?.trim() || undefined,
      match_number: row.match_number?.trim() || undefined,
      description: row.description?.trim() || undefined,
      competition_id: competition.id || "",
      home_team_id: homeTeam.id || "",
      away_team_id: awayTeam.id || "",
      home_team_label: homeTeam.id ? undefined : row.home_team_label?.trim() || undefined,
      away_team_label: awayTeam.id ? undefined : row.away_team_label?.trim() || undefined,
      venue_id: venue.id || "",
      event_date: row.event_date.trim(),
      event_time: row.event_time?.trim() || undefined,
      image_url: row.image_url?.trim() || "",
      min_price: row.min_price?.trim() || "",
      currency: row.currency?.trim() || "USD",
      status: (row.status?.trim() || "scheduled") as EventFormValues["status"],
      featured: parseBool(row.featured),
      seat_map_enabled: parseBool(row.seat_map_enabled),
      queue_enabled: parseBool(row.queue_enabled),
      queue_admission_rate: row.queue_admission_rate?.trim() || "",
      scarcity_override: row.scarcity_override?.trim() || "",
    };

    const validated = eventFormSchema.safeParse(formValues);
    if (!validated.success) {
      errors.push(...validated.error.errors.map((e) => e.message));
    }

    if (!venue.id) {
      errors.push("venue_id could not be resolved.");
    }

    rows.push({
      line,
      values: errors.length === 0 && validated.success ? validated.data : null,
      errors,
      warnings,
      slug,
    });
  });

  const validCount = rows.filter((r) => r.values).length;
  const errorCount = rows.filter((r) => r.errors.length > 0).length;

  return { headers, rows, validCount, errorCount };
}
