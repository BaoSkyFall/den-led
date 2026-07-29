"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductRecCard from "./ProductRecCard";

export type CarouselItem = {
  key: string;
  name: string;
  slug: string;
  imageKey: string | null;
  minPrice: string | null;
  fallbackPrice: string | null;
  badge: string | null;
};

type Props = { items: CarouselItem[] };

/**
 * Horizontal snap slider — shows 2 slides on mobile, 3 on tablet, 4 on
 * desktop. The scroll container uses CSS scroll-snap so drags/swipes align
 * on the next card. Arrow buttons scroll by ~one card width.
 */
export default function ProductRecCarousel({ items }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const node = scrollerRef.current;
    if (!node) return;
    const step = node.clientWidth / 2; // roughly one visible slide on md/lg
    node.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1"
      >
        {items.map((it) => (
          <div
            key={it.key}
            className="shrink-0 snap-start basis-[calc(50%-6px)] md:basis-[calc(33.333%-8px)] lg:basis-[calc(25%-9px)]"
          >
            <ProductRecCard
              name={it.name}
              slug={it.slug}
              imageKey={it.imageKey}
              minPrice={it.minPrice}
              fallbackPrice={it.fallbackPrice}
              badge={it.badge}
            />
          </div>
        ))}
      </div>

      {/* Nav buttons — hidden on mobile where swipe is native */}
      {items.length > 2 && (
        <>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Ảnh trước"
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-black/70 text-white hover:bg-amber-500 hover:text-black transition-colors z-10"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Ảnh sau"
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-black/70 text-white hover:bg-amber-500 hover:text-black transition-colors z-10"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}
