"use server";

import db from "@/lib/supabase/db";
import {
  InsertVariantGroup,
  InsertVariantOption,
  variantGroups,
  variantOptions,
} from "@/lib/supabase/schema";
import { eq } from "drizzle-orm";

// ─── Variant Groups ───────────────────────────────────────────────────────────

export async function createVariantGroup(data: InsertVariantGroup) {
  const [group] = await db.insert(variantGroups).values(data).returning();
  return group;
}

export async function updateVariantGroup(
  id: string,
  data: Partial<InsertVariantGroup>,
) {
  const [group] = await db
    .update(variantGroups)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(variantGroups.id, id))
    .returning();
  return group;
}

export async function deleteVariantGroup(id: string) {
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
  const [option] = await db.insert(variantOptions).values(data).returning();
  return option;
}

export async function updateVariantOption(
  id: string,
  data: Partial<InsertVariantOption>,
) {
  const [option] = await db
    .update(variantOptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(variantOptions.id, id))
    .returning();
  return option;
}

export async function deleteVariantOption(id: string) {
  await db.delete(variantOptions).where(eq(variantOptions.id, id));
}

export async function getVariantOptionsByGroup(groupId: string) {
  return db
    .select()
    .from(variantOptions)
    .where(eq(variantOptions.groupId, groupId))
    .orderBy(variantOptions.displayOrder);
}
