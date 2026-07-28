export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import db from "@/lib/supabase/db";
import {
  medias,
  productMedias,
  products,
  variantGroups,
  variantOptions,
} from "@/lib/supabase/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      badge: products.badge,
      price: products.price,
      imageKey: medias.key,
    })
    .from(products)
    .leftJoin(medias, eq(products.featuredImageId, medias.id))
    .where(eq(products.slug, params.slug))
    .limit(1);

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const groups = await db
    .select()
    .from(variantGroups)
    .where(eq(variantGroups.productId, product.id))
    .orderBy(variantGroups.displayOrder);

  const groupsWithOptions = await Promise.all(
    groups.map(async (group) => {
      const options = await db
        .select()
        .from(variantOptions)
        .where(eq(variantOptions.groupId, group.id))
        .orderBy(variantOptions.displayOrder);
      return { ...group, options };
    }),
  );

  // Fetch gallery images sorted by priority
  const gallery = await db
    .select({
      mediaId: medias.id,
      key: medias.key,
      alt: medias.alt,
      priority: productMedias.priority,
    })
    .from(productMedias)
    .innerJoin(medias, eq(productMedias.mediaId, medias.id))
    .where(eq(productMedias.productId, product.id))
    .orderBy(asc(productMedias.priority));

  return NextResponse.json({
    ...product,
    variantGroups: groupsWithOptions,
    gallery,
  });
}
