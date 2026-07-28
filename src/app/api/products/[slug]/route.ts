export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";
import { NextResponse } from "next/server";

// HTTPS-based reads via Supabase JS SDK — no direct Postgres connection.
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.DATABASE_SERVICE_ROLE,
      { auth: { persistSession: false } },
    );

    const { data: product, error: productErr } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        badge,
        price,
        featured_image_id,
        medias:featured_image_id(id, key, alt)
      `,
      )
      .eq("slug", params.slug)
      .maybeSingle();

    if (productErr) {
      console.error("[/api/products/[slug]] Product error:", productErr);
      return NextResponse.json({ error: productErr.message }, { status: 500 });
    }

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Variant groups + options
    const { data: groups } = await supabase
      .from("variant_groups")
      .select("id, name, description, display_order")
      .eq("product_id", (product as any).id)
      .order("display_order", { ascending: true });

    const { data: options } = await supabase
      .from("variant_options")
      .select("id, group_id, name, price, images, features, display_order")
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
        })),
    }));

    // Gallery images sorted by priority
    const { data: galleryRows } = await supabase
      .from("product_medias")
      .select("mediaId, priority, medias:mediaId(id, key, alt)")
      .eq("productId", (product as any).id)
      .order("priority", { ascending: true });

    const gallery = (galleryRows ?? []).map((row: any) => ({
      mediaId: row.mediaId,
      key: row.medias?.key ?? "",
      alt: row.medias?.alt ?? "",
      priority: row.priority,
    }));

    const p = product as any;
    return NextResponse.json({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      badge: p.badge,
      price: p.price,
      imageKey: p.medias?.key ?? null,
      variantGroups: groupsWithOptions,
      gallery,
    });
  } catch (err) {
    console.error("[/api/products/[slug]] Unexpected error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal error" },
      { status: 500 },
    );
  }
}
