import { ReactNode, Suspense } from "react";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import SocialRail from "@/components/store/SocialRail";
import PageProgress from "@/components/store/PageProgress";
import { getNavTree, getVehicleFormOptions } from "@/features/vehicle-taxonomy";

type Props = { children: ReactNode };

export default async function StoreLayout({ children }: Props) {
  // Menu is DB-driven (Hãng Xe -> Sản phẩm), cached by the "nav-taxonomy" tag
  // so admin edits show up on the next request.
  // The footer select is intentionally a different view of the taxonomy: it
  // lists every active generation, including ones with no product yet, so a
  // quote request for a model we do not stock is still capturable.
  const [navBrands, vehicleOptions] = await Promise.all([
    getNavTree(),
    getVehicleFormOptions(),
  ]);

  return (
    <div className="bg-[#111111] text-gray-300 antialiased selection:bg-amber-500 selection:text-black min-h-screen flex flex-col">
      {/* Suspense is required, not decorative: PageProgress reads
          useSearchParams, and without a boundary that opts every route in this
          group out of static rendering. */}
      <Suspense fallback={null}>
        <PageProgress />
      </Suspense>
      <StoreHeader brands={navBrands} />
      <div className="flex-1">{children}</div>
      <StoreFooter vehicleOptions={vehicleOptions} />
      <SocialRail />
    </div>
  );
}
