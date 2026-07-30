"use client";

import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, validateImageFile } from "@/lib/media-upload";

export type UploadStatus = "pending" | "uploading" | "done" | "error";

export type UploadedMedia = { id: string; key: string; alt: string };

type SignResult = {
  name: string;
  path?: string;
  token?: string;
  error?: string;
};

type Options = {
  // Called whenever a file's status changes so the UI can render progress.
  onFileStatus?: (index: number, status: UploadStatus, error?: string) => void;
  // Max simultaneous uploads.
  concurrency?: number;
};

/**
 * Validate → request signed URLs → upload each file DIRECTLY to Supabase
 * Storage (no serverless body cap) → confirm DB rows. Files are validated
 * client-side against the bucket limits first; invalid files are reported via
 * `onFileStatus` and skipped, they never block the valid ones.
 *
 * Returns the medias rows that were successfully inserted.
 */
export async function uploadImagesViaSignedUrl(
  files: File[],
  { onFileStatus, concurrency = 3 }: Options = {},
): Promise<UploadedMedia[]> {
  if (files.length === 0) return [];

  const supabase = createClient();

  // 1) Client-side validation — flag invalid files up front.
  const validIndexes: number[] = [];
  files.forEach((file, i) => {
    const invalid = validateImageFile(file);
    if (invalid) {
      onFileStatus?.(i, "error", invalid);
    } else {
      onFileStatus?.(i, "pending");
      validIndexes.push(i);
    }
  });
  if (validIndexes.length === 0) return [];

  // 2) One signed upload URL per valid file.
  const signRes = await fetch("/api/medias/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      files: validIndexes.map((i) => ({
        name: files[i].name,
        type: files[i].type,
        size: files[i].size,
      })),
    }),
  });

  if (!signRes.ok) {
    const msg = (await signRes.json().catch(() => ({})))?.message ?? "Lỗi ký URL";
    validIndexes.forEach((i) => onFileStatus?.(i, "error", msg));
    throw new Error(msg);
  }

  const { results } = (await signRes.json()) as { results: SignResult[] };

  // 3) Upload each file to its signed URL with limited concurrency.
  const confirmed: Array<{ key: string; alt: string; index: number }> = [];

  async function uploadOne(slot: number): Promise<void> {
    const fileIndex = validIndexes[slot];
    const file = files[fileIndex];
    const sign = results[slot];
    if (!sign || sign.error || !sign.path || !sign.token) {
      onFileStatus?.(fileIndex, "error", sign?.error ?? "Không có URL upload.");
      return;
    }
    onFileStatus?.(fileIndex, "uploading");
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .uploadToSignedUrl(sign.path, sign.token, file);
    if (error) {
      onFileStatus?.(fileIndex, "error", error.message);
      return;
    }
    confirmed.push({ key: sign.path, alt: file.name, index: fileIndex });
  }

  // Simple concurrency pool.
  let cursor = 0;
  async function worker() {
    while (cursor < validIndexes.length) {
      const slot = cursor++;
      await uploadOne(slot);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, validIndexes.length) }, worker),
  );

  if (confirmed.length === 0) return [];

  // 4) Persist medias rows (tiny JSON — no body-cap concern).
  const confirmRes = await fetch("/api/medias/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: confirmed.map((c) => ({ key: c.key, alt: c.alt })),
    }),
  });

  if (!confirmRes.ok) {
    confirmed.forEach((c) => onFileStatus?.(c.index, "error", "Lỗi lưu DB"));
    throw new Error("Không lưu được ảnh vào thư viện.");
  }

  const rows = (await confirmRes.json()) as UploadedMedia[];
  confirmed.forEach((c) => onFileStatus?.(c.index, "done"));
  return rows;
}
