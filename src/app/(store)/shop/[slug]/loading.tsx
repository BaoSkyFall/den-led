import { Bar } from "@/components/store/skeletons";

/**
 * /shop/[slug] while the page loads.
 *
 * The page itself is still a client component that fetches its product after
 * mounting, so this covers the first stretch — script and shell — and the
 * page's own loader takes over from there. Shaped like the real layout:
 * gallery on the left, name, price and variants on the right.
 */
export default function ProductLoading() {
  return (
    <div className="bg-[#111111] pt-32 pb-24 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <Bar className="h-2 w-10" />
          <Bar className="h-2 w-16" />
          <Bar className="h-2 w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery: main image over the thumbnail strip */}
          <div className="flex flex-col gap-4">
            <Bar className="aspect-[4/3] w-full" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Bar key={i} className="w-20 aspect-square shrink-0" />
              ))}
            </div>
          </div>

          {/* Name, price, then two variant groups */}
          <div className="space-y-6">
            <Bar className="h-3 w-24" />
            <Bar className="h-10 w-3/4" />
            <Bar className="h-8 w-40" />
            <div className="h-px bg-white/5" />
            {Array.from({ length: 2 }, (_, group) => (
              <div key={group} className="space-y-3">
                <Bar className="h-3 w-32" />
                {Array.from({ length: 3 }, (_, row) => (
                  <Bar key={row} className="h-14 w-full" />
                ))}
              </div>
            ))}
            <Bar className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
