"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { uploadAdminImageAction } from "@/app/admin/(dashboard)/upload/actions";

interface ImageUploadFieldProps {
  name?: string;
  label?: string;
  folder?: string;
  initialUrl?: string | null;
  placeholder?: string;
}

export function ImageUploadField({
  name = "image_url",
  label = "Hero image",
  folder = "events",
  initialUrl = "",
  placeholder = "https://… or upload below",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const previewSrc = url.trim() || null;

  const handleUpload = (file: File | null) => {
    if (!file) return;
    setError(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", folder);

      const result = await uploadAdminImageAction(fd);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("url" in result && result.url) {
        setUrl(result.url);
        if (inputRef.current) inputRef.current.value = result.url;
      }
    });
  };

  return (
    <div className="sm:col-span-2">
      <label htmlFor={name} className="block text-sm text-zinc-400">
        {label}
      </label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="mt-1 w-full rounded-lg border border-card-border bg-background px-3 py-2 text-sm"
        placeholder={placeholder}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-card-border bg-background px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-slate-50">
          {pending ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={pending}
            onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
          />
        </label>
        {previewSrc && (
          <button
            type="button"
            onClick={() => {
              setUrl("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            Clear
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {previewSrc && (
        <div className="relative mt-4 aspect-[16/9] max-w-md overflow-hidden rounded-lg border border-card-border bg-slate-100">
          <Image
            src={previewSrc}
            alt="Preview"
            fill
            className="object-cover"
            sizes="400px"
            unoptimized={previewSrc.startsWith("http") && previewSrc.includes("supabase")}
          />
        </div>
      )}
    </div>
  );
}
