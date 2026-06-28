"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import { getAdminLookups } from "@/lib/events/admin-events";
import { eventFormToRecord } from "@/lib/events/event-form";
import { parseEventsCsv } from "@/lib/events/import-csv";

async function guard() {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" as const };
  if (!hasSupabaseConfig()) {
    return { error: "Connect Supabase to import events." as const };
  }
  return { session };
}

export async function previewEventsCsvAction(formData: FormData) {
  const result = await guard();
  if ("error" in result) return result;

  const csv = String(formData.get("csv") ?? "").trim();
  if (!csv) return { error: "Paste or upload CSV content first." };

  const lookups = await getAdminLookups();
  const parsed = parseEventsCsv(csv, lookups);

  return {
    success: true as const,
    preview: parsed,
  };
}

export async function importEventsCsvAction(formData: FormData) {
  const result = await guard();
  if ("error" in result) return result;

  const csv = String(formData.get("csv") ?? "").trim();
  const upsert = formData.get("upsert") === "on";

  if (!csv) return { error: "Paste or upload CSV content first." };

  const lookups = await getAdminLookups();
  const parsed = parseEventsCsv(csv, lookups);

  if (parsed.validCount === 0) {
    return { error: "No valid rows to import. Fix errors and try again." };
  }

  const supabase = createAdminClient();
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const failures: { line: number; message: string }[] = [];

  for (const row of parsed.rows) {
    if (!row.values) {
      skipped++;
      continue;
    }

    const record = eventFormToRecord(row.values);

    if (upsert) {
      const { error } = await supabase.from("events").upsert(record, { onConflict: "slug" });
      if (error) {
        failures.push({ line: row.line, message: error.message });
        continue;
      }
      imported++;
      updated++;
    } else {
      const { data: existing } = await supabase
        .from("events")
        .select("id")
        .eq("slug", row.values.slug)
        .maybeSingle();

      if (existing) {
        failures.push({ line: row.line, message: `Slug already exists: ${row.values.slug}` });
        skipped++;
        continue;
      }

      const { error } = await supabase.from("events").insert(record);
      if (error) {
        failures.push({ line: row.line, message: error.message });
        continue;
      }
      imported++;
    }
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/world-cup-2026");

  return {
    success: true as const,
    imported,
    updated: upsert ? updated : 0,
    skipped,
    failures,
    preview: parsed,
  };
}
