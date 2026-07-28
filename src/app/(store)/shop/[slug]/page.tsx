"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft, Phone, Check, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type VariantOption = {
  id: string;
  name: string;
  price: string;
  features: string[];
  images: string[];
  displayOrder: number;
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
  description: string | null;
  badge: string | null;
  price: string;
  imageKey: string | null;
  variantGroups: VariantGroup[];
  gallery: GalleryItem[];
};

// ─── Static product data map (extends DB data with local images) ───────────────

const PRODUCT_IMAGES: Record<
  string,
  { hero: string; gallery: string[]; catalog: string }
> = {
  "sh-2026": {
    hero: "/assets/den-led/SH/SH 2026/DSC08596.jpg",
    gallery: [
      "/assets/den-led/SH/SH 2026/DSC01116.jpg",
      "/assets/den-led/SH/SH 2026/DSC08596.jpg",
    ],
    catalog: "/catalog.pdf/1.jpg",
  },
  "air-blade-2026": {
    hero: "/assets/den-led/AB/AB2026/DSC07552.jpg",
    gallery: [
      "/assets/den-led/AB/AB2026/DSC07552.jpg",
      "/assets/den-led/AB/AB2026/DSC06405.jpg",
    ],
    catalog: "/catalog.pdf/12.jpg",
  },
  "vario-2026": {
    hero: "/assets/den-led/Vario/Vario 2026/DSC06430.jpg",
    gallery: ["/assets/den-led/Vario/Vario 2026/DSC06430.jpg"],
    catalog: "/catalog.pdf/7.jpg",
  },
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
        @keyframes bcCorePulse {
          0%,100% {
            box-shadow: 0 0 14px 6px #fff,
                        0 0 30px 14px rgba(251,191,36,0.7),
                        0 0 60px 30px rgba(251,191,36,0.25);
            transform: translate(-50%,-50%) scale(1);
          }
          50% {
            box-shadow: 0 0 22px 10px #fff,
                        0 0 50px 24px rgba(251,191,36,0.9),
                        0 0 90px 50px rgba(251,191,36,0.35);
            transform: translate(-50%,-50%) scale(1.12);
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

          {/* Shroud */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 8,
              background:
                "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.7) 100%)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          />

          {/* DRL angel-eye — amber pulse */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 22,
              border: "2px solid rgba(251,191,36,0.8)",
              animation: "bcDrlGlow 1.6s ease-in-out infinite",
            }}
          />

          {/* Projector glass */}
          <div
            className="absolute rounded-full"
            style={{
              inset: 27,
              background:
                "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.07) 0%, rgba(10,10,10,0.9) 100%)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          />

          {/* LED chip cluster — 3 dots */}
          {[
            { top: "38%", left: "50%" },
            { top: "63%", left: "35%" },
            { top: "63%", left: "65%" },
          ].map(({ top, left }, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: 3,
                height: 3,
                top,
                left,
                transform: "translate(-50%,-50%)",
                animation: `bcChip 1.6s ease-in-out infinite ${i * 0.18}s`,
              }}
            />
          ))}

          {/* Core LED — centre pulse */}
          <div
            className="absolute bg-white rounded-full"
            style={{
              width: 12,
              height: 12,
              top: "50%",
              left: "50%",
              animation: "bcCorePulse 2s ease-in-out infinite",
            }}
          />
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

function ImageGallery({
  images,
  catalog,
}: {
  images: string[];
  catalog: string;
}) {
  const [active, setActive] = useState(0);
  const allImages = [...images, catalog];

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-[4/3] bg-[#0a0a0a] overflow-hidden">
        <Image
          src={allImages[active] ?? "/catalog.pdf/1.jpg"}
          alt="Product"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/30 to-transparent" />
        {/* Nav arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() =>
                setActive((p) => (p - 1 + allImages.length) % allImages.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 hover:bg-amber-500 hover:text-black transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActive((p) => (p + 1) % allImages.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 hover:bg-amber-500 hover:text-black transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-20 h-16 shrink-0 overflow-hidden border-2 transition-colors ${
                active === i
                  ? "border-amber-500"
                  : "border-white/10 hover:border-white/40"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Variant Selector ─────────────────────────────────────────────────────────

function VariantSelector({ groups }: { groups: VariantGroup[] }) {
  // Nothing pre-selected — customer chọn 1 hoặc nhiều tùy ý
  const [selections, setSelections] = useState<
    Record<string, VariantOption | null>
  >(Object.fromEntries(groups.map((g) => [g.id, null])));

  const selectedOptions = Object.values(selections).filter(
    Boolean,
  ) as VariantOption[];
  const totalPrice = selectedOptions.reduce(
    (sum, opt) => sum + Number(opt.price),
    0,
  );
  const hasSelection = selectedOptions.length > 0;

  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  function toggleOption(groupId: string, opt: VariantOption) {
    setSelections((prev) => ({
      ...prev,
      // Click lại option đang chọn → bỏ chọn
      [groupId]: prev[groupId]?.id === opt.id ? null : opt,
    }));
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500">
              {group.name}
            </p>
            <span className="text-[9px] text-white/30 uppercase tracking-widest">
              — tùy chọn
            </span>
          </div>
          {group.description && (
            <p className="text-xs text-white/40 mb-3">{group.description}</p>
          )}
          <div className="space-y-2">
            {group.options.map((opt) => {
              const isSelected = selections[group.id]?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleOption(group.id, opt)}
                  className={`w-full text-left p-3 sm:p-4 border transition-all duration-200 ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`mt-0.5 w-4 h-4 shrink-0 border flex items-center justify-center ${
                          isSelected
                            ? "border-amber-500 bg-amber-500"
                            : "border-white/30"
                        }`}
                      >
                        {isSelected && (
                          <Check
                            size={10}
                            strokeWidth={3}
                            className="text-black"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold uppercase tracking-wide text-white break-words">
                          {opt.name}
                        </p>
                        {opt.features.length > 0 && (
                          <p className="text-[11px] text-white/40 mt-1 leading-relaxed break-words">
                            {opt.features.slice(0, 3).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-amber-500 shrink-0 whitespace-nowrap">
                      {formatVND(Number(opt.price))}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

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

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/products/${params.slug}`);
      if (!res.ok) {
        setProduct(null);
        return;
      }
      const data = await res.json();
      setProduct(data);
    }
    fetchProduct();
  }, [params.slug]);

  if (product === undefined) {
    return <BiCauLoader />;
  }

  if (product === null) {
    return notFound();
  }

  const resolveKey = (k: string | null | undefined): string => {
    if (!k) return "/catalog.pdf/1.jpg";
    if (k.startsWith("http") || k.startsWith("/")) return k;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${k}`;
  };

  const seededImages = PRODUCT_IMAGES[params.slug];
  // Priority: DB gallery > seeded static > featured image
  const gallery: string[] =
    product.gallery && product.gallery.length > 0
      ? product.gallery.map((g) => resolveKey(g.key))
      : seededImages?.gallery ?? [resolveKey(product.imageKey)];
  const catalog = seededImages?.catalog ?? "/catalog.pdf/1.jpg";

  const minTotal = product.variantGroups.reduce((sum, g) => {
    const cheapest = g.options.reduce(
      (min, o) => (Number(o.price) < Number(min.price) ? o : min),
      g.options[0],
    );
    return sum + (cheapest ? Number(cheapest.price) : 0);
  }, 0);

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
        <ImageGallery images={gallery} catalog={catalog} />

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
          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white mb-3 leading-[0.95]">
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

      {/* Description section */}
      {product.description && (
        <div className="mt-16 lg:mt-24 border-t border-white/10 pt-10 lg:pt-16">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-4">
            Mô tả sản phẩm
          </p>
          <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-white mb-6">
            {product.name}
          </h2>
          <div
            className="text-white/60 leading-relaxed max-w-2xl text-sm prose-invert [&_h2]:text-white [&_h3]:text-white/80 [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-amber-500 [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {/* Catalog reference section */}
      <div className="mt-16 border border-white/10 p-6">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-4">
          Tham khảo catalog
        </p>
        <div className="relative aspect-[16/7] overflow-hidden">
          <Image
            src={catalog}
            alt={`${product.name} catalog`}
            fill
            className="object-cover object-top"
          />
        </div>
      </div>

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
