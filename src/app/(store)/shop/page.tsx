import ShopPageContent from "@/features/search/components/ShopPageContent";
import { getNavTree } from "@/features/vehicle-taxonomy";

export default async function ShopPage() {
  // Filter chips read the same DB-driven tree as the header menu, so the two
  // can never drift apart.
  const navModels = await getNavTree();

  return <ShopPageContent models={navModels} />;
}
