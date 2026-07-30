"use server";

import { assertAdmin } from "@/features/users/assertAdmin";
import db from "@/lib/supabase/db";
import {
  InsertVariantGroup,
  InsertVariantOption,
  variantGroups,
  variantOptions,
} from "@/lib/supabase/schema";
import { eq } from "drizzle-orm";

// Every export in a "use server" file is a public RPC endpoint. These mutations
// write through drizzle, which connects as the table owner and therefore
// bypasses RLS entirely — so assertAdmin() is the ONLY authorization check on
// the path. Without it, any unauthenticated caller could rewrite variant
// prices, which is exactly the outcome the variant_* RLS policies were meant to
// prevent (see scripts/sql/2026-07-30-fix-variant-admin-policies.sql).

// ─── Variant Groups ───────────────────────────────────────────────────────────

export async function createVariantGroup(data: InsertVariantGroup) {
  await assertAdmin();
  const [group] = await db.insert(variantGroups).values(data).returning();
  return group;
}

export async function updateVariantGroup(
  id: string,
  data: Partial<InsertVariantGroup>,
) {
  await assertAdmin();
  const [group] = await db
    .update(variantGroups)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(variantGroups.id, id))
    .returning();
  return group;
}

export async function deleteVariantGroup(id: string) {
  await assertAdmin();
  await db.delete(variantGroups).where(eq(variantGroups.id, id));
}

export async function getVariantGroupsByProduct(productId: string) {
  return db
    .select()
    .from(variantGroups)
    .where(eq(variantGroups.productId, productId))
    .orderBy(variantGroups.displayOrder);
}

// ─── Variant Options ──────────────────────────────────────────────────────────

export async function createVariantOption(data: InsertVariantOption) {
  await assertAdmin();
  const [option] = await db.insert(variantOptions).values(data).returning();
  return option;
}

export async function updateVariantOption(
  id: string,
  data: Partial<InsertVariantOption>,
) {
  await assertAdmin();
  const [option] = await db
    .update(variantOptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(variantOptions.id, id))
    .returning();
  return option;
}

export async function deleteVariantOption(id: string) {
  await assertAdmin();
  await db.delete(variantOptions).where(eq(variantOptions.id, id));
}

export async function getVariantOptionsByGroup(groupId: string) {
  return db
    .select()
    .from(variantOptions)
    .where(eq(variantOptions.groupId, groupId))
    .orderBy(variantOptions.displayOrder);
}
