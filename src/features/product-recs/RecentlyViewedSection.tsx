"use client";

import { useMemo } from "react";
import ProductRecCard from "./ProductRecCard";
import { useRecentlyViewed } from "./useRecentlyViewed";

type Props = {
  excludeSlug: string;
  limit?: number;
};

export default function RecentlyViewedSection({
  excludeSlug,
  limit = 4,
}: Props) {
  const { items } = useRecentlyViewed();

  const shown = useMemo(
    () => items.filter((e) => e.slug !== excludeSlug).slice(0, limit),
    [items, excludeSlug, limit],
  );

  if (shown.length === 0) return null;

  return (
    <section className="mt-12 lg:mt-16 border-t border-white/10 pt-8">
      <div className="mb-6">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-2">
          Anh Đã Xem Gần Đây
        </p>
        <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-white">
          Sản Phẩm Đã Xem
        </h2>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {shown.map((e) => (
          <ProductRecCard
            key={e.slug}
            name={e.name}
            slug={e.slug}
            imageKey={e.imageKey}
            minPrice={e.minVariantPrice}
            fallbackPrice={null}
            badge={e.badge}
          />
        ))}
      </div>
    </section>
  );
}
