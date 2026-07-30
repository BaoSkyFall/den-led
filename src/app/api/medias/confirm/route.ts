export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/lib/supabase/db";
import { medias } from "@/lib/supabase/schema";
import { createClient } from "@/lib/supabase/server";

type ConfirmItem = { key: string; alt: string };

// POST /api/medias/confirm — after a successful signed-URL upload, persist the
// medias row(s). Body is tiny JSON, so no serverless body-cap concern.
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

  let items: ConfirmItem[];
  try {
    const body = (await request.json()) as { items?: ConfirmItem[] };
    items = Array.isArray(body?.items) ? body.items : [];
  } catch {
    return NextResponse.json(
      { message: "Body không hợp lệ." },
      { status: 400 },
    );
  }

  // Only accept keys shaped like our signed uploads (public/<name>) and within
  // the medias.key varchar(255) limit, so a crafted request can't insert junk.
  const clean = items.filter(
    (i) =>
      typeof i?.key === "string" &&
      i.key.startsWith("public/") &&
      i.key.length <= 255,
  );
  if (clean.length === 0) {
    return NextResponse.json({ message: "Không có ảnh nào." }, { status: 400 });
  }

  try {
    const rows = await db
      .insert(medias)
      .values(
        clean.map((i) => ({ key: i.key, alt: (i.alt || i.key).slice(0, 255) })),
      )
      .returning({ id: medias.id, key: medias.key, alt: medias.alt });

    return NextResponse.json(rows, { status: 201 });
  } catch (err) {
    console.error("[medias/confirm] insert error:", err);
    return NextResponse.json(
      { message: "Không lưu được ảnh." },
      { status: 500 },
    );
  }
}
