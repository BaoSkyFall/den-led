export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { env } from "@/env.mjs";
import db from "@/lib/supabase/db";
import { getPublicUrl } from "@/lib/storage";
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

  // Auth check: only admin users can upload
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

  // Use service role client to bypass RLS for storage upload
  const supabase = createClient({ cookieStore, isAdmin: true });

  let statusCode = 201;
  let errorMessage = "Unexpected Error";

  const uploadResponse = await Promise.all(
    Object.entries(data).map(async ([, file]) => {
      const ext = file.type.split("/")[1] ?? "jpg";
      const storagePath = `public/${nanoid()}.${ext}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, { contentType: file.type, upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const url = getPublicUrl(storagePath);

        await db.insert(medias).values({ alt: file.name, key: storagePath });

        return url;
      } catch (err) {
        statusCode = 400;
        errorMessage = (err as Error).message;
        return { message: (err as Error).message };
      }
    }),
  );

  return statusCode >= 300
    ? NextResponse.json({ message: errorMessage }, { status: statusCode })
    : NextResponse.json(uploadResponse, { status: statusCode });
}
