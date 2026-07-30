// Mirror of the Supabase `products` storage bucket config so the client can
// reject invalid files BEFORE hitting the network. Keep in sync with:
//   select file_size_limit, allowed_mime_types from storage.buckets;
export const MEDIA_MAX_FILE_SIZE = 52_428_800; // 50 MB
export const MEDIA_MAX_FILE_SIZE_MB = MEDIA_MAX_FILE_SIZE / (1024 * 1024);

export const MEDIA_ALLOWED_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MEDIA_BUCKET = "products";

/**
 * Returns a human-readable Vietnamese error string when the file cannot be
 * uploaded, or `null` when it is acceptable.
 */
export function validateImageFile(file: {
  type: string;
  size: number;
  name?: string;
}): string | null {
  if (!MEDIA_ALLOWED_MIME.includes(file.type as (typeof MEDIA_ALLOWED_MIME)[number])) {
    return `Định dạng không hỗ trợ (chỉ JPG, PNG, WEBP, GIF).`;
  }
  if (file.size > MEDIA_MAX_FILE_SIZE) {
    return `Ảnh vượt quá ${MEDIA_MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
}
