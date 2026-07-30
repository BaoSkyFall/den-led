"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { assertAdmin } from "@/features/users/assertAdmin";
import db from "@/lib/supabase/db";
import {
  brands,
  generations,
  models,
  type InsertBrand,
  type InsertGeneration,
  type InsertModel,
} from "@/lib/supabase/schema";

import { NAV_TAXONOMY_TAG } from "./types";
import {
  brandInsertSchema,
  generationInsertSchema,
  modelInsertSchema,
} from "./validations";

// Every taxonomy write changes the storefront menu and the admin menu page.
const revalidateTaxonomy = () => {
  revalidateTag(NAV_TAXONOMY_TAG);
  revalidatePath("/admin/menu");
};

// ─── Brands ──────────────────────────────────────────────────────────────────

export const createBrandAction = async (input: InsertBrand) => {
  await assertAdmin();
  brandInsertSchema.parse(input);
  const rows = await db.insert(brands).values(input).returning();
  revalidateTaxonomy();
  return rows[0];
};

export const updateBrandAction = async (
  id: string,
  input: Partial<InsertBrand>,
) => {
  await assertAdmin();
  brandInsertSchema.partial().parse(input);
  const rows = await db
    .update(brands)
    .set({
      label: input.label,
      slug: input.slug,
      displayOrder: input.displayOrder,
    })
    .where(eq(brands.id, id))
    .returning();
  revalidateTaxonomy();
  return rows[0] ?? null;
};

export const deleteBrandAction = async (id: string) => {
  await assertAdmin();
  await db.delete(brands).where(eq(brands.id, id));
  revalidateTaxonomy();
};

// ─── Models ──────────────────────────────────────────────────────────────────

export const createModelAction = async (input: InsertModel) => {
  await assertAdmin();
  modelInsertSchema.parse(input);

  // Model ordering is GLOBAL across brands (the storefront menu is a flat list
  // of models), so the next slot has to be computed over EVERY model. Deriving
  // it per-brand on the client would make a second brand's first model land at
  // display_order 1 and jump to the top of the menu.
  let displayOrder = input.displayOrder;
  if (displayOrder === undefined) {
    const [row] = await db
      .select({
        maxOrder: sql<number>`coalesce(max(${models.displayOrder}), 0)::int`,
      })
      .from(models);
    displayOrder = Number(row?.maxOrder ?? 0) + 1;
  }

  const rows = await db
    .insert(models)
    .values({ ...input, displayOrder })
    .returning();
  revalidateTaxonomy();
  return rows[0];
};

export const updateModelAction = async (
  id: string,
  input: Partial<InsertModel>,
) => {
  await assertAdmin();
  modelInsertSchema.partial().parse(input);
  const rows = await db
    .update(models)
    .set({
      brandId: input.brandId,
      label: input.label,
      slug: input.slug,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    })
    .where(eq(models.id, id))
    .returning();
  revalidateTaxonomy();
  return rows[0] ?? null;
};

export const deleteModelAction = async (id: string) => {
  await assertAdmin();
  await db.delete(models).where(eq(models.id, id));
  revalidateTaxonomy();
};

// ─── Generations ─────────────────────────────────────────────────────────────

export const createGenerationAction = async (input: InsertGeneration) => {
  await assertAdmin();
  generationInsertSchema.parse(input);
  const rows = await db.insert(generations).values(input).returning();
  revalidateTaxonomy();
  return rows[0];
};

export const updateGenerationAction = async (
  id: string,
  input: Partial<InsertGeneration>,
) => {
  await assertAdmin();
  generationInsertSchema.partial().parse(input);
  const rows = await db
    .update(generations)
    .set({
      modelId: input.modelId,
      label: input.label,
      slug: input.slug,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    })
    .where(eq(generations.id, id))
    .returning();
  revalidateTaxonomy();
  return rows[0] ?? null;
};

export const deleteGenerationAction = async (id: string) => {
  await assertAdmin();
  await db.delete(generations).where(eq(generations.id, id));
  revalidateTaxonomy();
};

// ─── Visibility toggles (cascade-hide is derived at query time) ───────────────

export const setModelActiveAction = async (id: string, isActive: boolean) => {
  await assertAdmin();
  const rows = await db
    .update(models)
    .set({ isActive })
    .where(eq(models.id, id))
    .returning();
  revalidateTaxonomy();
  return rows[0] ?? null;
};

export const setGenerationActiveAction = async (
  id: string,
  isActive: boolean,
) => {
  await assertAdmin();
  const rows = await db
    .update(generations)
    .set({ isActive })
    .where(eq(generations.id, id))
    .returning();
  revalidateTaxonomy();
  return rows[0] ?? null;
};

// ─── Reordering ──────────────────────────────────────────────────────────────

export const reorderModelsAction = async (orderedIds: string[]) => {
  await assertAdmin();
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(models)
        .set({ displayOrder: i + 1 })
        .where(eq(models.id, orderedIds[i]));
    }
  });
  revalidateTaxonomy();
};

export const reorderGenerationsAction = async (
  modelId: string,
  orderedIds: string[],
) => {
  await assertAdmin();
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(generations)
        .set({ displayOrder: i + 1 })
        .where(
          and(
            eq(generations.id, orderedIds[i]),
            eq(generations.modelId, modelId),
          ),
        );
    }
  });
  revalidateTaxonomy();
};
