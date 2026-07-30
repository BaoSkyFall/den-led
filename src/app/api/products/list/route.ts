export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";
import { NextResponse } from "next/server";

// Use Supabase JS SDK (HTTPS/PostgREST) instead of direct Postgres.
// Works on Vercel serverless without pooler / IPv6 issues.
export async function GET() {
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.DATABASE_SERVICE_ROLE,
      { auth: { persistSession: false } },
    );

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
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 },
      );
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

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[/api/products/list] Unexpected error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal error" },
      { status: 500 },
    );
  }
}
