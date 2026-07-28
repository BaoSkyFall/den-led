export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import db from "@/lib/supabase/db";
import { medias, productMedias } from "@/lib/supabase/schema";
import { and, asc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/products/[productId]/gallery — list gallery images sorted by priority
export async function GET(
  _req: Request,
  { params }: { params: { productId: string } },
) {
  const rows = await db
    .select({
      id: productMedias.id,
      mediaId: medias.id,
      key: medias.key,
      alt: medias.alt,
      priority: productMedias.priority,
    })
    .from(productMedias)
    .innerJoin(medias, eq(productMedias.mediaId, medias.id))
    .where(eq(productMedias.productId, params.productId))
    .orderBy(asc(productMedias.priority));

  return NextResponse.json(rows);
}

// PUT /api/products/[productId]/gallery — replace entire gallery with new order
// Body: { mediaIds: string[] } — priority = array index
export async function PUT(
  req: Request,
  { params }: { params: { productId: string } },
) {
  const { mediaIds } = (await req.json()) as { mediaIds: string[] };

  if (!Array.isArray(mediaIds)) {
    return NextResponse.json(
      { message: "mediaIds must be an array" },
      { status: 400 },
    );
  }

  // Delete existing entries, then insert new ones in given order
  await db
    .delete(productMedias)
    .where(eq(productMedias.productId, params.productId));

  if (mediaIds.length > 0) {
    await db.insert(productMedias).values(
      mediaIds.map((mediaId, i) => ({
        productId: params.productId,
        mediaId,
        priority: i,
      })),
    );
  }

  return NextResponse.json({ ok: true, count: mediaIds.length });
}
