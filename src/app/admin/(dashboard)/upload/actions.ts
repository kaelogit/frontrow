"use server";

import { getAdminSession } from "@/lib/auth/session";
import { hasSupabaseConfig } from "@/lib/supabase/admin";
import { uploadMediaFile } from "@/lib/storage";

export async function uploadAdminImageAction(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  if (!hasSupabaseConfig()) {
    return { error: "Connect Supabase to upload images." };
  }

  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "events").trim() || "events";

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file to upload." };
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await uploadMediaFile({
      folder,
      fileName: file.name,
      contentType: file.type,
      bytes,
    });

    return { success: true as const, url: result.publicUrl, path: result.path };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }
}
