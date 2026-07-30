"use server";

import { assertAdmin } from "@/features/users/assertAdmin";
import { NAV_TAXONOMY_TAG } from "@/features/vehicle-taxonomy/types";
import db from "@/lib/supabase/db";
import {
  InsertProducts,
  productMedias,
  products,
  productSections,
  sectionBlocks,
  variantGroups,
  variantOptions,
} from "@/lib/supabase/schema";
import { asc, eq, inArray, like } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { revalidatePath, revalidateTag } from "next/cache";

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

// `products.slug` / `products.name` are varchar(191).
const COLUMN_MAX_LENGTH = 191;
const COPY_SUFFIX = " (Bản sao)";
const MAX_SLUG_ATTEMPTS = 5;

const truncate = (value: string, room: number) =>
  value.slice(0, COLUMN_MAX_LENGTH - room);

const copySlug = (base: string, attempt: number) =>
  attempt === 1 ? `${base}-copy` : `${base}-copy-${attempt}`;

// Postgres unique_violation — two admins can duplicate the same product at the
// same time, so the pre-flight slug scan below is a fast path, not a guarantee.
const isUniqueViolation = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  (error as { code?: string }).code === "23505";

export const setProductStatusAction = async (
  productId: string,
  status: "active" | "inactive",
) => {
  await assertAdmin();
  // Server actions are reachable over HTTP with arbitrary args, and drizzle's
  // `enum` is type-level only — an unexpected value would hide the product from
  // the storefront in a state the switch cannot represent or undo.
  if (status !== "active" && status !== "inactive") {
    throw new Error(`Trạng thái không hợp lệ: ${status}`);
  }

  const rows = await db
    .update(products)
    .set({ status })
    .where(eq(products.id, productId))
    .returning();

  // The storefront nav tree only counts `status = 'active'` products.
  revalidateTag(NAV_TAXONOMY_TAG);
  revalidatePath("/admin/products");
  return rows[0] ?? null;
};

/**
 * Deep-copies a product: the row itself plus its gallery, description sections
 * and variant groups/options. Customer-owned rows (comments, carts, wishlist,
 * order lines) are deliberately not copied.
 *
 * The copy is created `inactive` and not featured so duplicating never
 * publishes a half-edited product to the storefront.
 */
export const duplicateProductAction = async (productId: string) => {
  await assertAdmin();

  const [source] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));

  if (!source) {
    throw new Error("Không tìm thấy sản phẩm cần nhân bản.");
  }

  const slugBase = truncate(source.slug, "-copy-99".length);
  // `slug` is UNIQUE, so read the copies that already exist and start past
  // them instead of failing on the first collision.
  const takenSlugs = new Set(
    (
      await db
        .select({ slug: products.slug })
        .from(products)
        .where(like(products.slug, `${slugBase}-copy%`))
    ).map((row) => row.slug),
  );

  // No cap here: `takenSlugs` is already in memory, so scanning past 5 costs
  // nothing. Capping it made duplicating permanently fail once a product had
  // ~10 copies, even though a free slug existed. MAX_SLUG_ATTEMPTS guards only
  // the round-trip retry below.
  let attempt = 1;
  while (takenSlugs.has(copySlug(slugBase, attempt))) {
    attempt++;
  }

  const { id: _sourceId, createdAt: _createdAt, ...carriedOver } = source;
  const values: InsertProducts = {
    ...carriedOver,
    name: `${truncate(source.name, COPY_SUFFIX.length)}${COPY_SUFFIX}`,
    slug: copySlug(slugBase, attempt),
    status: "inactive",
    featured: false,
    totalComments: 0,
  };

  for (let tries = 0; ; tries++) {
    try {
      return await copyProductTree(source.id, values);
    } catch (error) {
      if (!isUniqueViolation(error) || tries >= MAX_SLUG_ATTEMPTS) throw error;
      attempt++;
      values.slug = copySlug(slugBase, attempt);
    }
  }
};

const copyProductTree = async (sourceId: string, values: InsertProducts) => {
  const copy = await db.transaction(async (tx) => {
    const [inserted] = await tx.insert(products).values(values).returning();

    const gallery = await tx
      .select()
      .from(productMedias)
      .where(eq(productMedias.productId, sourceId));
    if (gallery.length > 0) {
      await tx.insert(productMedias).values(
        gallery.map(({ mediaId, priority }) => ({
          productId: inserted.id,
          mediaId,
          priority,
        })),
      );
    }

    const sections = await tx
      .select()
      .from(productSections)
      .where(eq(productSections.productId, sourceId))
      .orderBy(asc(productSections.order));
    for (const section of sections) {
      const [newSection] = await tx
        .insert(productSections)
        .values({
          productId: inserted.id,
          title: section.title,
          description: section.description,
          order: section.order,
        })
        .returning();

      const blocks = await tx
        .select()
        .from(sectionBlocks)
        .where(eq(sectionBlocks.sectionId, section.id))
        .orderBy(asc(sectionBlocks.order));
      if (blocks.length > 0) {
        await tx.insert(sectionBlocks).values(
          blocks.map(({ type, order, data }) => ({
            sectionId: newSection.id,
            type,
            order,
            data,
          })),
        );
      }
    }

    const groups = await tx
      .select()
      .from(variantGroups)
      .where(eq(variantGroups.productId, sourceId))
      .orderBy(asc(variantGroups.displayOrder));
    for (const group of groups) {
      const [newGroup] = await tx
        .insert(variantGroups)
        .values({
          productId: inserted.id,
          name: group.name,
          description: group.description,
          displayOrder: group.displayOrder,
        })
        .returning();

      const options = await tx
        .select()
        .from(variantOptions)
        .where(eq(variantOptions.groupId, group.id))
        .orderBy(asc(variantOptions.displayOrder));
      if (options.length > 0) {
        await tx.insert(variantOptions).values(
          options.map(({ name, price, images, features, displayOrder }) => ({
            groupId: newGroup.id,
            name,
            price,
            images,
            features,
            displayOrder,
          })),
        );
      }
    }

    return inserted;
  });

  revalidateTag(NAV_TAXONOMY_TAG);
  revalidatePath("/admin/products");
  return copy;
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
