// Shared shapes for the vehicle taxonomy (Brand -> Model -> Generation).
//
// Three distinct views over the same tree:
//  - Nav*        : the PUBLIC storefront menu. Brand is deliberately absent.
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
