"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import { inferSectionMeta } from "@/lib/stadium/infer-section-meta";
import {
  type RowPreset,
  rowLabelsForPreset,
} from "@/lib/stadium/row-labels";
import { getAdminVenueById } from "@/lib/venues/admin-venues";

async function guard(venueId: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" as const };

  if (!hasSupabaseConfig()) {
    return { error: "Connect Supabase to manage sections and rows." as const };
  }

  const venue = await getAdminVenueById(venueId);
  if (!venue) return { error: "Venue not found" as const };

  return { venue };
}

function revalidateVenueSectionPaths(venueId: string) {
  revalidatePath("/admin/venues");
  revalidatePath(`/admin/venues/${venueId}/sections`);
  revalidatePath(`/admin/venues/${venueId}/map`);
}

export async function addSectionAction(venueId: string, formData: FormData) {
  const result = await guard(venueId);
  if ("error" in result) return result;

  const sectionNumber = String(formData.get("section_number") ?? "").trim();
  if (!sectionNumber) return { error: "Section number is required." };

  const level =
    String(formData.get("level") ?? "").trim() ||
    inferSectionMeta(sectionNumber).level;
  const zone =
    String(formData.get("zone") ?? "").trim() || inferSectionMeta(sectionNumber).zone;

  const supabase = createAdminClient();
  const { error } = await supabase.from("stadium_sections").upsert(
    {
      venue_id: venueId,
      section_number: sectionNumber,
      level,
      zone,
    },
    { onConflict: "venue_id,section_number" }
  );

  if (error) {
    console.error(error);
    return { error: "Failed to add section." };
  }

  revalidateVenueSectionPaths(venueId);
  return { success: true };
}

export async function bulkUpdateSectionZoneAction(venueId: string, formData: FormData) {
  const result = await guard(venueId);
  if ("error" in result) return result;

  const zone = String(formData.get("zone") ?? "").trim();
  const levelPrefix = String(formData.get("level_prefix") ?? "").trim();

  if (!zone) return { error: "Zone is required." };

  const supabase = createAdminClient();
  let query = supabase.from("stadium_sections").update({ zone }).eq("venue_id", venueId);

  if (levelPrefix) {
    query = query.eq("level", levelPrefix);
  }

  const { data, error } = await query.select("id");

  if (error) {
    console.error(error);
    return { error: "Failed to update sections." };
  }

  revalidateVenueSectionPaths(venueId);
  return { success: true, updated: data?.length ?? 0 };
}

export async function bulkAddRowsAction(venueId: string, formData: FormData) {
  const result = await guard(venueId);
  if ("error" in result) return result;

  const sectionId = String(formData.get("section_id") ?? "").trim();
  const preset = String(formData.get("preset") ?? "A-T") as RowPreset;
  const customLabels = String(formData.get("custom_labels") ?? "");
  const applyAll = formData.get("apply_all") === "on";

  const labels = rowLabelsForPreset(preset, customLabels);
  if (labels.length === 0) {
    return { error: "No row labels to add. Check preset or custom list." };
  }

  const supabase = createAdminClient();

  let sectionIds: string[] = [];

  if (applyAll) {
    const { data: sections } = await supabase
      .from("stadium_sections")
      .select("id")
      .eq("venue_id", venueId);
    sectionIds = (sections ?? []).map((s) => s.id);
  } else {
    if (!sectionId) return { error: "Pick a section or enable apply to all sections." };
    const { data: section } = await supabase
      .from("stadium_sections")
      .select("id")
      .eq("id", sectionId)
      .eq("venue_id", venueId)
      .maybeSingle();
    if (!section) return { error: "Section not found." };
    sectionIds = [section.id];
  }

  if (sectionIds.length === 0) {
    return { error: "No sections found. Sync sections from the map page first." };
  }

  let totalInserted = 0;

  for (const sid of sectionIds) {
    const rows = labels.map((row_label, index) => ({
      section_id: sid,
      row_label,
      sort_order: index,
    }));

    const { error } = await supabase
      .from("stadium_rows")
      .upsert(rows, { onConflict: "section_id,row_label" });

    if (error) {
      console.error(error);
      return { error: `Failed to add rows for section ${sid}.` };
    }
    totalInserted += rows.length;
  }

  revalidateVenueSectionPaths(venueId);
  return { success: true, inserted: totalInserted, sections: sectionIds.length };
}

export async function deleteRowAction(venueId: string, rowId: string) {
  const result = await guard(venueId);
  if ("error" in result) return result;

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("stadium_rows")
    .select("section_id")
    .eq("id", rowId)
    .maybeSingle();

  if (!row) return { error: "Row not found." };

  const { data: section } = await supabase
    .from("stadium_sections")
    .select("id")
    .eq("id", row.section_id)
    .eq("venue_id", venueId)
    .maybeSingle();

  if (!section) return { error: "Row not found." };

  const { error } = await supabase.from("stadium_rows").delete().eq("id", rowId);

  if (error) {
    console.error(error);
    return { error: "Failed to delete row." };
  }

  revalidateVenueSectionPaths(venueId);
  return { success: true };
}

export async function clearSectionRowsAction(venueId: string, sectionId: string) {
  const result = await guard(venueId);
  if ("error" in result) return result;

  const supabase = createAdminClient();
  const { data: section } = await supabase
    .from("stadium_sections")
    .select("id")
    .eq("id", sectionId)
    .eq("venue_id", venueId)
    .maybeSingle();

  if (!section) return { error: "Section not found." };

  const { error } = await supabase.from("stadium_rows").delete().eq("section_id", sectionId);

  if (error) {
    console.error(error);
    return { error: "Failed to clear rows." };
  }

  revalidateVenueSectionPaths(venueId);
  return { success: true };
}
