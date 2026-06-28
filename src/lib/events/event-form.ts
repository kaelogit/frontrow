import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  subtitle: z.string().optional(),
  match_number: z.string().optional(),
  description: z.string().optional(),
  competition_id: z.string().optional(),
  home_team_id: z.string().optional(),
  away_team_id: z.string().optional(),
  home_team_label: z.string().optional(),
  away_team_label: z.string().optional(),
  venue_id: z.string().optional(),
  event_date: z.string().min(1, "Date is required"),
  event_time: z.string().optional(),
  image_url: z.string().optional(),
  min_price: z.string().optional(),
  currency: z.string().default("USD"),
  status: z.enum(["scheduled", "sold_out", "cancelled", "completed"]),
  featured: z.boolean().optional(),
  seat_map_enabled: z.boolean().optional(),
  queue_enabled: z.boolean().optional(),
  queue_admission_rate: z.string().optional(),
  scarcity_override: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export function parseEventForm(formData: FormData) {
  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    subtitle: formData.get("subtitle") || undefined,
    match_number: formData.get("match_number") || undefined,
    description: formData.get("description") || undefined,
    competition_id: formData.get("competition_id") || "",
    home_team_id: formData.get("home_team_id") || "",
    away_team_id: formData.get("away_team_id") || "",
    home_team_label: formData.get("home_team_label") || undefined,
    away_team_label: formData.get("away_team_label") || undefined,
    venue_id: formData.get("venue_id") || "",
    event_date: formData.get("event_date"),
    event_time: formData.get("event_time") || undefined,
    image_url: formData.get("image_url") || "",
    min_price: formData.get("min_price") || "",
    currency: formData.get("currency") || "USD",
    status: formData.get("status") || "scheduled",
    featured: formData.get("featured") === "on",
    seat_map_enabled: formData.get("seat_map_enabled") === "on",
    queue_enabled: formData.get("queue_enabled") === "on",
    queue_admission_rate: formData.get("queue_admission_rate") || "",
    scarcity_override: formData.get("scarcity_override") || "",
  };

  return eventFormSchema.safeParse(raw);
}

export function eventFormToRecord(values: EventFormValues) {
  const minPrice =
    values.min_price && values.min_price.trim() !== ""
      ? Number(values.min_price)
      : null;
  const scarcityOverride =
    values.scarcity_override && values.scarcity_override.trim() !== ""
      ? Number(values.scarcity_override)
      : null;
  const queueAdmissionRate =
    values.queue_admission_rate && values.queue_admission_rate.trim() !== ""
      ? Number(values.queue_admission_rate)
      : null;

  const uuidOrNull = (v?: string) => (v && v.length > 0 ? v : null);
  const homeTeamId = uuidOrNull(values.home_team_id);
  const awayTeamId = uuidOrNull(values.away_team_id);

  const urlOrNull = (v?: string) => {
    if (!v?.trim()) return null;
    try {
      new URL(v);
      return v;
    } catch {
      return null;
    }
  };

  const imageOrNull = (v?: string) => {
    if (!v?.trim()) return null;
    if (v.startsWith("/")) return v;
    return urlOrNull(v);
  };

  return {
    title: values.title,
    slug: values.slug,
    subtitle: values.subtitle || null,
    match_number: values.match_number || null,
    description: values.description || null,
    competition_id: uuidOrNull(values.competition_id),
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    home_team_label: homeTeamId ? null : values.home_team_label?.trim() || null,
    away_team_label: awayTeamId ? null : values.away_team_label?.trim() || null,
    venue_id: uuidOrNull(values.venue_id),
    event_date: values.event_date,
    event_time: values.event_time || null,
    image_url: imageOrNull(values.image_url),
    min_price: minPrice,
    currency: values.currency,
    status: values.status,
    featured: Boolean(values.featured),
    seat_map_enabled: Boolean(values.seat_map_enabled),
    queue_enabled: Boolean(values.queue_enabled),
    queue_admission_rate: queueAdmissionRate,
    scarcity_override: scarcityOverride,
  };
}
