import {
  ACCESSORY_BRAND_LABEL,
  ACCESSORY_BRAND_SLUG,
  NAV_COLUMN_LIMIT,
  type NavBrand,
} from "./types";

/** A product row as it comes back from the nested nav select. */
export type RawNavProduct = {
  id: string;
  name: string;
  slug: string;
  featured?: boolean | null;
  created_at?: string | null;
};

/** A brand row with its Model -> Generation -> Product subtree still nested. */
export type RawNavBrand = {
  id: string;
  label: string;
  slug: string;
  is_accessory?: boolean | null;
  models?: { generations?: { products?: RawNavProduct[] }[] }[];
};

/**
 * Featured first, then newest. `created_at` is an ISO timestamp, so comparing
 * the strings orders them correctly without parsing a Date per comparison.
 */
const byFeaturedThenNewest = (a: RawNavProduct, b: RawNavProduct) =>
  Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
  String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""));

/** Every active product under a brand, with the Model/Generation levels dropped. */
const flattenProducts = (brand: RawNavBrand): RawNavProduct[] =>
  (brand.models ?? []).flatMap((m) =>
    (m.generations ?? []).flatMap((g) => g.products ?? []),
  );

const toColumn = (
  id: string,
  label: string,
  slug: string,
  isAccessory: boolean,
  rows: RawNavProduct[],
): NavBrand => {
  const sorted = [...rows].sort(byFeaturedThenNewest);
  return {
    id,
    label,
    slug,
    isAccessory,
    products: sorted
      .slice(0, NAV_COLUMN_LIMIT)
      .map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
    hasMore: sorted.length > NAV_COLUMN_LIMIT,
  };
};

/**
 * Turn the nested brand rows into the menu's columns.
 *
 * One column per vehicle make, plus a single trailing column holding every
 * brand flagged `is_accessory` — the accessory ranges are several brands that
 * read as one thing to a customer, and giving each its own column is what made
 * the menu outgrow its box.
 *
 * A brand with no product is dropped, the same bottom-up pruning the older
 * model-shaped tree did, so every column that survives leads somewhere.
 *
 * Kept separate from the query so the shaping can be tested without a database.
 */
export const buildNavColumns = (rows: RawNavBrand[]): NavBrand[] => {
  const vehicles = rows
    .filter((b) => !b.is_accessory)
    .map((b) => toColumn(b.id, b.label, b.slug, false, flattenProducts(b)))
    .filter((c) => c.products.length > 0);

  const accessories = toColumn(
    ACCESSORY_BRAND_SLUG,
    ACCESSORY_BRAND_LABEL,
    ACCESSORY_BRAND_SLUG,
    true,
    rows.filter((b) => b.is_accessory).flatMap(flattenProducts),
  );

  // Accessories last: they are the supporting range, and pinning them to the
  // end keeps the vehicle columns in their configured display order.
  return accessories.products.length > 0
    ? [...vehicles, accessories]
    : vehicles;
};
