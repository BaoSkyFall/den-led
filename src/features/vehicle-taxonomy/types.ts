// Shared shapes for the vehicle taxonomy (Brand -> Model -> Generation).
//
// Three distinct views over the same tree:
//  - Nav*        : the PUBLIC storefront menu, now keyed by brand.
//  - MenuConfig* : the admin "Cấu Hình Menu" view. Everything, unfiltered.
//  - BrandTree*  : the full unfiltered tree used by the ProductForm picker.

/**
 * Cache tag for the storefront nav tree.
 *
 * Lives here (and not in `queries.ts`) so that every writer — taxonomy actions,
 * product actions — can import it without pulling in the query layer. A rename
 * must never silently stop revalidating the menu.
 */
export const NAV_TAXONOMY_TAG = "nav-taxonomy";

export type NavProduct = { id: string; name: string; slug: string };
export type NavGeneration = {
  id: string;
  label: string;
  slug: string;
  products: NavProduct[];
};
export type NavModel = {
  id: string;
  label: string;
  slug: string;
  generations: NavGeneration[];
};

/**
 * Longest a menu column may get before it turns into a "Xem thêm" link.
 *
 * Applies to every column, vehicle makes included. The accessory ranges looked
 * like the reason the menu had outgrown its box, but counting the rows showed
 * Honda alone would have rendered ten entries against the accessory column's
 * five — capping only accessories would have moved the bulge, not removed it.
 */
export const NAV_COLUMN_LIMIT = 5;

/**
 * Synthetic slug for the merged accessory column.
 *
 * The column is several brands rendered as one, so it has no brand slug of its
 * own to put in `/shop?brand=`. This stands in for "every brand flagged
 * `is_accessory`" on both ends of that link. It cannot collide with a real
 * brand: `brands.slug` is UNIQUE and no row uses this value.
 */
export const ACCESSORY_BRAND_SLUG = "phu-kien";

export const ACCESSORY_BRAND_LABEL = "Phụ Kiện";

/**
 * One column of the storefront menu: a brand, or the merged accessory group.
 *
 * Products are flattened out of the Model -> Generation nesting deliberately —
 * the menu trades the intermediate levels for a single click to the product,
 * and `/shop` keeps the browsable hierarchy.
 */
export type NavBrand = {
  id: string;
  label: string;
  slug: string;
  isAccessory: boolean;
  /** Capped at {@link NAV_COLUMN_LIMIT}. */
  products: NavProduct[];
  /** True when products were dropped by the cap, so a "Xem thêm" link is due. */
  hasMore: boolean;
};

/**
 * One option for the "Dòng xe cần độ đèn" select in the footer contact form.
 *
 * Deliberately NOT derived from the nav tree: the nav tree only keeps entries
 * that lead to a purchasable product, but a customer asking for a quote may
 * well ride a model we do not stock yet, and dropping it would lose the lead.
 */
export type VehicleFormOption = { value: string; label: string };

export type MenuConfigGeneration = {
  id: string;
  label: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
};

export type MenuConfigModel = {
  id: string;
  label: string;
  slug: string;
  brandId: string;
  brandLabel: string;
  displayOrder: number;
  isActive: boolean;
  generations: MenuConfigGeneration[];
};

export type BrandTreeGeneration = { id: string; label: string };
export type BrandTreeModel = {
  id: string;
  label: string;
  generations: BrandTreeGeneration[];
};
export type BrandTreeBrand = {
  id: string;
  label: string;
  models: BrandTreeModel[];
};
