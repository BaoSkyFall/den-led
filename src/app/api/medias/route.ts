export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import db from "@/lib/supabase/db";
import { medias } from "@/lib/supabase/schema";
import { createClient } from "@/lib/supabase/server";
import { mediaSchema } from "@/validations/medias";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BUCKET = "products";

export async function POST(request: NextRequest) {
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

  const formData = await request.formData();
  const data = Object.fromEntries(formData) as z.infer<typeof mediaSchema>;
  const validation = mediaSchema.safeParse(data);

  if (validation.success === false) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const supabase = createClient({ cookieStore, isAdmin: true });

  const uploaded: Array<{ id: string; key: string; alt: string }> = [];
  const errors: string[] = [];

  await Promise.all(
    Object.entries(data).map(async ([, file]) => {
      const ext = file.type.split("/")[1] ?? "jpg";
      const storagePath = `public/${nanoid()}.${ext}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, { contentType: file.type, upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const [row] = await db
          .insert(medias)
          .values({ alt: file.name, key: storagePath })
          .returning({
            id: medias.id,
            key: medias.key,
            alt: medias.alt,
          });

        uploaded.push(row);
      } catch (err) {
        errors.push((err as Error).message);
      }
    }),
  );

  if (uploaded.length === 0 && errors.length > 0) {
    return NextResponse.json({ message: errors.join("; ") }, { status: 400 });
  }

  return NextResponse.json(uploaded, { status: 201 });
}
