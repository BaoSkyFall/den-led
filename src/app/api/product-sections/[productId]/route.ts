export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { liveJson } from "@/lib/liveJson";

import { cookies } from "next/headers";
import createSupabaseServerClient from "@/lib/supabase/server";
import db from "@/lib/supabase/db";
import { productSections, sectionBlocks } from "@/lib/supabase/schema";
import { asc, eq, inArray } from "drizzle-orm";
import { parseBlockData } from "@/features/product-sections/blockData";
import { BLOCK_TYPES } from "@/features/product-sections/types";
import type {
  BlockType,
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

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * The session check is done here rather than through `assertAdmin()`, which is
 * exported from a `"use server"` module: imported into a route handler it does
 * not reject an anonymous caller — measured, an unauthenticated PUT sailed
 * straight past it. This is the same shape `api/medias/sign` already uses.
 */
const requireAdmin = async (): Promise<Response | null> => {
  const supabase = createSupabaseServerClient({ cookieStore: cookies() });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.app_metadata?.isAdmin) {
    return liveJson({ error: "Chỉ admin mới được thao tác." }, { status: 403 });
  }
  return null;
};

// GET /api/product-sections/[productId] — list sections + blocks in order (admin)
export async function GET(
  _req: Request,
  { params }: { params: { productId: string } },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  return liveJson(await readSections(params.productId));
}

// PUT /api/product-sections/[productId] — replace-all sections tree
// Body: { sections: ProductSection[] } — priority = array index
export async function PUT(
  req: Request,
  { params }: { params: { productId: string } },
) {
  // drizzle connects as the table owner and bypasses RLS, and this handler
  // begins by deleting the product's whole content tree — so without this an
  // anonymous PUT would wipe a product's blog in one request.
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await req.json()) as { sections: ProductSection[] };
  const incoming = Array.isArray(body?.sections) ? body.sections : [];

  // Validated before anything is deleted. A block whose `data` is not an object
  // would be stored as a jsonb string — the exact corruption this endpoint was
  // fixed to stop producing.
  for (const section of incoming) {
    for (const block of section.blocks ?? []) {
      if (!BLOCK_TYPES.includes(block.type as BlockType)) {
        return liveJson(
          { error: `Loại block không hợp lệ: ${block.type}` },
          { status: 400 },
        );
      }
      if (block.data !== undefined && !isPlainObject(block.data)) {
        return liveJson(
          { error: `Dữ liệu block ${block.type} phải là object.` },
          { status: 400 },
        );
      }
    }
  }

  const now = new Date().toISOString();

  // One transaction. The delete is unconditional, so a failure part-way through
  // without it would leave the product with no sections at all and nothing to
  // restore them from.
  const count = await db.transaction(async (tx) => {
    await tx
      .delete(productSections)
      .where(eq(productSections.productId, params.productId));

    if (incoming.length === 0) return 0;

    const inserted = await tx
      .insert(productSections)
      .values(
        incoming.map((s, i) => ({
          id: s.id && !s.id.startsWith("tmp-") ? s.id : undefined,
          productId: params.productId,
          title: s.title ?? "",
          description: s.description ?? null,
          order: i,
          updatedAt: now,
        })),
      )
      // Returned with `order` rather than trusting RETURNING to echo VALUES
      // order, so a block can never attach to the wrong section.
      .returning({ id: productSections.id, order: productSections.order });

    const sectionIdByOrder = new Map(inserted.map((r) => [r.order, r.id]));

    const blockRows = incoming.flatMap((s, i) =>
      (s.blocks ?? []).map((b, j) => ({
        sectionId: sectionIdByOrder.get(i)!,
        type: b.type,
        order: j,
        data: (b.data ?? {}) as Record<string, unknown>,
      })),
    );

    if (blockRows.length > 0) {
      await tx.insert(sectionBlocks).values(blockRows);
    }

    return inserted.length;
  });

  // Read after commit, on the pool — inside the transaction it would return
  // uncommitted rows.
  //
  // The saved tree comes back with the response. The editor needs the real row
  // ids for its next save, and re-reading them through a second request left a
  // window where a cached GET could hand back the pre-save snapshot — which the
  // editor would then write over the top of the edit that had just landed.
  return liveJson({
    ok: true,
    count,
    sections: await readSections(params.productId),
  });
}
