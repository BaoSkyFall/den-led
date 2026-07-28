import db from "@/lib/supabase/db";
import { medias, products, variantGroups, variantOptions } from "@/lib/supabase/schema";
import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      badge: products.badge,
      rating: products.rating,
      price: products.price,
      imageKey: medias.key,
      minVariantPrice: sql<string | null>`(
        SELECT MIN(${variantOptions.price})
        FROM ${variantOptions}
        JOIN ${variantGroups} ON ${variantOptions.groupId} = ${variantGroups.id}
        WHERE ${variantGroups.productId} = ${products.id}
      )`,
    })
    .from(products)
    .leftJoin(medias, eq(products.featuredImageId, medias.id))
    .orderBy(desc(products.createdAt));

  return NextResponse.json(rows);
}
