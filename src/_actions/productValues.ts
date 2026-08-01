import { InsertProducts } from "@/lib/supabase/schema";

/**
 * Pure helpers shaping a product payload before it reaches the database.
 *
 * These live OUTSIDE `products.ts` on purpose. That module carries
 * `"use server"`, and Next wraps every export of such a module as a server
 * action — which makes it async. A synchronous helper exported from there is
 * silently turned into a function returning a Promise, so
 * `schema.parse(blankFksToNull(product))` handed zod a Promise and every
 * product save died with:
 *
 *   ZodError: Expected object, received promise
 *
 * `next build` does not catch this, and neither does a jest test: jest imports
 * the raw module without Next's transform, so the helper behaves normally there
 * and the suite passes while production is broken. Keeping them in a plain
 * module is the only thing that makes the unit tests meaningful.
 */

/**
 * Nullable foreign keys on `products`. An empty string is not a missing value
 * to Postgres — it is a key to look up, so the constraint fires and the save
 * dies with `Key (generation_id)=() is not present in table "generations"`.
 *
 * React Hook Form's Controller keeps its input controlled by falling back to
 * `""` when a field has no default, so a product saved without picking a
 * vehicle class arrives with an empty string rather than null. The form seeds
 * these as null now, but this stays as the guard: server actions are reachable
 * directly, and the failure mode is a 500 rather than a clear error.
 */
const NULLABLE_FKS = ["generationId", "featuredImageId"] as const;

export const blankFksToNull = (product: InsertProducts): InsertProducts => {
  const next = { ...product };
  for (const key of NULLABLE_FKS) {
    if (next[key] === "") next[key] = null;
  }
  return next;
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
