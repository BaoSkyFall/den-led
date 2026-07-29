"use client";

import { useEffect, useState } from "react";
import ProductRecCard from "./ProductRecCard";
import type { MiniProduct } from "./types";

type Props = {
  family: string | null;
  excludeSlug: string;
  limit?: number;
  title?: string;
  eyebrow?: string;
};

export default function RecommendedSection({
  family,
  excludeSlug,
  limit = 4,
  title = "Sản Phẩm Đề Xuất",
  eyebrow = "Có Thể Anh Cũng Thích",
}: Props) {
  const [items, setItems] = useState<MiniProduct[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (family) params.set("family", family);
    if (excludeSlug) params.set("exclude", excludeSlug);
    params.set("limit", String(limit));
    fetch(`/api/products/recommended?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, [family, excludeSlug, limit]);

  if (items === null) {
    return (
      <section className="mt-12 lg:mt-16 border-t border-white/10 pt-8">
        <div className="mb-6">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-2">
            {eyebrow}
          </p>
          <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-white">
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[16/10] bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mt-12 lg:mt-16 border-t border-white/10 pt-8">
      <div className="mb-6">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-2">
          {eyebrow}
        </p>
        <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-white">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((p) => (
          <ProductRecCard
            key={p.id}
            name={p.name}
            slug={p.slug}
            imageKey={p.imageKey}
            minPrice={p.minVariantPrice}
            fallbackPrice={p.price}
            badge={p.badge}
          />
        ))}
      </div>
    </section>
  );
}
