import { HeroSkeleton, Bar } from "@/components/store/skeletons";

/**
 * Fallback for every storefront route that has no `loading.tsx` of its own:
 * the home page, /cart, /orders, /wish-list and /setting/*.
 *
 * Next scopes a `loading.tsx` to its segment and everything below it, and the
 * home page is this group's index — so `/` cannot have a bespoke skeleton
 * without being moved into its own route group. It shares this one instead,
 * which is honest for it: the home page's product grid already renders its own
 * skeleton while it fetches, so the only thing this covers there is the shell.
 */
export default function StoreLoading() {
  return (
    <>
      <HeroSkeleton />
      <section className="bg-[#111111] py-16 min-h-[600px]">
        <div className="max-w-[1400px] mx-auto px-6 space-y-6">
          <Bar className="h-3 w-40" />
          <Bar className="h-40 w-full" />
          <Bar className="h-24 w-full" />
          <Bar className="h-24 w-2/3" />
        </div>
      </section>
    </>
  );
}
