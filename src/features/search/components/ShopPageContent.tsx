"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Search, SlidersHorizontal } from "lucide-react";

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

function badgeLabel(badge: string | null): string | null {
  if (!badge) return null;
  if (badge === "new_product") return "MỚI";
  if (badge === "best_sale") return "BÁN CHẠY";
  if (badge === "featured") return "NỔI BẬT";
  return badge.toUpperCase();
}

function resolveImageSrc(key: string | null): string {
  if (!key) return "/catalog.pdf/1.jpg";
  if (key.startsWith("http") || key.startsWith("/")) return key;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/products/${key}`;
}

function ProductCard({ product }: { product: Product }) {
  const displayPrice = product.minVariantPrice
    ? `Từ ${formatVND(Number(product.minVariantPrice))}`
    : "Liên hệ";

  const badge = badgeLabel(product.badge);
  const image = resolveImageSrc(product.imageKey);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group relative block bg-white/5 overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111111]/80" />

        {badge && (
          <span className="absolute top-4 left-4 bg-amber-500 text-black text-[9px] font-black tracking-[0.2em] uppercase px-2.5 py-1">
            {badge}
          </span>
        )}

        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 px-2 py-1">
          <span className="text-[10px] font-bold text-amber-500">★</span>
          <span className="text-[10px] font-bold text-white tracking-wider">
            {product.rating}
          </span>
        </div>
      </div>

      <div className="p-5 border-t border-white/5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-black uppercase tracking-tighter text-white group-hover:text-amber-500 transition-colors leading-tight">
            {product.name}
          </h3>
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-white/5">
          <div>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30 mb-0.5">
              Giá
            </p>
            <p className="text-sm font-black text-amber-500">{displayPrice}</p>
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 group-hover:text-amber-500 transition-colors flex items-center gap-1">
            Xem
            <ChevronRight
              size={12}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white/5 overflow-hidden">
      <div className="aspect-[16/10] bg-white/5 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-white/10 animate-pulse" />
        <div className="h-3 bg-white/5 animate-pulse w-3/4" />
        <div className="h-4 bg-white/10 animate-pulse w-1/2" />
      </div>
    </div>
  );
}

type Props = { models: NavModel[] };

function ShopPageContent({ models }: Props) {
  const [products, setProducts] = useState<Product[] | null>(null);
  // `null` = "Tất Cả"; otherwise the selected model slug.
  const [filter, setFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/products/list")
      .then((r) => r.json())
      .then((data) => setProducts(data as Product[]))
      .catch(() => setProducts([]));
  }, []);

  const filtered = useMemo(() => {
    if (!products) return null;
    let out = products;
    if (filter) {
      out = out.filter((p) => p.modelSlug === filter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((p) => p.name.toLowerCase().includes(q));
    }
    return out;
  }, [products, filter, query]);

  return (
    <>
      {/* Hero banner */}
      <section className="relative bg-[#0a0a0a] pt-32 pb-16 border-b border-white/5 overflow-hidden">
        <span className="absolute -bottom-8 -right-4 lg:right-16 text-[240px] lg:text-[360px] font-black text-white/[0.02] leading-none pointer-events-none select-none">
          02
        </span>

        <div className="max-w-[1400px] mx-auto px-6 relative">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/"
              className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
            >
              Home
            </Link>
            <ChevronRight size={10} className="text-white/20" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500">
              Garage
            </span>
          </div>

          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">
            Danh Sách Sản Phẩm
          </p>
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white mb-4">
            Garage
          </h1>
          <p className="text-sm text-white/50 max-w-lg leading-relaxed">
            Chọn dòng xe của bạn để xem các gói độ bi cầu, đèn LED cao cấp với
            linh kiện chính hãng.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-24 z-40 bg-[#111111]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
              <SlidersHorizontal
                size={14}
                strokeWidth={1.5}
                className="text-white/30 shrink-0 mr-2 hidden lg:block"
              />
              <button
                onClick={() => setFilter(null)}
                className={`text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-2 whitespace-nowrap transition-colors ${
                  filter === null
                    ? "bg-amber-500 text-black"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {ALL_LABEL}
              </button>
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFilter(m.slug)}
                  className={`text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-2 whitespace-nowrap transition-colors ${
                    filter === m.slug
                      ? "bg-amber-500 text-black"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72 shrink-0">
              <Search
                size={14}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full bg-white/5 border border-white/10 text-white text-xs px-9 py-2.5 outline-none placeholder:text-white/25 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="bg-[#111111] py-16 min-h-[600px]">
        <div className="max-w-[1400px] mx-auto px-6">
          {filtered === null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">
                Không tìm thấy
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-3">
                Không có sản phẩm
              </h2>
              <p className="text-sm text-white/40 max-w-sm mx-auto mb-8">
                Không tìm thấy sản phẩm phù hợp với bộ lọc. Thử chọn dòng xe
                khác hoặc xoá bộ lọc.
              </p>
              <button
                onClick={() => {
                  setFilter(null);
                  setQuery("");
                }}
                className="bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-6 py-3 hover:bg-amber-400 transition-colors"
              >
                Xoá Bộ Lọc
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                  {filtered.length} sản phẩm
                </p>
                {filter !== null && (
                  <button
                    onClick={() => setFilter(null)}
                    className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Xoá lọc ×
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default ShopPageContent;
