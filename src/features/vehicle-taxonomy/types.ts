// Shared shapes for the vehicle taxonomy (Brand -> Model -> Generation).
//
// Three distinct views over the same tree:
//  - Nav*        : the PUBLIC storefront menu, keyed by product type.
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

/**
 * The storefront menu's headings, left to right.
 *
 * Grouped by what a product IS rather than who supplies it. The old menu put a
 * column per brand under a line of text reading "Chọn hãng xe để xem gói độ
 * đèn" — which was not a link, while the only link sat at the bottom of each
 * column. Customers reported not knowing where they could click.
 *
 * Fixed here rather than fetched: three headings that change about never, and
 * a table for them would be a join per page load for no benefit. What each one
 * CONTAINS is data — see `models.group` and `brands.is_accessory`.
 */
export const MENU_GROUPS = [
  { key: "dong-xe", label: "Dòng Xe" },
  { key: "den", label: "Đèn" },
  { key: "linh-kien", label: "Linh Kiện" },
] as const;

/**
 * The one heading filled from brands rather than from `models.group`.
 *
 * "Dòng Xe" answers a different question than its neighbours — "which bike is
 * this for" rather than "what is this" — so it is the set of brands that are
 * not accessory ranges, and vehicle models carry no group value at all.
 */
export const VEHICLE_GROUP_KEY = "dong-xe";

export type MenuGroupKey = (typeof MENU_GROUPS)[number]["key"];

/** A product, linked straight to its own page. */
export type NavProduct = {
  id: string;
  name: string;
  /** `/shop/<slug>`. */
  href: string;
};

/**
 * One "Loại xe" inside a heading — a model, with the products it holds.
 *
 * The menu shows both levels at once rather than making the type a link that
 * has to be followed: a customer looking for "SH 2026" should see the words
 * "SH 2026", not a heading called SH they must guess is worth opening.
 */
export type NavSection = {
  id: string;
  label: string;
  /** `/shop?model=<slug>` — the type itself stays clickable. */
  href: string;
  products: NavProduct[];
};

/** One item on the header bar, with everything shown when it is hovered. */
export type NavGroup = {
  key: string;
  label: string;
  /** `/shop?group=<key>`. */
  href: string;
  sections: NavSection[];
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
  /** Storefront heading; null on vehicle models. See `models.group`. */
  group: string | null;
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
