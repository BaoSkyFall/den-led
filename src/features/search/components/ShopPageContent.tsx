"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import type { ShopPage, ShopProduct } from "@/features/search/queries";
import type { NavGroup } from "@/features/vehicle-taxonomy";

const ALL_LABEL = "Tất Cả";

/** How long to wait after the last keystroke before putting `q` in the URL. */
const SEARCH_DEBOUNCE_MS = 350;

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

/**
 * Build a /shop URL. Empty values are dropped rather than written as `=`, so
 * the unfiltered first page is plain `/shop` and not `/shop?brand=&page=1`.
 */
export function shopHref({
  group,
  q,
  page,
}: {
  group?: string | null;
  q?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (group) params.set("group", group);
  if (q) params.set("q", q);
  if (page && page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/shop?${search}` : "/shop";
}

/**
 * Page numbers to render: all of them while there are few, otherwise the ends
 * plus a window around the current page, with `null` standing for an ellipsis.
 */
export function pageItems(
  current: number,
  pageCount: number,
): (number | null)[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const out: (number | null)[] = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(pageCount - 1, current + 1);
  if (from > 2) out.push(null);
  for (let p = from; p <= to; p++) out.push(p);
  if (to < pageCount - 1) out.push(null);
  out.push(pageCount);
  return out;
}

function ProductCard({ product }: { product: ShopProduct }) {
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

type Props = {
  groups: NavGroup[];
  result: ShopPage;
  activeGroup: string | null;
  query: string;
};

function ShopPageContent({ groups, result, activeGroup, query }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // The input is local so typing stays responsive; the URL catches up on a
  // debounce. Re-seeded from the prop so Back/Forward and "Xoá Bộ Lọc" put the
  // box back in step with the results being shown.
  const [term, setTerm] = useState(query);
  useEffect(() => setTerm(query), [query]);

  // Skips the very first run, otherwise mounting on /shop?q=abc would
  // immediately push the same URL again.
  const typed = useRef(false);
  useEffect(() => {
    if (!typed.current) return;
    const id = setTimeout(() => {
      // Any change of search term restarts at page one — page 3 of the old
      // result set means nothing for the new one.
      router.replace(shopHref({ group: activeGroup, q: term.trim() }), {
        scroll: false,
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [term, activeGroup, router, pathname]);

  const { products, total, page, pageCount } = result;
  const hasFilter = activeGroup !== null || query !== "";

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
            Chọn hãng xe của bạn để xem các gói độ bi cầu, đèn LED cao cấp với
            linh kiện chính hãng.
          </p>
        </div>
      </section>

      {/* Filter bar. Chips are links, not buttons: a filtered page has its own
          URL now, so it can be shared, bookmarked and crawled. */}
      <section className="sticky top-24 z-40 bg-[#111111]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
              <SlidersHorizontal
                size={14}
                strokeWidth={1.5}
                className="text-white/30 shrink-0 mr-2 hidden lg:block"
              />
              <Link
                href={shopHref({ q: query })}
                scroll={false}
                className={`text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-2 whitespace-nowrap transition-colors ${
                  activeGroup === null
                    ? "bg-amber-500 text-black"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {ALL_LABEL}
              </Link>
              {groups.map((g) => (
                <Link
                  key={g.key}
                  href={shopHref({ group: g.key, q: query })}
                  scroll={false}
                  className={`text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-2 whitespace-nowrap transition-colors ${
                    activeGroup === g.key
                      ? "bg-amber-500 text-black"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {g.label}
                </Link>
              ))}
            </div>

            <div className="relative w-full lg:w-72 shrink-0">
              <Search
                size={14}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={term}
                onChange={(e) => {
                  typed.current = true;
                  setTerm(e.target.value);
                }}
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
          {products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">
                Không tìm thấy
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-3">
                Không có sản phẩm
              </h2>
              <p className="text-sm text-white/40 max-w-sm mx-auto mb-8">
                Không tìm thấy sản phẩm phù hợp với bộ lọc. Thử chọn nhóm khác
                hoặc xoá bộ lọc.
              </p>
              <Link
                href="/shop"
                className="inline-block bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-6 py-3 hover:bg-amber-400 transition-colors"
              >
                Xoá Bộ Lọc
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                  {total} sản phẩm
                  {pageCount > 1 && ` · Trang ${page}/${pageCount}`}
                </p>
                {hasFilter && (
                  <Link
                    href="/shop"
                    scroll={false}
                    className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Xoá lọc ×
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pageCount > 1 && (
                <nav
                  aria-label="Phân trang"
                  className="flex items-center justify-center gap-1 mt-12"
                >
                  <PageLink
                    href={shopHref({
                      group: activeGroup,
                      q: query,
                      page: page - 1,
                    })}
                    disabled={page === 1}
                    label="Trang trước"
                  >
                    <ChevronLeft size={14} strokeWidth={2} />
                  </PageLink>

                  {pageItems(page, pageCount).map((p, i) =>
                    p === null ? (
                      <span
                        key={`gap-${i}`}
                        className="px-2 text-white/25 text-xs select-none"
                      >
                        …
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={shopHref({
                          group: activeGroup,
                          q: query,
                          page: p,
                        })}
                        scroll={false}
                        aria-current={p === page ? "page" : undefined}
                        className={`min-w-9 h-9 flex items-center justify-center text-xs font-bold transition-colors ${
                          p === page
                            ? "bg-amber-500 text-black"
                            : "text-white/50 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {p}
                      </Link>
                    ),
                  )}

                  <PageLink
                    href={shopHref({
                      group: activeGroup,
                      q: query,
                      page: page + 1,
                    })}
                    disabled={page === pageCount}
                    label="Trang sau"
                  >
                    <ChevronRight size={14} strokeWidth={2} />
                  </PageLink>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

/** Prev/next arrow. Rendered as a dead span at the ends so there is no link
    pointing at page 0 or past the last page. */
function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-hidden
        className="w-9 h-9 flex items-center justify-center text-white/15"
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors"
    >
      {children}
    </Link>
  );
}

export default ShopPageContent;
