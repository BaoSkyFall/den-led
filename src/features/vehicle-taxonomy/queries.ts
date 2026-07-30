import { createClient } from "@supabase/supabase-js";
import { asc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { env } from "@/env.mjs";
import db from "@/lib/supabase/db";
import {
  brands,
  models,
  products,
  type SelectBrand,
  type SelectGeneration,
  type SelectModel,
} from "@/lib/supabase/schema";

import { NAV_TAXONOMY_TAG } from "./types";
import type {
  BrandTreeBrand,
  MenuConfigModel,
  NavModel,
  VehicleFormOption,
} from "./types";

type ModelWithGenerations = SelectModel & { generations: SelectGeneration[] };

const byOrderThenLabel = <T extends { displayOrder: number; label: string }>(
  a: T,
  b: T,
) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label);

// ─── Public storefront nav ───────────────────────────────────────────────────

/**
 * Uncached fetcher behind {@link getNavTree}.
 *
 * Exported so it can be probed/tested outside the Next.js server runtime, where
 * `unstable_cache` is unavailable. Application code should call `getNavTree()`.
 *
 * Cascade-hide is derived here, never stored:
 *   models.is_active = true            -> inactive model + whole subtree gone
 *   generations.is_active = true       -> inactive generation + its products gone
 *   products.status = 'active'         -> inactive product gone on its own
 *
 * Empty branches are then pruned bottom-up, so the tree only ever contains
 * entries that lead to a product. Deactivating the last product of a model
 * therefore removes that model from the menu and from the filter chips.
 *
 * Brand is not selected at all — it can never leak into the public menu.
 */
export const fetchNavTree = async (): Promise<NavModel[]> => {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // public read; RLS is OFF by design
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase
    .from("models")
    .select(
      `
      id, label, slug, display_order,
      generations (
        id, label, slug, display_order,
        products ( id, name, slug )
      )
    `,
    )
    .eq("is_active", true)
    .eq("generations.is_active", true)
    .eq("generations.products.status", "active")
    .order("display_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    // The header must never take down the storefront - degrade to static links.
    console.error("[getNavTree]", error);
    return [];
  }

  return (
    (data ?? [])
      .map((m: any) => ({
        id: m.id,
        label: m.label,
        slug: m.slug,
        generations: [...(m.generations ?? [])]
          .sort(
            (a: any, b: any) =>
              a.display_order - b.display_order ||
              a.label.localeCompare(b.label),
          )
          .map((g: any) => ({
            id: g.id,
            label: g.label,
            slug: g.slug,
            products: [...(g.products ?? [])]
              .sort((a: any, b: any) => a.name.localeCompare(b.name))
              .map((p: any) => ({ id: p.id, name: p.name, slug: p.slug })),
          }))
          // Pruned bottom-up: a generation with no active product renders as a
          // label with nothing under it, so it goes first...
          .filter((g: any) => g.products.length > 0),
      }))
      // ...and then a model left with no generation has nothing to expand into,
      // so it goes too. Net effect: every entry that survives leads somewhere,
      // on the header menu and on the /shop and home filter chips alike.
      .filter((m) => m.generations.length > 0)
  );
};

/** Public menu tree, cached and invalidated by the `nav-taxonomy` tag. */
export const getNavTree = unstable_cache(fetchNavTree, [NAV_TAXONOMY_TAG], {
  tags: [NAV_TAXONOMY_TAG],
  // Safety net for rows edited directly in SQL / the Supabase dashboard,
  // which fire no revalidation tag.
  revalidate: 300,
});

/**
 * Uncached fetcher behind {@link getVehicleFormOptions}.
 *
 * Every active generation of every active model, whether or not it currently
 * has a product. See {@link VehicleFormOption} for why this is not the nav tree.
 */
export const fetchVehicleFormOptions = async (): Promise<
  VehicleFormOption[]
