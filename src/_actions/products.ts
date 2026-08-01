"use server";

import { assertAdmin } from "@/features/users/assertAdmin";
import { NAV_TAXONOMY_TAG } from "@/features/vehicle-taxonomy/types";
import db from "@/lib/supabase/db";
import {
  InsertProducts,
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

// Postgres foreign_key_violation. Every inbound FK on `products` cascades
// (carts, wishlists, comments, product_medias, product_sections, variant_groups)
// except `order_lines.product_id`, which is `onDelete: "restrict"` on purpose —
// deleting a sold product would rewrite order history.
//
// So a bare code match is unambiguous TODAY: order_lines is the only child that
// can raise 23503 here. It stops being unambiguous the moment another
// non-cascading FK points at `products`, including one created by hand in SQL
// (a constraint written without ON DELETE defaults to NO ACTION, which raises
// 23503 too). If that happens, this must start discriminating on the error's
// `table_name` — not on the constraint name, because `orderLines.productId`
// declares its FK twice (inline plus a named `foreignKey(...)` in schema.ts),
// so which of the two constraint names surfaces is not predictable.
const isForeignKeyViolation = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  (error as { code?: string }).code === "23503";

/**
 * Why a delete failed. Returned rather than thrown: React redacts the message
 * of an error thrown inside a server action in production builds, so a thrown
 * `Error` would reach the admin as "An error occurred in the Server Components
 * render…" instead of the explanation they need. The caller maps these to copy.
 */
export type DeleteProductFailure = "in_order" | "not_found";

// A string discriminant, not a boolean one: this repo compiles with
// `strict: false`, and without `strictNullChecks` a `{ ok: true } | { ok: false }`
// union does not narrow.
export type DeleteProductResult =
  { status: "deleted"; name: string } | { status: DeleteProductFailure };

/**
 * Permanently deletes a product and everything that cascades from it: gallery
 * links, description sections/blocks, variant groups/options, and customer
 * carts/wishlists/comments pointing at it. The media files themselves are
 * shared library rows and are left alone.
 *
 * Refuses on a product that appears in an order — hiding it via
 * {@link setProductStatusAction} is the correct move there.
 */
export const deleteProductAction = async (
  productId: string,
): Promise<DeleteProductResult> => {
  await assertAdmin();

  let deleted: { name: string } | undefined;
  try {
    [deleted] = await db
      .delete(products)
      .where(eq(products.id, productId))
      .returning({ name: products.name });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return { status: "in_order" };
    }
    throw error;
  }

  if (!deleted) return { status: "not_found" };

  revalidateTag(NAV_TAXONOMY_TAG);
  revalidatePath("/admin/products");
  return { status: "deleted", name: deleted.name };
};

/**
 * Deep-copies a product: the row itself, its description sections and blocks,
 * and its variant groups/options.
 *
 * Nothing image-shaped comes across — no gallery, no featured image, no media
 * inside description blocks, no variant option images. Two products sharing the
 * same photos is almost never what duplicating is for, and an empty gallery is
 * a far more obvious prompt than a wrong one.
 *
 * Customer-owned rows (comments, carts, wishlist, order lines) are also not
 * copied. The copy is created `inactive` and not featured so duplicating never
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
    // A copy carries no images at all — gallery, featured image, the pictures
    // inside description blocks, and variant option images are all left empty
    // so the admin picks fresh ones instead of two products silently sharing
    // the same photos.
    featuredImageId: null,
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

/**
 * Keys inside a block's `data` that point at a media row.
 *
 * A copy carries no images at all, so these are dropped rather than pointed at
 * the source product's media. The block keeps its text, layout and captions —
 * only the picture is missing, which is what an admin then fills in.
 */
const MEDIA_KEYS = ["mediaId", "leftMediaId", "rightMediaId"] as const;

export const stripMediaRefs = (data: unknown): Record<string, unknown> => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const next = { ...(data as Record<string, unknown>) };
  for (const key of MEDIA_KEYS) delete next[key];
  return next;
};

const copyProductTree = async (sourceId: string, values: InsertProducts) => {
  const copy = await db.transaction(async (tx) => {
    const [inserted] = await tx.insert(products).values(values).returning();

    // The gallery is deliberately not copied — see duplicateProductAction.

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
            data: stripMediaRefs(data),
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
          options.map(
            ({
              name,
              price,
              features,
              displayOrder,
              // Carried over explicitly: omitting it fell back to the column
              // default, so every quantity-mode option on a copy silently
              // reverted to a checkbox.
              selectionMode,
            }) => ({
              groupId: newGroup.id,
              name,
              price,
              // No images on a copy, same as the gallery and the blocks.
              images: [],
              features,
              displayOrder,
              selectionMode,
            }),
          ),
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
