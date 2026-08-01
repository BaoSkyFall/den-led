/**
 * Skeleton pieces for the storefront's `loading.tsx` files.
 *
 * These mirror the real layouts closely enough that nothing jumps when the
 * data lands — a skeleton whose proportions are wrong is worse than none,
 * because the page visibly rearranges itself the moment it renders.
 *
 * All server components: they hold no state and animate in CSS.
 */

/** One shimmering block. `bg-white/5` matches the cards it stands in for. */
export function Bar({ className = "" }: { className?: string }) {
  return <div className={`bg-white/5 animate-pulse ${className}`} />;
}

/** Stand-in for a product card: 16:10 image over a title and price row. */
export function CardSkeleton() {
  return (
    <div className="bg-white/5 overflow-hidden">
      <Bar className="aspect-[16/10] w-full" />
      <div className="p-5 space-y-3 border-t border-white/5">
        <Bar className="h-5 w-3/4" />
        <div className="flex items-end justify-between pt-3 border-t border-white/5">
          <div className="space-y-2">
            <Bar className="h-2 w-8" />
            <Bar className="h-4 w-24" />
          </div>
          <Bar className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}

/** The three-column product grid used by /shop and the home page. */
export function CardGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * The tall dark banner every storefront page opens with, so the skeleton has
 * the same silhouette as the page it precedes.
 */
export function HeroSkeleton() {
  return (
    <section className="bg-[#0a0a0a] pt-32 pb-16 border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 space-y-4">
        <Bar className="h-2 w-32" />
        <Bar className="h-12 lg:h-16 w-64" />
        <Bar className="h-3 w-full max-w-lg" />
      </div>
    </section>
  );
}