> => {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // public read; RLS is OFF by design
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase
    .from("models")
    .select(`display_order, label, generations ( label, slug, display_order )`)
    .eq("is_active", true)
    .eq("generations.is_active", true)
    .order("display_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    // The contact form must still render; it just loses its preset options.
    console.error("[getVehicleFormOptions]", error);
    return [];
  }

  return (data ?? []).flatMap((m: any) =>
    [...(m.generations ?? [])]
      .sort(
        (a: any, b: any) =>
          a.display_order - b.display_order || a.label.localeCompare(b.label),
      )
      .map((g: any) => ({ value: g.slug, label: g.label })),
  );
};

/** Contact-form vehicle options, cached under the same tag as the nav tree. */
export const getVehicleFormOptions = unstable_cache(
  fetchVehicleFormOptions,
  [`${NAV_TAXONOMY_TAG}-form-options`],
  { tags: [NAV_TAXONOMY_TAG], revalidate: 300 },
);

// ─── Admin: menu configuration ───────────────────────────────────────────────

/**
 * Admin view of the menu: ALL models and generations for ALL brands, regardless
 * of `is_active`, plus a count of `status='active'` products per generation.
 */
export const getMenuConfigTree = async (): Promise<MenuConfigModel[]> => {
  const [rows, counts] = await Promise.all([
    db.query.models.findMany({
      with: { brand: true, generations: true },
    }),
    db
      .select({
        generationId: products.generationId,
        productCount: sql<number>`count(*)::int`,
      })
      .from(products)
      .where(eq(products.status, "active"))
      .groupBy(products.generationId),
  ]);

  const countByGeneration = new Map<string, number>();
  for (const row of counts) {
    if (row.generationId) {
      countByGeneration.set(row.generationId, Number(row.productCount));
    }
  }

  return rows
    .map((m) => ({
      id: m.id,
      label: m.label,
      slug: m.slug,
      brandId: m.brandId,
      brandLabel: m.brand?.label ?? "",
      displayOrder: m.displayOrder,
      isActive: m.isActive,
      generations: [...m.generations].sort(byOrderThenLabel).map((g) => ({
        id: g.id,
        label: g.label,
        slug: g.slug,
        displayOrder: g.displayOrder,
        isActive: g.isActive,
        productCount: countByGeneration.get(g.id) ?? 0,
      })),
    }))
    .sort(byOrderThenLabel);
};

// ─── Admin: brand / model / generation reads ─────────────────────────────────

/** Full unfiltered tree for the ProductForm taxonomy picker. */
export const getBrandTree = async (): Promise<BrandTreeBrand[]> => {
  const rows = await db.query.brands.findMany({
    with: { models: { with: { generations: true } } },
  });

  return rows.sort(byOrderThenLabel).map((b) => ({
    id: b.id,
    label: b.label,
    models: [...b.models].sort(byOrderThenLabel).map((m) => ({
      id: m.id,
      label: m.label,
      generations: [...m.generations]
        .sort(byOrderThenLabel)
        .map((g) => ({ id: g.id, label: g.label })),
    })),
  }));
};

export const listBrands = async (): Promise<SelectBrand[]> => {
  return await db
    .select()
    .from(brands)
    .orderBy(asc(brands.displayOrder), asc(brands.label));
};

export const getBrand = async (id: string): Promise<SelectBrand | null> => {
  const brand = await db.query.brands.findFirst({ where: eq(brands.id, id) });
  return brand ?? null;
};

/**
 * All models of one brand with their generations nested, UNFILTERED by
 * `is_active` — the admin brand detail page must show hidden rows too.
 */
export const listModelsWithGenerations = async (
  brandId: string,
): Promise<ModelWithGenerations[]> => {
  const rows = await db.query.models.findMany({
    where: eq(models.brandId, brandId),
    with: { generations: true },
  });

  return rows.sort(byOrderThenLabel).map((m) => ({
    ...m,
    generations: [...m.generations].sort(byOrderThenLabel),
  }));
};
