"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";
import { inferSectionMeta } from "@/lib/stadium/infer-section-meta";
import { parseSectionNumbersFromSvg } from "@/lib/stadium/parse-svg-sections";
import { getAdminVenueById } from "@/lib/venues/admin-venues";

async function guard(venueId: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" as const };

  if (!hasSupabaseConfig()) {
    return { error: "Connect Supabase to manage venue maps." as const };
  }

  const venue = await getAdminVenueById(venueId);
  if (!venue) return { error: "Venue not found" as const };

  return { venue };
}

function revalidateVenuePaths(venueId: string) {
  revalidatePath("/admin/venues");
  revalidatePath(`/admin/venues/${venueId}/map`);
}

export async function saveStadiumMapAction(venueId: string, formData: FormData) {
  const result = await guard(venueId);
  if ("error" in result) return result;

  const mapSlug = String(formData.get("map_slug") ?? "").trim();
  const mapName = String(formData.get("map_name") ?? "").trim();
  const svgContent = String(formData.get("svg_content") ?? "").trim();
  const venueMapSlug = String(formData.get("stadium_map_slug") ?? "").trim();

  if (!mapSlug || !mapName) {
    return { error: "Map slug and name are required." };
  }

  if (!/^[a-z0-9-]+$/.test(mapSlug)) {
    return { error: "Map slug must be lowercase letters, numbers, and hyphens only." };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("stadium_maps")
    .select("id")
    .eq("venue_id", venueId)
    .eq("slug", mapSlug)
    .maybeSingle();

  const mapRecord = {
    venue_id: venueId,
    slug: mapSlug,
    name: mapName,
    svg_content: svgContent || null,
    svg_path: svgContent ? `/stadiums/${mapSlug}.svg` : null,
    updated_at: new Date().toISOString(),
  };

  const { error: mapError } = existing
    ? await supabase.from("stadium_maps").update(mapRecord).eq("id", existing.id)
    : await supabase.from("stadium_maps").insert(mapRecord);

  if (mapError) {
    console.error(mapError);
    return { error: "Failed to save stadium map." };
  }

  if (venueMapSlug) {
    const { error: venueError } = await supabase
      .from("venues")
      .update({ stadium_map_slug: venueMapSlug })
      .eq("id", venueId);

    if (venueError) {
      console.error(venueError);
      return { error: "Map saved but venue slug update failed." };
    }
  }

  revalidateVenuePaths(venueId);
  return { success: true };
}

export async function syncSectionsFromSvgAction(venueId: string) {
  const result = await guard(venueId);
  if ("error" in result) return result;

  const supabase = createAdminClient();
  const { data: map, error: mapError } = await supabase
    .from("stadium_maps")
    .select("svg_content")
    .eq("venue_id", venueId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (mapError || !map?.svg_content) {
    return { error: "Save an SVG map first before syncing sections." };
  }

  const sectionNumbers = parseSectionNumbersFromSvg(map.svg_content);
  if (sectionNumbers.length === 0) {
    return {
      error:
        'No section ids found. Use ids like id="section-227" or id="227" on path/g elements.',
    };
  }

  const rows = sectionNumbers.map((section_number) => {
    const meta = inferSectionMeta(section_number);
    return {
      venue_id: venueId,
      section_number,
      level: meta.level,
      zone: meta.zone,
    };
  });

  const { error } = await supabase
    .from("stadium_sections")
    .upsert(rows, { onConflict: "venue_id,section_number" });

  if (error) {
    console.error(error);
    return { error: "Failed to sync sections." };
  }

  revalidateVenuePaths(venueId);
  return { success: true, synced: sectionNumbers.length };
}

export async function updateSectionAction(
  venueId: string,
  sectionId: string,
  formData: FormData
) {
  const result = await guard(venueId);
  if ("error" in result) return result;

  const level = String(formData.get("level") ?? "").trim();
  const zone = String(formData.get("zone") ?? "").trim();

  if (!level) return { error: "Level is required." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("stadium_sections")
    .update({ level, zone: zone || null })
    .eq("id", sectionId)
    .eq("venue_id", venueId);

  if (error) {
    console.error(error);
    return { error: "Failed to update section." };
  }

  revalidateVenuePaths(venueId);
  return { success: true };
}

export async function deleteSectionAction(venueId: string, sectionId: string) {
  const result = await guard(venueId);
  if ("error" in result) return result;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("stadium_sections")
    .delete()
    .eq("id", sectionId)
    .eq("venue_id", venueId);

  if (error) {
    console.error(error);
    return { error: "Failed to delete section." };
  }

  revalidateVenuePaths(venueId);
  return { success: true };
}

export async function deleteOrphanSectionsAction(venueId: string) {
  const result = await guard(venueId);
  if ("error" in result) return result;

  const supabase = createAdminClient();
  const { data: map } = await supabase
    .from("stadium_maps")
    .select("svg_content")
    .eq("venue_id", venueId)
    .limit(1)
    .maybeSingle();

  if (!map?.svg_content) {
    return { error: "No SVG map saved for this venue." };
  }

  const parsed = new Set(parseSectionNumbersFromSvg(map.svg_content));
  const { data: sections } = await supabase
    .from("stadium_sections")
    .select("id, section_number")
    .eq("venue_id", venueId);

  const orphans = (sections ?? []).filter((s) => !parsed.has(s.section_number));
  if (orphans.length === 0) {
    return { success: true, removed: 0 };
  }

  const { error } = await supabase
    .from("stadium_sections")
    .delete()
    .in(
      "id",
      orphans.map((s) => s.id)
    );

  if (error) {
    console.error(error);
    return { error: "Failed to remove orphan sections." };
  }

  revalidateVenuePaths(venueId);
  return { success: true, removed: orphans.length };
}
