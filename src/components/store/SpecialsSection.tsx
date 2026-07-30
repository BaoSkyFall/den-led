"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { NavModel } from "@/features/vehicle-taxonomy";

type Product = {
  id: string;
  name: string;
  slug: string;
  badge: string | null;
  rating: string;
  price: string;
  imageKey: string | null;
  modelSlug: string | null;
  minVariantPrice: string | null;
};

const ALL_LABEL = "Tất Cả";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

function resolveImageSrc(key: string | null): string {
  if (!key) return "/catalog.pdf/1.jpg";
  if (key.startsWith("http") || key.startsWith("/")) return key;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${key}`;
}

function badgeLabel(badge: string | null): string {
  if (!badge) return "SẢN PHẨM";
  if (badge === "new_product") return "MỚI";
  if (badge === "best_sale") return "BÁN CHẠY";
  if (badge === "featured") return "NỔI BẬT";
  return badge.toUpperCase();
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white/5 overflow-hidden">
      <div className="aspect-[16/9] bg-white/5 animate-pulse" />
      <div className="p-5 flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-white/5 animate-pulse w-1/3" />
          <div className="h-5 bg-white/10 animate-pulse w-3/4" />
        </div>
        <div className="space-y-2 w-24">
          <div className="h-3 bg-white/5 animate-pulse" />
          <div className="h-4 bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

type Props = { models: NavModel[] };

function SpecialsSection({ models }: Props) {
  // `null` = "Tất Cả"; otherwise the selected model slug.
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const chips = [{ key: "all", slug: null, label: ALL_LABEL }].concat(
    models.map((m) => ({ key: m.id, slug: m.slug, label: m.label })),
  );

  useEffect(() => {
    fetch("/api/products/list")
      .then((r) => r.json())
      .then((data) => setProducts(data as Product[]))
      .catch(() => setProducts([]));
  }, []);

  const filtered =
    products === null
      ? null
      : activeFilter === null
        ? products
        : products.filter((p) => p.modelSlug === activeFilter);

  return (
    <section id="specials" className="bg-[#111111] py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-3">
              Dịch Vụ Của Chúng Tôi
            </p>
            <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white">
              Xe Nổi Bật
            </h2>
          </div>

          {/* Chip count is data-driven now (was 4 hardcoded), so this row has
              no upper bound — wrap instead of pushing the page sideways. */}
          <div className="flex items-center flex-wrap gap-y-2">
            {chips.map((c, i) => (
              <div key={c.key} className="flex items-center">
                {i > 0 && <div className="w-px h-4 bg-white/10 mx-4" />}
                <button
                  onClick={() => setActiveFilter(c.slug)}
                  className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
                    activeFilter === c.slug
                      ? "text-amber-500"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        {filtered === null ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-white/5">
            <p className="text-sm text-white/40">
              Chưa có sản phẩm phù hợp với bộ lọc này.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {filtered.map((product) => {
              const price = product.minVariantPrice
                ? `Từ ${formatVND(Number(product.minVariantPrice))}`
                : "Liên hệ";
              const image = resolveImageSrc(product.imageKey);
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group relative block bg-white/5 overflow-hidden"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={image}
                      alt={`${product.name} độ đèn LED bi cầu`}
                      fill
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111111]/80" />
                    <span className="absolute top-4 left-4 bg-amber-500 text-black text-[9px] font-black tracking-[0.15em] uppercase px-2 py-1">
                      {badgeLabel(product.badge)}
                    </span>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-1">
                        Honda
                      </p>
                      <h3 className="text-lg font-black uppercase tracking-tighter text-white truncate">
                        {product.name}
                      </h3>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40 mb-1">
                        Giá
                      </p>
                      <p className="text-amber-500 font-bold text-sm whitespace-nowrap">
                        {price}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-center gap-6 mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase text-white hover:text-amber-500 transition-colors group"
          >
            <ChevronLeft
              size={14}
              strokeWidth={1.5}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Xem Tất Cả Sản Phẩm</span>
            <ChevronRight
              size={14}
              strokeWidth={1.5}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SpecialsSection;
