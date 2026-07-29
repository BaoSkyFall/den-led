export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";
import { NextResponse } from "next/server";

// GET /api/products/recommended?family=<family>&exclude=<slug>&limit=4
// Returns products from the same vehicle_family first, then tops up with the
// newest products from other families until `limit` is reached.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const family = url.searchParams.get("family");
    const excludeSlug = url.searchParams.get("exclude");
    const limit = Math.max(
      1,
      Math.min(12, Number(url.searchParams.get("limit") ?? "4") || 4),
    );

    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.DATABASE_SERVICE_ROLE,
      { auth: { persistSession: false } },
    );

    const baseSelect = `
      id,
      name,
      slug,
      badge,
      rating,
      price,
      vehicle_family,
      featured_image_id,
      medias:featured_image_id(id, key, alt)
    `;

    // 1) Same-family, newest first
    const primary = family
      ? await supabase
          .from("products")
          .select(baseSelect)
          .eq("vehicle_family", family)
          .neq("slug", excludeSlug ?? "")
          .order("created_at", { ascending: false })
          .limit(limit)
      : { data: [] as any[], error: null };

    if (primary.error) {
      console.error("[recommended] primary error:", primary.error);
    }

    const primaryRows = primary.data ?? [];

    // 2) Top-up with newest of OTHER families if we don't have enough
    const missing = limit - primaryRows.length;
    let fillRows: any[] = [];
    if (missing > 0) {
      const excludeSlugs = [
        excludeSlug,
        ...primaryRows.map((r: any) => r.slug),
      ].filter(Boolean) as string[];

      let query = supabase
        .from("products")
        .select(baseSelect)
        .order("created_at", { ascending: false })
        .limit(missing);
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

    // 3) Min variant price map (single query)
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
      vehicleFamily: p.vehicle_family ?? null,
      imageKey: p.medias?.key ?? null,
      minVariantPrice: minByProduct.has(p.id)
        ? String(minByProduct.get(p.id))
        : null,
    });

    return NextResponse.json([...primaryRows, ...fillRows].map(shape));
  } catch (err) {
    console.error("[/api/products/recommended] error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal error" },
      { status: 500 },
    );
  }
}
