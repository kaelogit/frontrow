import { createAdminClient } from "@/lib/supabase/admin";

export const MEDIA_BUCKET = "media";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 5 * 1024 * 1024;

export function sanitizeStorageFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function buildStoragePath(folder: string, fileName: string): string {
  const safeFolder = folder.replace(/[^a-z0-9/-]+/gi, "").replace(/^\/+|\/+$/g, "");
  const safeName = sanitizeStorageFileName(fileName) || "upload";
  return `${safeFolder}/${Date.now()}-${safeName}`;
}

export function getPublicMediaUrl(path: string): string {
  const supabase = createAdminClient();
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMediaFile(options: {
  folder: string;
  fileName: string;
  contentType: string;
  bytes: Buffer;
}): Promise<{ path: string; publicUrl: string }> {
  if (!ALLOWED_TYPES.has(options.contentType)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed.");
  }

  if (options.bytes.byteLength > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const path = buildStoragePath(options.folder, options.fileName);
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, options.bytes, {
    contentType: options.contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { path, publicUrl: getPublicMediaUrl(path) };
}
