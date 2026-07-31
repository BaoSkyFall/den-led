"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronLeft,
  Phone,
  Check,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import ProductSectionsRenderer from "@/features/product-sections/ProductSectionsRenderer";
import type { ProductSection } from "@/features/product-sections/types";
import RecommendedSection from "@/features/product-recs/RecommendedSection";
import RecentlyViewedSection from "@/features/product-recs/RecentlyViewedSection";
import { useRecentlyViewed } from "@/features/product-recs/useRecentlyViewed";

// ─── Types ────────────────────────────────────────────────────────────────────

type VariantOption = {
  id: string;
  name: string;
  price: string;
  features: string[];
  images: string[];
  displayOrder: number;
  selectionMode: "select" | "quantity";
};

type VariantGroup = {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  options: VariantOption[];
};

type GalleryItem = {
  mediaId: string;
  key: string;
  alt: string;
  priority: number | null;
};

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  badge: string | null;
  price: string;
  imageKey: string | null;
  variantGroups: VariantGroup[];
  gallery: GalleryItem[];
  sections: ProductSection[];
};

// ─── Bi Cầu LED Loader ────────────────────────────────────────────────────────

function BiCauLoader() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-10 overflow-hidden">
      <style>{`
        @keyframes bcOuterSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes bcInnerSpin {
          to { transform: rotate(-360deg); }
        }
        @keyframes bcDrlGlow {
          0%,100% {
            box-shadow: 0 0 6px 2px rgba(251,191,36,0.5),
                        0 0 14px 4px rgba(251,191,36,0.2),
                        inset 0 0 6px rgba(251,191,36,0.15);
          }
          50% {
            box-shadow: 0 0 12px 4px rgba(251,191,36,0.9),
                        0 0 28px 10px rgba(251,191,36,0.4),
                        inset 0 0 12px rgba(251,191,36,0.3);
          }
        }
        @keyframes bcLogoPulse {
          0%,100% {
            filter: drop-shadow(0 0 6px rgba(251,191,36,0.55))
                    drop-shadow(0 0 18px rgba(251,191,36,0.35));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(251,191,36,0.85))
                    drop-shadow(0 0 32px rgba(251,191,36,0.55));
            transform: scale(1.06);
          }
        }
        @keyframes bcBeam {
          0%,100% { opacity: 0.08; }
          50% { opacity: 0.18; }
        }
        @keyframes bcAmbient {
          0%,100% { opacity: 0.12; }
          50% { opacity: 0.22; }
        }
        @keyframes bcChip {
          0%,100% { opacity:1; box-shadow: 0 0 3px 2px rgba(255,255,255,0.9); }
          50% { opacity:0.6; box-shadow: 0 0 5px 3px rgba(255,255,255,0.5); }
        }
        @keyframes bcTextBlink {
          0%,100% { opacity:1; }
          50% { opacity:0.4; }
        }
      `}</style>

      <div className="relative flex items-center justify-center">
        {/* ── Ambient background glow ── */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 220,
            height: 220,
            background:
              "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)",
            animation: "bcAmbient 2s ease-in-out infinite",
          }}
        />

        {/* ── Light beam projected forward ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            width: 0,
            height: 0,
            borderLeft: "60px solid transparent",
            borderRight: "60px solid transparent",
            borderTop: "130px solid rgba(251,191,36,0.07)",
            transform: "translateX(-50%)",
            filter: "blur(10px)",
            animation: "bcBeam 2.5s ease-in-out infinite",
          }}
        />

        {/* ── Bi cầu assembly (110 × 110) ── */}
        <div className="relative" style={{ width: 110, height: 110 }}>
          {/* Outer dashed housing — slow CW */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px dashed rgba(251,191,36,0.25)",
              animation: "bcOuterSpin 10s linear infinite",
            }}
          />

          {/* Segmented arc ring — medium CW */}
          <div
            className="absolute inset-1 rounded-full"
            style={{ animation: "bcOuterSpin 5s linear infinite" }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ transform: "rotate(-90deg)" }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke={
                    i % 2 === 0
                      ? "rgba(251,191,36,0.55)"
                      : "rgba(255,255,255,0.06)"
                  }
                  strokeWidth="3"
                  strokeDasharray="24 12"
                  strokeDashoffset={-(i * 18)}
                />
              ))}
            </svg>
          </div>

          {/* Counter-rotating tick ring */}
          <div
            className="absolute inset-5 rounded-full"
            style={{ animation: "bcInnerSpin 4s linear infinite" }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
                strokeDasharray="6 18"
              />
            </svg>
          </div>

          {/* DRL angel-eye — amber pulse (kept as halo behind logo) */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 18,
              border: "2px solid rgba(251,191,36,0.8)",
              animation: "bcDrlGlow 1.6s ease-in-out infinite",
            }}
          />

          {/* Logo — centre pulse */}
          <div
            className="absolute"
            style={{
              inset: 22,
              animation: "bcLogoPulse 2s ease-in-out infinite",
            }}
          >
            <Image
              src="/logo.png"
              alt="Sân Chơi Đèn Led"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="flex flex-col items-center gap-2 z-10">
        <p
          className="text-[9px] font-black tracking-[0.3em] uppercase text-amber-500"
          style={{ animation: "bcTextBlink 2s ease-in-out infinite" }}
        >
          Sân Chơi Đèn Led
        </p>
        <div className="flex items-center gap-1.5">
          {[0, 0.15, 0.3].map((delay) => (
            <div
              key={delay}
              className="w-1 h-1 rounded-full bg-white/30"
              style={{
                animation: `bcChip 1.2s ease-in-out infinite ${delay}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  // The thumbnails live on one scrolling row, so the arrows on the main image
  // can move the selection off-screen. Pull the new one back into view.
  //
  // Scrolls the strip itself rather than calling `scrollIntoView`, which walks
  // every scrollable ancestor including the document and would jerk the whole
  // page vertically when the gallery mounts below the fold.
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[active] as HTMLElement | undefined;
    if (!strip || !thumb) return;

    const stripBox = strip.getBoundingClientRect();
    const thumbBox = thumb.getBoundingClientRect();
    const offset =
      thumbBox.left - stripBox.left - (stripBox.width - thumbBox.width) / 2;

    strip.scrollTo({ left: strip.scrollLeft + offset, behavior: "smooth" });
  }, [active]);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] border border-dashed border-white/10 flex items-center justify-center text-xs text-white/30 uppercase tracking-widest">
        Chưa có ảnh sản phẩm
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-[4/3] bg-[#0a0a0a] overflow-hidden">
        <Image
          src={images[active]}
          alt="Product"
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/30 to-transparent pointer-events-none" />
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setActive((p) => (p - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 hover:bg-amber-500 hover:text-black transition-colors"
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActive((p) => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 hover:bg-amber-500 hover:text-black transition-colors"
              aria-label="Ảnh tiếp"
            >
              <ChevronRight size={16} />
            </button>
            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold tracking-widest px-2 py-1">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip — always a single row that scrolls sideways, so a
          product with many photos never pushes the page content down. */}
      {images.length > 1 && (
        <div
          ref={stripRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:thin]"
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative shrink-0 snap-start w-16 sm:w-20 aspect-square overflow-hidden border-2 transition-colors ${
                active === i
                  ? "border-amber-500"
                  : "border-white/10 hover:border-white/40"
              }`}
              aria-label={`Ảnh ${i + 1}`}
            >
              <Image
                src={img}
                alt=""
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Variant Selector ─────────────────────────────────────────────────────────

const QTY_MAX = 10;

function VariantSelector({ groups }: { groups: VariantGroup[] }) {
  // Per-option quantity map. 0 / absent = chưa chọn.
  // select-mode option: 0 ↔ 1. quantity-mode option: 0..QTY_MAX.
  const [qtys, setQtys] = useState<Record<string, number>>({});

  // Accordion open state — first group open, the rest collapsed. Non-mutex.
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g, i) => [g.id, i === 0])),
  );

  const toggleGroup = (id: string) =>
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const allOpen = groups.length > 0 && groups.every((g) => open[g.id]);
  const setAll = (val: boolean) =>
    setOpen(Object.fromEntries(groups.map((g) => [g.id, val])));

  const optionById = useMemo(() => {
    const m = new Map<string, VariantOption>();
    for (const g of groups) for (const o of g.options) m.set(o.id, o);
    return m;
  }, [groups]);

  const totalPrice = Object.entries(qtys).reduce((sum, [id, q]) => {
    const opt = optionById.get(id);
    return opt ? sum + Number(opt.price) * q : sum;
  }, 0);
  const hasSelection = Object.values(qtys).some((q) => q > 0);

  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  const setQty = (id: string, next: number) =>
    setQtys((prev) => {
      const clamped = Math.max(0, Math.min(QTY_MAX, next));
      if (clamped === 0) {
        const { [id]: _drop, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: clamped };
    });

  const toggleSelect = (id: string) => setQty(id, (qtys[id] ?? 0) > 0 ? 0 : 1);

  return (
    <div className="space-y-4">
      {/* Global expand/collapse toggle */}
      {groups.length > 1 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setAll(!allOpen)}
            className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40 hover:text-amber-500 transition-colors"
          >
            {allOpen ? "Thu gọn tất cả" : "Mở tất cả"}
          </button>
        </div>
      )}

      {groups.map((group) => {
        const isOpen = open[group.id] ?? false;
        const prices = group.options.map((o) => Number(o.price));
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;
        const selectedCount = group.options.filter(
          (o) => (qtys[o.id] ?? 0) > 0,
        ).length;

        return (
          <div
            key={group.id}
            className="border border-white/[0.08] overflow-hidden"
          >
            {/* Header — click to expand/collapse */}
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-white/[0.03] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black uppercase tracking-wide text-white">
                    {group.name}
                  </h3>
                  <span className="text-[9px] text-white/30 uppercase tracking-widest">
                    {group.options.length} gói
                  </span>
                  {!isOpen && selectedCount > 0 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-black px-1.5 py-0.5">
                      {selectedCount} đã chọn
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-500/80 font-bold mt-0.5">
                  {minPrice === maxPrice
                    ? formatVND(minPrice)
                    : `${formatVND(minPrice)} – ${formatVND(maxPrice)}`}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`shrink-0 text-white/40 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-1 pb-1">
                {group.description && (
                  <p className="text-[11px] text-white/40 px-2 pt-1 pb-2">
                    {group.description}
                  </p>
                )}

                {/* Dense row list */}
                <div className="divide-y divide-white/[0.06]">
                  {group.options.map((opt) => {
                    const q = qtys[opt.id] ?? 0;
                    const selected = q > 0;
                    const isQuantity = opt.selectionMode === "quantity";
                    const rowClass = `group flex items-center gap-3 px-2 py-2 min-h-[44px] transition-colors ${
                      selected ? "bg-amber-500/10" : "hover:bg-white/[0.03]"
                    }`;

                    const body = (
                      <>
                        {/* Left control column — checkbox (select) or a spacer of the
                      same width (quantity) so every option name lines up. */}
                        {isQuantity ? (
                          <span className="w-4 shrink-0" aria-hidden />
                        ) : (
                          <span
                            className={`w-4 h-4 shrink-0 border flex items-center justify-center ${
                              selected
                                ? "border-amber-500 bg-amber-500"
                                : "border-white/30"
                            }`}
                          >
                            {selected && (
                              <Check
                                size={10}
                                strokeWidth={3}
                                className="text-black"
                              />
                            )}
                          </span>
                        )}

                        {/* Name + features */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate">
                            {opt.name}
                          </p>
                          {opt.features.length > 0 && (
                            <p
                              className={`text-[10px] text-white/40 leading-snug mt-0.5 truncate ${
                                selected
                                  ? "block"
                                  : "hidden md:group-hover:block"
                              }`}
                            >
                              {opt.features.slice(0, 3).join(" · ")}
                            </p>
                          )}
                        </div>

                        {/* Right: stepper (quantity mode) sits next to the price */}
                        <div className="flex items-center gap-3 shrink-0">
                          {isQuantity && (
                            <div
                              className="flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                aria-label="Giảm"
                                onClick={() => setQty(opt.id, q - 1)}
                                disabled={q === 0}
                                className="w-6 h-6 flex items-center justify-center border border-white/20 text-white disabled:opacity-30 hover:border-amber-500 hover:text-amber-500 transition-colors"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-white tabular-nums">
                                {q}
                              </span>
                              <button
                                type="button"
                                aria-label="Tăng"
                                onClick={() => setQty(opt.id, q + 1)}
                                disabled={q >= QTY_MAX}
                                className="w-6 h-6 flex items-center justify-center border border-white/20 text-white disabled:opacity-30 hover:border-amber-500 hover:text-amber-500 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          )}
                          <p className="text-xs font-black text-amber-500 whitespace-nowrap">
                            {formatVND(Number(opt.price))}
                          </p>
                        </div>
                      </>
                    );

                    // quantity-mode rows contain nested buttons → must be a <div>;
                    // select-mode rows are a single toggle → <button> for a11y.
                    return isQuantity ? (
                      <div key={opt.id} className={rowClass}>
                        {body}
                      </div>
                    ) : (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleSelect(opt.id)}
                        className={`w-full text-left ${rowClass}`}
                      >
                        {body}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Price summary */}
      <div className="border-t border-white/10 pt-6">
        {hasSelection ? (
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Tổng cộng
            </span>
            <span className="text-2xl font-black text-white">
              {formatVND(totalPrice)}
            </span>
          </div>
        ) : (
          <p className="text-xs text-white/30 mb-4">
            Chọn ít nhất 1 gói dịch vụ để xem giá
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <a
          href="https://zalo.me/0949955644"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase py-4 text-center hover:bg-amber-400 transition-colors"
        >
          Liên hệ
        </a>
        <a
          href="tel:+84949955644"
          className="border border-white/20 text-white text-xs font-bold tracking-[0.2em] uppercase px-5 py-4 hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2"
        >
          <Phone size={12} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = { params: { slug: string } };

export default function ProductDetailPage({ params }: Props) {
  const [product, setProduct] = useState<ProductDetail | null | undefined>(
    undefined,
  );
  const { track } = useRecentlyViewed();

  useEffect(() => {
    async function fetchProduct() {
      // `no-store`: an admin edit must show up on the next visit, not after
      // the browser disk cache happens to expire.
      const res = await fetch(`/api/products/${params.slug}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setProduct(null);
        return;
      }
      const data = (await res.json()) as ProductDetail;
      setProduct(data);
      // Record this visit for the Recently-Viewed section
      const minPrice = data.variantGroups
        .flatMap((g) => g.options.map((o) => Number(o.price)))
        .reduce<number | null>((m, p) => (m === null || p < m ? p : m), null);
      track({
        slug: data.slug,
        name: data.name,
        imageKey: data.imageKey,
        minVariantPrice: minPrice !== null ? String(minPrice) : null,
        badge: data.badge,
      });
    }
    fetchProduct();
    // Only re-run when slug changes; `track` is stable via useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  if (product === undefined) {
    return <BiCauLoader />;
  }

  if (product === null) {
    return notFound();
  }

  const resolveKey = (k: string): string => {
    if (k.startsWith("http") || k.startsWith("/")) return k;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${k}`;
  };

  const gallery: string[] = (product.gallery ?? []).map((g) =>
    resolveKey(g.key),
  );

  // "Từ ..." price = the single cheapest variant option across ALL groups
  // (same logic as the home + shop list pages via /api/products/list). The
  // old "sum of cheapest-per-group" logic double-counted groups the customer
  // may not even select, giving an inflated starting price.
  const minTotal = product.variantGroups
    .flatMap((g) => g.options.map((o) => Number(o.price)))
    .reduce<number>((m, p) => (m === 0 || p < m ? p : m), 0);

  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-24 lg:pt-32 pb-16 lg:pb-24 text-white">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-10">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
        >
          Home
        </Link>
        <ChevronRight size={10} className="text-white/20" />
        <Link
          href="/shop"
          className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
        >
          Garage
        </Link>
        <ChevronRight size={10} className="text-white/20" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500">
          {product.name}
        </span>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-20 items-start">
        {/* LEFT — Gallery */}
        <ImageGallery images={gallery} />

        {/* RIGHT — Info + Variants */}
        <div className="lg:pt-2 min-w-0">
          {/* Badge */}
          {product.badge && (
            <span className="inline-block text-[9px] font-bold tracking-[0.25em] uppercase bg-amber-500 text-black px-3 py-1 mb-4">
              {product.badge === "new_product"
                ? "NEW"
                : product.badge === "best_sale"
                  ? "BEST SALE"
                  : "FEATURED"}
            </span>
          )}

          {/* Name */}
          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white mb-3">
            {product.name}
          </h1>

          {/* Min price */}
          {minTotal > 0 ? (
            <p className="text-lg font-bold text-white/60 mb-8">
              Từ{" "}
              <span className="text-amber-500 font-black">
                {formatVND(minTotal)}
              </span>
            </p>
          ) : (
            <p className="text-lg font-bold text-white/60 mb-8">
              Liên hệ để báo giá
            </p>
          )}

          <div className="w-12 h-px bg-amber-500 mb-8" />

          {/* Variants */}
          {product.variantGroups.length > 0 ? (
            <VariantSelector groups={product.variantGroups} />
          ) : (
            <a
              href="tel:+84949955644"
              className="inline-flex items-center gap-2 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 hover:bg-amber-400 transition-colors"
            >
              <Phone size={14} strokeWidth={2} />
              Liên hệ ngay
            </a>
          )}
        </div>
      </div>

      {/* Blog-style multi-section product description */}
      {product.sections && product.sections.length > 0 && (
        <div className="mt-16 lg:mt-24 border-t border-white/10 pt-10 lg:pt-16">
          <ProductSectionsRenderer
            sections={product.sections}
            mediaLookup={(mediaId) => {
              const g = product.gallery.find((x) => x.mediaId === mediaId);
              return g ? { key: g.key, alt: g.alt } : null;
            }}
          />
        </div>
      )}

      {/* Recommendation — same brand first, top up with newest others */}
      <RecommendedSection excludeSlug={product.slug} limit={6} />

      {/* Recently viewed — from browser localStorage */}
      <RecentlyViewedSection excludeSlug={product.slug} limit={6} />

      {/* Back link */}
      <div className="mt-12">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-amber-500 transition-colors"
        >
          <ChevronLeft size={12} />
          Quay lại danh sách xe
        </Link>
      </div>
    </main>
  );
}
