export const dynamic = "force-dynamic";
// `dynamic` alone does not opt the handler's fetches out of the Next Data
// Cache — see `lib/supabase/rest.ts`. This covers any fetch added here later.
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { liveJson, PUBLIC_ERROR } from "@/lib/liveJson";
import { createLiveRestClient } from "@/lib/supabase/rest";

// Use Supabase JS SDK (HTTPS/PostgREST) instead of direct Postgres.
// Works on Vercel serverless without pooler / IPv6 issues.
export async function GET() {
  try {
    const supabase = createLiveRestClient();

    // Fetch products + featured image.
    // `status = 'active'` is storefront-wide: this route feeds both the home
    // page specials grid and /shop, so an inactive product disappears from both.
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        badge,
        rating,
        price,
        featured_image_id,
        medias:featured_image_id(id, key, alt),
        generations:generation_id(id, models:model_id(slug))
      `,
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[/api/products/list] Supabase error:", error);
      return liveJson({ error: PUBLIC_ERROR }, { status: 500 });
    }

    // Fetch min variant price per product (single query)
    const { data: minPrices } = await supabase
      .from("variant_options")
      .select("price, variant_groups(product_id)");

    const minByProduct = new Map<string, number>();
    for (const row of (minPrices as any[]) ?? []) {
      const pid = row.variant_groups?.product_id;
      if (!pid) continue;
      const p = Number(row.price);
      const cur = minByProduct.get(pid);
      if (cur === undefined || p < cur) minByProduct.set(pid, p);
    }

    const rows = (products ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      badge: p.badge,
      rating: p.rating,
      price: p.price,
      imageKey: p.medias?.key ?? null,
      // Model slug (product -> generation -> model) so the /shop chips can
      // filter on real taxonomy instead of guessing from the product name.
      modelSlug: p.generations?.models?.slug ?? null,
      minVariantPrice: minByProduct.has(p.id)
        ? String(minByProduct.get(p.id))
        : null,
    }));

    return liveJson(rows);
  } catch (err) {
    console.error("[/api/products/list] Unexpected error:", err);
    return liveJson({ error: PUBLIC_ERROR }, { status: 500 });
  }
}
