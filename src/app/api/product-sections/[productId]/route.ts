export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { liveJson } from "@/lib/liveJson";

import { createId } from "@paralleldrive/cuid2";
import db, { sqlClient } from "@/lib/supabase/db";
import { productSections, sectionBlocks } from "@/lib/supabase/schema";
import { asc, eq, inArray } from "drizzle-orm";
import { parseBlockData } from "@/features/product-sections/blockData";
import type {
  ProductSection,
  SectionBlock,
} from "@/features/product-sections/types";

// Shared by GET and by the PUT response, so a save returns exactly what a
// reload would — the editor never has to re-read what it just wrote.
async function readSections(productId: string): Promise<ProductSection[]> {
  const sections = await db
    .select()
    .from(productSections)
    .where(eq(productSections.productId, productId))
    .orderBy(asc(productSections.order));

  if (sections.length === 0) return [];

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
      data: parseBlockData(b.data),
    } as unknown as SectionBlock);
    byId.set(b.sectionId, list);
  }

  return sections.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    order: s.order,
    blocks: byId.get(s.id) ?? [],
  }));
}

// GET /api/product-sections/[productId] — list sections + blocks in order (admin)
export async function GET(
  _req: Request,
  { params }: { params: { productId: string } },
) {
  return liveJson(await readSections(params.productId));
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
    return liveJson({ ok: true, count: 0, sections: [] });
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

  const blockRows = incoming.flatMap((s, i) =>
    (s.blocks ?? []).map((b, j) => ({
      id: createId(),
      sectionId: inserted[i].id,
      type: b.type,
      order: j,
      data: b.data ?? {},
    })),
  );

  // Written with the raw postgres.js client, not drizzle: drizzle stringifies a
  // jsonb value and postgres.js stringifies it again, so every block saved
  // through drizzle landed as a JSON string. drizzle parses that back on read,
  // which hid it from the admin — but PostgREST hands the string straight to
  // the storefront, where `data.url` is undefined and the block renders as
  // nothing. See the note on sqlClient in lib/supabase/db.ts.
  //
  // One multi-row insert, not a loop: a product's whole tree is rewritten on
  // every save, so per-row round-trips would scale with the block count.
  if (blockRows.length > 0) {
    await sqlClient`
      insert into section_blocks ${sqlClient(
        blockRows,
        "id",
        "sectionId",
        "type",
        "order",
        "data",
      )}`;
  }

  // The saved tree comes back with the response. The editor needs the real row
  // ids for its next save, and re-reading them through a second request left a
  // window where a cached GET could hand back the pre-save snapshot — which the
  // editor would then write over the top of the edit that had just landed.
  return liveJson({
    ok: true,
    count: inserted.length,
    sections: await readSections(params.productId),
  });
}
