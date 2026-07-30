"use server";

import { assertAdmin } from "@/features/users/assertAdmin";
import { NAV_TAXONOMY_TAG } from "@/features/vehicle-taxonomy/types";
import db from "@/lib/supabase/db";
import { InsertProducts, products } from "@/lib/supabase/schema";
import { eq, inArray } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { revalidateTag } from "next/cache";

type SearchProductsActionProps = {
  query: string;
  limit?: number;
  collections?: string;
  sort?: string;
};

export const createProductAction = async (product: InsertProducts) => {
  await assertAdmin();
  createInsertSchema(products).parse(product);
  const data = await db.insert(products).values(product).returning();
  // name / slug / status / generation_id all feed the storefront menu.
  revalidateTag(NAV_TAXONOMY_TAG);
  return data;
};

export const updateProductAction = async (
  productId: string,
  product: InsertProducts,
) => {
  await assertAdmin();
  createInsertSchema(products).parse(product);
  const insertedProduct = await db
    .update(products)
    .set(product)
    .where(eq(products.id, productId))
    .returning();

  revalidateTag(NAV_TAXONOMY_TAG);
  return insertedProduct;
};

// NOT admin-guarded on purpose: this is a read used by the public checkout flow
// (`/api/create-checkout-session`) to price a normal customer's cart. Adding an
// admin guard here would break checkout for every non-admin shopper. It reads
// by explicit id list only and returns no privileged data.
export const getProductsByIds = async (productIds: string[]) => {
  return await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));
};
