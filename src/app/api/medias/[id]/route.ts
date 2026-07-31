export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { liveJson } from "@/lib/liveJson";

import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/lib/supabase/db";
import { medias } from "@/lib/supabase/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const media = await db.query.medias.findFirst({
    where: eq(medias.id, params.id),
  });

  if (!media) return liveJson({ message: "Media not found." }, { status: 404 });

  return liveJson(media);
}
