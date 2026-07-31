export const dynamic = "force-dynamic";
// `dynamic` alone does not opt the handler's fetches out of the Next Data
// Cache — see `lib/supabase/rest.ts`. This covers any fetch added here later.
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { liveJson, PUBLIC_ERROR } from "@/lib/liveJson";
import { createLiveRestClient } from "@/lib/supabase/rest";

// HTTPS-based reads via Supabase JS SDK — no direct Postgres connection.
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const supabase = createLiveRestClient();

    const { data: product, error: productErr } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        badge,
        price,
        featured_image_id,
        medias:featured_image_id(id, key, alt)
      `,
      )
      .eq("slug", params.slug)
      // An inactive product is invisible storefront-wide, detail page included:
      // it falls through to the 404 branch below exactly like a missing slug.
      .eq("status", "active")
      .maybeSingle();

    if (productErr) {
      console.error("[/api/products/[slug]] Product error:", productErr);
      return liveJson({ error: PUBLIC_ERROR }, { status: 500 });
    }

    if (!product) {
      return liveJson({ error: "Not found" }, { status: 404 });
    }

    // Variant groups + options
    const { data: groups } = await supabase
      .from("variant_groups")
      .select("id, name, description, display_order")
      .eq("product_id", (product as any).id)
      .order("display_order", { ascending: true });

    const { data: options } = await supabase
      .from("variant_options")
      .select(
        "id, group_id, name, price, images, features, display_order, selection_mode",
      )
      .in(
        "group_id",
        (groups ?? []).map((g: any) => g.id),
      )
      .order("display_order", { ascending: true });

    const groupsWithOptions = (groups ?? []).map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      displayOrder: g.display_order,
      options: (options ?? [])
        .filter((o: any) => o.group_id === g.id)
        .map((o: any) => ({
          id: o.id,
          name: o.name,
          price: String(o.price),
          images: o.images ?? [],
          features: o.features ?? [],
          displayOrder: o.display_order,
          selectionMode: (o.selection_mode ?? "select") as
            "select" | "quantity",
        })),
    }));

    // Gallery images sorted by priority — two queries to avoid PostgREST FK
    // embedding issues (mediaId/productId are mixed-case and the join table
    // has duplicate FK definitions, which makes the embed ambiguous).
    const { data: galleryRows, error: galleryErr } = await supabase
      .from("product_medias")
      .select('"mediaId", priority')
      .eq("productId", (product as any).id)
      .order("priority", { ascending: true });

    if (galleryErr) {
      console.error("[/api/products/[slug]] Gallery error:", galleryErr);
    }

    const mediaIds = (galleryRows ?? []).map((r: any) => r.mediaId);
    let mediaMap = new Map<string, { key: string; alt: string }>();

    if (mediaIds.length > 0) {
      const { data: mediaRows, error: mediaErr } = await supabase
        .from("medias")
        .select("id, key, alt")
        .in("id", mediaIds);

      if (mediaErr) {
        console.error("[/api/products/[slug]] Medias error:", mediaErr);
      }

      mediaMap = new Map(
        (mediaRows ?? []).map((m: any) => [
          m.id,
          { key: m.key ?? "", alt: m.alt ?? "" },
        ]),
      );
    }

    const gallery = (galleryRows ?? []).map((row: any) => {
      const media = mediaMap.get(row.mediaId);
      return {
        mediaId: row.mediaId,
        key: media?.key ?? "",
        alt: media?.alt ?? "",
        priority: row.priority,
      };
    });

    // Sections + blocks (blog-style product description) — same 2-query pattern
    const { data: sectionRows } = await supabase
      .from("product_sections")
      .select('id, title, description, "order"')
      .eq("productId", (product as any).id)
      .order("order", { ascending: true });

    const sectionIds = (sectionRows ?? []).map((s: any) => s.id);
    const blocksBySection = new Map<string, any[]>();
    if (sectionIds.length > 0) {
      const { data: blockRows } = await supabase
        .from("section_blocks")
        .select('id, "sectionId", type, "order", data')
        .in("sectionId", sectionIds)
        .order("order", { ascending: true });
      for (const b of blockRows ?? []) {
        const list = blocksBySection.get((b as any).sectionId) ?? [];
        list.push({
          id: (b as any).id,
          type: (b as any).type,
          order: (b as any).order,
          data: (b as any).data ?? {},
        });
        blocksBySection.set((b as any).sectionId, list);
      }
    }

    const sections = (sectionRows ?? []).map((s: any) => ({
      id: s.id,
      title: s.title ?? "",
      description: s.description ?? null,
      order: s.order,
      blocks: blocksBySection.get(s.id) ?? [],
    }));

    const p = product as any;
    return liveJson({
      id: p.id,
      name: p.name,
      slug: p.slug,
      badge: p.badge,
      price: p.price,
      imageKey: p.medias?.key ?? null,
      variantGroups: groupsWithOptions,
      gallery,
      sections,
    });
  } catch (err) {
    console.error("[/api/products/[slug]] Unexpected error:", err);
    return liveJson({ error: PUBLIC_ERROR }, { status: 500 });
  }
}
