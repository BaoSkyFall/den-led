import { env } from "@/env.mjs";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const BUCKET = "products";

export function getPublicUrl(path: string): string {
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function uploadImage(
  file: File,
  path: string,
): Promise<{ path: string; url: string }> {
  const supabase = createClient({ cookieStore: cookies() });
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return { path: data.path, url: getPublicUrl(data.path) };
}

export async function deleteImage(path: string): Promise<void> {
  const supabase = createClient({ cookieStore: cookies() });
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}
