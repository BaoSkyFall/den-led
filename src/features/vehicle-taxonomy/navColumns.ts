import {
  MENU_GROUPS,
  VEHICLE_GROUP_KEY,
  type NavGroup,
  type NavItem,
} from "./types";

/** A product row as it comes back from the nested nav select. */
export type RawNavProduct = { id: string };

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

/** How many active products sit under a model, after the query's filtering. */
const productCount = (model: RawNavModel): number =>
  (model.generations ?? []).reduce(
    (total, generation) => total + (generation.products ?? []).length,
    0,
  );

const brandProductCount = (brand: RawNavBrand): number =>
  (brand.models ?? []).reduce((total, model) => total + productCount(model), 0);

/**
 * Turn the nested brand rows into the menu's headings.
 *
 * Customers were told to "chọn hãng xe" by a line of text that was not a link,
 * above columns named after suppliers — "Đồ Đúc", "Phụ Kiện Bi Cầu" — which say
 * nothing about what is being sold. The menu is grouped by what a thing IS
 * instead: Dòng Xe, Đèn, Linh Kiện.
 *
 * The two kinds of heading are filled differently, which is the point of this
 * function rather than a plain groupBy:
 *
 *   Dòng Xe    lists BRANDS  (Honda, Vinfast) — "which bike is it for"
 *   Đèn        lists MODELS  (Pha Đèn, Xinhan, Đèn Hậu) — "what is it"
 *   Linh Kiện  lists MODELS  (Pat Inox, Hộp …)
 *
 * Anything with no active product underneath is dropped, heading included, so
 * every entry that survives leads somewhere. That is why Hộp In 3D and Hộp
 * Nhôm are absent while they have nothing in stock.
 *
 * Kept apart from the query so the shaping can be tested without a database.
 */
export const buildNavGroups = (rows: RawNavBrand[]): NavGroup[] => {
  const vehicleItems: NavItem[] = rows
    .filter((brand) => !brand.is_accessory)
    .filter((brand) => brandProductCount(brand) > 0)
    .map((brand) => ({
      id: brand.id,
      label: brand.label,
      href: `/shop?brand=${encodeURIComponent(brand.slug)}`,
    }));

  const accessoryModels = rows
    .filter((brand) => brand.is_accessory)
    .flatMap((brand) => brand.models ?? []);

  return MENU_GROUPS.map((group) => {
    const items =
      group.key === VEHICLE_GROUP_KEY
        ? vehicleItems
        : accessoryModels
            .filter((model) => model.group === group.key)
            .filter((model) => productCount(model) > 0)
            .map((model) => ({
              id: model.id,
              label: model.label,
              href: `/shop?model=${encodeURIComponent(model.slug)}`,
            }));

    return {
      key: group.key,
      label: group.label,
      href: `/shop?group=${encodeURIComponent(group.key)}`,
      items,
    };
  }).filter((group) => group.items.length > 0);
};
