export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { liveJson } from "@/lib/liveJson";

import db from "@/lib/supabase/db";
import { productSections, sectionBlocks } from "@/lib/supabase/schema";
import { asc, eq, inArray } from "drizzle-orm";
import type {
  ProductSection,
  SectionBlock,
} from "@/features/product-sections/types";

// GET /api/product-sections/[productId] — list sections + blocks in order (admin)
export async function GET(
  _req: Request,
  { params }: { params: { productId: string } },
) {
  const sections = await db
    .select()
    .from(productSections)
    .where(eq(productSections.productId, params.productId))
    .orderBy(asc(productSections.order));

  if (sections.length === 0) {
    return liveJson([]);
  }

  const sectionIds = sections.map((s) => s.id);
  const blocks = await db
    .select()
    .from(sectionBlocks)
    .where(inArray(sectionBlocks.sectionId, sectionIds))
    .orderBy(asc(sectionBlocks.order));

  const byId = new Map<string, SectionBlock[]>();
  for (const b of blocks) {
    const list = byId.get(b.sectionId) ?? [];
    list.push({
      id: b.id,
      order: b.order,
      type: b.type,
      data: b.data ?? {},
    } as unknown as SectionBlock);
    byId.set(b.sectionId, list);
  }

  const result: ProductSection[] = sections.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    order: s.order,
    blocks: byId.get(s.id) ?? [],
  }));

  return liveJson(result);
}

// PUT /api/product-sections/[productId] — replace-all sections tree
// Body: { sections: ProductSection[] } — priority = array index
export async function PUT(
  req: Request,
  { params }: { params: { productId: string } },
) {
  const body = (await req.json()) as { sections: ProductSection[] };
  const incoming = Array.isArray(body?.sections) ? body.sections : [];

  await db
    .delete(productSections)
    .where(eq(productSections.productId, params.productId));

  if (incoming.length === 0) {
    return liveJson({ ok: true, count: 0 });
  }

  const now = new Date().toISOString();
  const sectionRows = incoming.map((s, i) => ({
    id: s.id && !s.id.startsWith("tmp-") ? s.id : undefined,
    productId: params.productId,
    title: s.title ?? "",
    description: s.description ?? null,
    order: i,
    updatedAt: now,
  }));

  const inserted = await db
    .insert(productSections)
    .values(sectionRows)
    .returning({ id: productSections.id });

  const blockRows: Array<typeof sectionBlocks.$inferInsert> = [];
  incoming.forEach((s, i) => {
    const sectionId = inserted[i].id;
    (s.blocks ?? []).forEach((b, j) => {
      blockRows.push({
        sectionId,
        type: b.type,
        order: j,
        data: (b.data ??
          {}) as unknown as typeof sectionBlocks.$inferInsert.data,
      });
    });
  });

  if (blockRows.length > 0) {
    await db.insert(sectionBlocks).values(blockRows);
  }

  return liveJson({ ok: true, count: inserted.length });
}
