"use client";

import { useEffect, useState } from "react";
import ProductRecCarousel from "./ProductRecCarousel";
import type { MiniProduct } from "./types";

type Props = {
  excludeSlug: string;
  limit?: number;
  title?: string;
  eyebrow?: string;
};

export default function RecommendedSection({
  excludeSlug,
  limit = 6,
  title = "Sản Phẩm Đề Xuất",
  eyebrow = "Có Thể Bạn Cũng Thích",
}: Props) {
  const [items, setItems] = useState<MiniProduct[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (excludeSlug) params.set("exclude", excludeSlug);
    params.set("limit", String(limit));
    fetch(`/api/products/recommended?${params.toString()}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, [excludeSlug, limit]);

  if (items === null) {
    return (
      <section className="mt-12 lg:mt-16 border-t border-white/10 pt-8">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 basis-[calc(50%-6px)] md:basis-[calc(33.333%-8px)] lg:basis-[calc(25%-9px)] aspect-[16/10] bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mt-12 lg:mt-16 border-t border-white/10 pt-8">
      <SectionHeader eyebrow={eyebrow} title={title} />
      <ProductRecCarousel
        items={items.map((p) => ({
          key: p.id,
          name: p.name,
          slug: p.slug,
          imageKey: p.imageKey,
          minPrice: p.minVariantPrice,
          fallbackPrice: p.price,
          badge: p.badge,
        }))}
      />
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-2">
        {eyebrow}
      </p>
      <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-white">
        {title}
      </h2>
    </div>
  );
}
