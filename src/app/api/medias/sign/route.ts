export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_BUCKET, validateImageFile } from "@/lib/media-upload";

type SignFileInput = { name: string; type: string; size: number };

// POST /api/medias/sign — returns one signed upload URL per file so the browser
// can upload directly to Supabase Storage, bypassing the serverless body cap.
export async function POST(request: Request) {
  const cookieStore = cookies();

  const authClient = createClient({ cookieStore });
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user?.app_metadata?.isAdmin) {
    return NextResponse.json(
      { message: "Chỉ admin mới được upload ảnh." },
      { status: 403 },
    );
  }

  let files: SignFileInput[];
  try {
    const body = (await request.json()) as { files?: SignFileInput[] };
    files = Array.isArray(body?.files) ? body.files : [];
  } catch {
    return NextResponse.json({ message: "Body không hợp lệ." }, { status: 400 });
  }

  if (files.length === 0) {
    return NextResponse.json({ message: "Không có file nào." }, { status: 400 });
  }

  const supabase = createClient({ cookieStore, isAdmin: true });

  const results = await Promise.all(
    files.map(async (f) => {
      const invalid = validateImageFile(f);
      if (invalid) return { name: f.name, error: invalid };

      const ext = (f.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
      const path = `public/${nanoid()}.${ext}`;

      const { data, error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .createSignedUploadUrl(path);

      if (error || !data) {
        return { name: f.name, error: error?.message ?? "Không tạo được URL." };
      }
      return { name: f.name, path: data.path, token: data.token };
    }),
  );

  return NextResponse.json({ results });
}
