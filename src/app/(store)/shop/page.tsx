import ShopPageContent from "@/features/search/components/ShopPageContent";
import { fetchShopPage } from "@/features/search/queries";
import { getNavTree } from "@/features/vehicle-taxonomy";

// The brand filter, the search term and the page number all live in the URL, so
// this page is per-request by definition. `fetchCache` is set for the same
// reason it is on the product routes: `dynamic` alone does not opt a fetch out
// of the Next Data Cache, and this storefront has already been bitten once by a
// page frozen on stale data.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type Props = {
  searchParams: {
    brand?: string;
    group?: string;
    model?: string;
    q?: string;
    page?: string;
  };
};

export default async function ShopPage({ searchParams }: Props) {
  const brand = searchParams.brand?.trim() || undefined;
  const group = searchParams.group?.trim() || undefined;
  const model = searchParams.model?.trim() || undefined;
  const q = searchParams.q?.trim() || undefined;
  const page = Number(searchParams.page) || 1;

  // Filter chips read the same DB-driven tree as the header menu, so the two
  // can never drift apart.
  const [groups, result] = await Promise.all([
    getNavTree(),
    fetchShopPage({ brand, group, model, q, page }),
  ]);

  return (
    <ShopPageContent
      groups={groups}
      result={result}
      activeGroup={group ?? null}
      query={q ?? ""}
    />
  );
}
