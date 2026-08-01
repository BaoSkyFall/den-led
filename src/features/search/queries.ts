import { ACCESSORY_BRAND_SLUG } from "@/features/vehicle-taxonomy";
import { createLiveRestClient } from "@/lib/supabase/rest";

/** Products per page on /shop. */
export const SHOP_PAGE_SIZE = 12;

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  badge: string | null;
  rating: string;
  price: string;
  imageKey: string | null;
  minVariantPrice: string | null;
};

export type ShopPage = {
  products: ShopProduct[];
  /** Rows matching the filter, not rows on this page. */
  total: number;
  page: number;
  pageCount: number;
};

export type ShopQuery = {
  /** A brand slug, or {@link ACCESSORY_BRAND_SLUG} for every accessory range. */
  brand?: string;
  /** Free-text match against the product name. */
  q?: string;
  page?: number;
};

/** 1-based, and never past the end of the result set. */
const clampPage = (page: number, pageCount: number) =>
  Math.min(Math.max(1, Math.floor(page) || 1), Math.max(1, pageCount));

const EMPTY: ShopPage = { products: [], total: 0, page: 1, pageCount: 1 };

/**
 * One page of /shop, filtered and counted in Postgres.
 *
 * Filtering used to happen in the browser over every active product, which
 * meant the page shipped the whole catalogue to render twelve cards, and it
 * could not survive a reload or a shared link. Both the brand filter and the
 * search term are query parameters now, so a filtered page is addressable.
 *
 * Goes through PostgREST rather than drizzle for the same reason
 * `/api/products/list` does: a direct Postgres socket needs the pooler and
 * clean IPv6, neither of which is a given on Vercel serverless.
 */
export const fetchShopPage = async ({
  brand,
  q,
  page = 1,
}: ShopQuery): Promise<ShopPage> => {
  const supabase = createLiveRestClient();

  // `!inner` turns the nested brand into a join filter, but it also drops any
  // product whose generation is unset — so it is only applied when a brand
  // filter actually needs it, and an unfiltered /shop still lists everything.
  const brandJoin = brand
    ? `generations:generation_id!inner(models:model_id!inner(brands:brand_id!inner(slug, is_accessory)))`
    : "";

  const term = q?.trim();

  // A factory, not a shared builder: supabase-js query objects are mutable and
  // execute on await, so reusing one for the count and then for the rows would
  // stack the second range on top of the first.
  const build = (head: boolean) => {
    let query = supabase
      .from("products")
      .select(
        [
          "id, name, slug, badge, rating, price",
          "medias:featured_image_id(key)",
          brandJoin,
        ]
          .filter(Boolean)
          .join(", "),
        { count: "exact", head },
      )
      .eq("status", "active");

    if (brand === ACCESSORY_BRAND_SLUG) {
      // The accessory column is several brands rendered as one, so it filters
      // on the flag rather than on any single slug.
      query = query.eq("generations.models.brands.is_accessory", true);
    } else if (brand) {
      query = query.eq("generations.models.brands.slug", brand);
    }

    if (term) {
      // Escape the LIKE wildcards so a customer typing "%" searches for "%".
      query = query.ilike("name", `%${term.replace(/[%_]/g, "\\$&")}%`);
    }

    return query;
  };

  // Count first so the page number can be clamped before asking for a range
  // that may no longer exist — deactivating products can strand a bookmarked
  // `?page=9` past the end, and PostgREST answers that with an error.
  const { count, error: countError } = await build(true);
  if (countError) {
    console.error("[fetchShopPage] count", countError);
    return EMPTY;
  }

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / SHOP_PAGE_SIZE));
  const current = clampPage(page, pageCount);
  const from = (current - 1) * SHOP_PAGE_SIZE;

  if (total === 0) return { ...EMPTY, page: 1, pageCount: 1 };

  const { data, error } = await build(false)
    .order("created_at", { ascending: false })
    .range(from, from + SHOP_PAGE_SIZE - 1);

  if (error) {
    console.error("[fetchShopPage]", error);
    return EMPTY;
  }

  const rows = (data ?? []) as any[];
  const minByProduct = await fetchMinVariantPrices(rows.map((p) => p.id));

  return {
    products: rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      badge: p.badge,
      rating: p.rating,
      price: p.price,
      imageKey: p.medias?.key ?? null,
      minVariantPrice: minByProduct.has(p.id)
        ? String(minByProduct.get(p.id))
        : null,
    })),
    total,
    page: current,
    pageCount,
  };
};

/**
 * Cheapest variant per product, for the "Từ …" price on each card.
 *
 * Scoped to the ids on this page rather than the whole table — the point of
 * paginating is to stop reading the entire catalogue per request.
 */
const fetchMinVariantPrices = async (
  productIds: string[],
): Promise<Map<string, number>> => {
  const out = new Map<string, number>();
  if (productIds.length === 0) return out;

  const supabase = createLiveRestClient();
  const { data, error } = await supabase
    .from("variant_options")
    .select("price, variant_groups!inner(product_id)")
    .in("variant_groups.product_id", productIds);

  if (error) {
    // A missing price falls back to "Liên hệ", which is a worse card but not a
    // broken page — never take /shop down over it.
    console.error("[fetchShopPage] variant prices", error);
    return out;
  }

  for (const row of (data ?? []) as any[]) {
    const id = row.variant_groups?.product_id;
    if (!id) continue;
    const price = Number(row.price);
    const seen = out.get(id);
    if (seen === undefined || price < seen) out.set(id, price);
  }
  return out;
};
