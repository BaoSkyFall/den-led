export const dynamic = "force-dynamic";
// `dynamic` alone does not opt the handler's fetches out of the Next Data
// Cache — see `lib/supabase/rest.ts`. This covers any fetch added here later.
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { liveJson, PUBLIC_ERROR } from "@/lib/liveJson";
import { createLiveRestClient } from "@/lib/supabase/rest";

// GET /api/products/recommended?exclude=<slug>&limit=<n>
// `limit` defaults to 4 and is clamped to 1..12.
// Same-brand products first (any model of the current product's brand), newest
// first, then tops up with the newest other active products until `limit` is
// reached. The brand is derived server-side from the `exclude` slug.
// The legacy `family` param is accepted and ignored.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const excludeSlug = url.searchParams.get("exclude");
    const limit = Math.max(
      1,
      Math.min(12, Number(url.searchParams.get("limit") ?? "4") || 4),
    );

    const supabase = createLiveRestClient();

    // 1) Resolve the current product's brand: products -> generations -> models.
    //    NULL generation_id (unassigned product) => brandId stays null.
    let brandId: string | null = null;
    if (excludeSlug) {
      const { data: current, error: curErr } = await supabase
        .from("products")
        .select("id, generations(id, models(id, brand_id))")
        .eq("slug", excludeSlug)
        .maybeSingle();
      if (curErr) console.error("[recommended] brand lookup error:", curErr);
      brandId = (current as any)?.generations?.models?.brand_id ?? null;
    }

    const baseSelect = `
      id,
      name,
      slug,
      badge,
      rating,
      price,
      featured_image_id,
      medias:featured_image_id(id, key, alt)
    `;

    // 2) Same-brand, visible only, newest first.
    //    !inner is load-bearing: without it PostgREST prunes the embed but
    //    keeps the product row, so none of the nested filters would exclude
    //    any product from the result set.
    let primaryRows: any[] = [];
    if (brandId) {
      const { data, error } = await supabase
        .from("products")
        .select(
          `${baseSelect},
           generations!inner(id, is_active, models!inner(id, is_active, brand_id))`,
        )
        .eq("generations.models.brand_id", brandId)
        .eq("generations.is_active", true)
        .eq("generations.models.is_active", true)
        .eq("status", "active")
        .neq("slug", excludeSlug ?? "")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) console.error("[recommended] primary error:", error);
      primaryRows = data ?? [];
    }

    // 3) Top-up with the newest OTHER active products. Products not yet
    //    assigned to a generation must still be recommendable, but a product
    //    hidden by toggling its generation (or its model) off must NOT sneak
    //    back in here after the primary query excluded it — so the fill is
    //    restricted to "no generation at all" OR "a fully visible generation".
    const missing = limit - primaryRows.length;
    let fillRows: any[] = [];
    if (missing > 0) {
      const excludeSlugs = [
        excludeSlug,
        ...primaryRows.map((r: any) => r.slug),
      ].filter(Boolean) as string[];

      const { data: genRows, error: genErr } = await supabase
        .from("generations")
        .select("id, is_active, models!inner(is_active)")
        .eq("is_active", true)
        .eq("models.is_active", true);
      if (genErr) console.error("[recommended] visibility error:", genErr);
      const visibleGenerationIds = (genRows ?? []).map((g: any) => g.id);

      let query = supabase
        .from("products")
        .select(baseSelect)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(missing);

      query =
        visibleGenerationIds.length > 0
          ? query.or(
              `generation_id.is.null,generation_id.in.(${visibleGenerationIds
                .map((id: string) => `"${id}"`)
                .join(",")})`,
            )
          : query.is("generation_id", null);

      if (excludeSlugs.length > 0) {
        query = query.not(
          "slug",
          "in",
          `(${excludeSlugs.map((s) => `"${s}"`).join(",")})`,
        );
      }
      const fill = await query;
      if (fill.error) console.error("[recommended] fill error:", fill.error);
      fillRows = fill.data ?? [];
    }

    // 4) Min variant price map (single query)
    const allIds = [...primaryRows, ...fillRows].map((r: any) => r.id);
    const minByProduct = new Map<string, number>();
    if (allIds.length > 0) {
      const { data: minPrices } = await supabase
        .from("variant_options")
        .select("price, variant_groups(product_id)");
      for (const row of (minPrices as any[]) ?? []) {
        const pid = row.variant_groups?.product_id;
        if (!pid) continue;
        if (!allIds.includes(pid)) continue;
        const p = Number(row.price);
        const cur = minByProduct.get(pid);
        if (cur === undefined || p < cur) minByProduct.set(pid, p);
      }
    }

    const shape = (p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      badge: p.badge,
      rating: p.rating,
      price: p.price,
      imageKey: p.medias?.key ?? null,
      minVariantPrice: minByProduct.has(p.id)
        ? String(minByProduct.get(p.id))
        : null,
    });

    return liveJson([...primaryRows, ...fillRows].map(shape));
  } catch (err) {
    console.error("[/api/products/recommended] error:", err);
    return liveJson({ error: PUBLIC_ERROR }, { status: 500 });
  }
}
