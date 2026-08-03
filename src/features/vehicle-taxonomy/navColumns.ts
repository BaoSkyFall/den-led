import {
  MENU_GROUPS,
  VEHICLE_GROUP_KEY,
  type NavGroup,
  type NavSection,
} from "./types";

/** A product row as it comes back from the nested nav select. */
export type RawNavProduct = { id: string; name: string; slug: string };

/** A model row with its generations still nested. */
export type RawNavModel = {
  id: string;
  label: string;
  slug: string;
  group?: string | null;
  generations?: { products?: RawNavProduct[] }[];
};

/** A brand row with its Model -> Generation -> Product subtree nested. */
export type RawNavBrand = {
  id: string;
  label: string;
  slug: string;
  is_accessory?: boolean | null;
  models?: RawNavModel[];
};

/**
 * Every active product under a model, with the generation level flattened out.
 *
 * Generations are how stock is filed, not how anyone shops: a customer wants
 * "SH 2026", and whether that sits under a generation called "SH2026" is an
 * implementation detail of the catalogue.
 */
const toSection = (model: RawNavModel): NavSection => ({
  id: model.id,
  label: model.label,
  href: `/shop?model=${encodeURIComponent(model.slug)}`,
  products: (model.generations ?? [])
    .flatMap((generation) => generation.products ?? [])
    .map((product) => ({
      id: product.id,
      name: product.name,
      href: `/shop/${product.slug}`,
    })),
});

const withStock = (section: NavSection) => section.products.length > 0;

/**
 * Turn the nested brand rows into the header bar's menus.
 *
 * Each heading — Dòng Xe, Đèn, Linh Kiện — is its own item on the bar and
 * opens its own panel on hover. Inside a panel the products are shown outright,
 * grouped by the model they belong to, so a customer reads "SH 2026" rather
 * than a heading they have to guess is worth opening.
 *
 * The two kinds of heading differ only in where their sections come from:
 *
 *   Dòng Xe    models of the vehicle brands — "which bike is it for"
 *   Đèn        models flagged `group = 'den'` — "what is it"
 *   Linh Kiện  models flagged `group = 'linh-kien'`
 *
 * Anything with nothing in stock is dropped, section and heading alike, so
 * every entry that survives leads somewhere.
 *
 * Kept apart from the query so the shaping can be tested without a database.
 */
export const buildNavGroups = (rows: RawNavBrand[]): NavGroup[] => {
  const vehicleSections = rows
    .filter((brand) => !brand.is_accessory)
    .flatMap((brand) => brand.models ?? [])
    .map(toSection)
    .filter(withStock);

  const accessoryModels = rows
    .filter((brand) => brand.is_accessory)
    .flatMap((brand) => brand.models ?? []);

  return MENU_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    href: `/shop?group=${encodeURIComponent(group.key)}`,
    sections:
      group.key === VEHICLE_GROUP_KEY
        ? vehicleSections
        : accessoryModels
            .filter((model) => model.group === group.key)
            .map(toSection)
            .filter(withStock),
  })).filter((group) => group.sections.length > 0);
};
