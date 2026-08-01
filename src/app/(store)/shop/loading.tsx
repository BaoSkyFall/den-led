import {
  Bar,
  CardGridSkeleton,
  HeroSkeleton,
} from "@/components/store/skeletons";
import { SHOP_PAGE_SIZE } from "@/features/search/queries";

/**
 * /shop while the server filters and counts.
 *
 * This route went dynamic when filtering and pagination moved into Postgres,
 * so it is the page most likely to be caught mid-request — hence a skeleton
 * built to the real thing: banner, sticky filter bar, then a full page of
 * cards. The card count is `SHOP_PAGE_SIZE`, so the skeleton and the page it
 * precedes can never disagree about how many rows to expect.
 */
export default function ShopLoading() {
  return (
    <>
      <HeroSkeleton />

      {/* Filter bar: chips on the left, search box on the right */}
      <section className="sticky top-24 z-40 bg-[#111111]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Widths are literal classes, not interpolated: Tailwind only
                emits what it can see in the source, so `w-${n}` would compile
                to nothing and the chips would collapse. */}
            <div className="flex items-center gap-2">
              <Bar className="h-8 w-16" />
              <Bar className="h-8 w-20" />
              <Bar className="h-8 w-24" />
              <Bar className="h-8 w-20" />
            </div>
            <Bar className="h-10 w-full lg:w-72" />
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-16 min-h-[600px]">
        <div className="max-w-[1400px] mx-auto px-6">
          <Bar className="h-3 w-32 mb-8" />
          <CardGridSkeleton count={SHOP_PAGE_SIZE} />
        </div>
      </section>
    </>
  );
}
