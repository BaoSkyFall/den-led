"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import BiCauLoader from "@/components/store/BiCauLoader";
import {
  ChevronLeft,
  Phone,
  Check,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Lightbox from "@/features/product-sections/Lightbox";
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

// ─── Image Gallery ────────────────────────────────────────────────────────────

/** How much bigger the photo is drawn inside the loupe. */
const HOVER_ZOOM = 1.25;
/** Side of the square loupe panel, in pixels. */
const LOUPE_SIZE = 260;
/** Clearance between the cursor and the panel. */
const LOUPE_GAP = 24;

/**
 * A magnified window on the region under the cursor, floating beside it.
 *
 * Magnifying the photo in place moved the very detail being inspected out
 * from under the pointer, so the enlargement lives in its own panel and the
 * photo underneath is left alone.
 *
 * Two things keep this cheap, and both matter:
 *
 * The picture is whatever the page already downloaded. The gallery assigns it
 * through the handle below, from the `currentSrc` of the photo on screen —
 * the exact URL next/image chose out of its srcset. Pointing at the original
 * file instead, as this first did, looks identical but makes the browser
 * fetch the same photo a second time at full size.
 *
 * Nothing here is React state. The panel and the picture inside it are moved
 * by writing to their style objects through refs, because the alternative is
 * a state update per mousemove — around a hundred a second, each re-rendering
 * the whole gallery, its thumbnail strip and the lightbox along with it.
 *
 * The crop is reproduced rather than approximated: the same picture is drawn
 * at `HOVER_ZOOM` times the box it occupies on the page, still `object-cover`,
 * then offset so the point under the cursor lands in the middle of the panel.
 * A background-position trick would disagree with the page's own cropping and
 * magnify a slightly different spot than the one being pointed at.
 */
type LoupeHandle = {
  panel: HTMLDivElement | null;
  picture: HTMLImageElement | null;
};

const Loupe = forwardRef<LoupeHandle>(function Loupe(_props, ref) {
  const panel = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLImageElement>(null);

  useImperativeHandle(ref, () => ({
    get panel() {
      return panel.current;
    },
    get picture() {
      return picture.current;
    },
  }));

  return (
    <div
      ref={panel}
      aria-hidden
      className="fixed z-50 overflow-hidden border border-amber-500/60 bg-[#0a0a0a] shadow-2xl pointer-events-none"
      // Mounted once and hidden, rather than mounted on hover: a panel that
      // only ever has its style written cannot cause a React render, and
      // `display` is what the gallery toggles on enter and leave.
      style={{
        display: "none",
        left: 0,
        top: 0,
        width: LOUPE_SIZE,
        height: LOUPE_SIZE,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={picture}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          maxWidth: "none",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
    </div>
  );
});

function ImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [canHover, setCanHover] = useState(false);

  // The photo on the page, the loupe's two elements, and the box the photo
  // occupies. All refs: the loupe is driven by writing styles directly, so
  // moving the pointer must not touch React state.
  const mainImgRef = useRef<HTMLImageElement>(null);
  const loupeRef = useRef<LoupeHandle>(null);
  const boxRef = useRef<DOMRect | null>(null);

  /** Show or hide the panel without re-rendering anything around it. */
  const setLoupeVisible = (visible: boolean) => {
    const panel = loupeRef.current?.panel;
    if (panel) panel.style.display = visible ? "block" : "none";
  };

  // A phone can still emit a stray mousemove after a tap, which would strand
  // the panel on screen. Ask the device instead of trusting the event, and
  // resolve it after mount so the server and the first client render agree.
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(query.matches);
    const onChange = (e: MediaQueryListEvent) => {
      setCanHover(e.matches);
      if (!e.matches) setLoupeVisible(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /**
   * Point the loupe at the photo the browser has already decoded.
   *
   * `currentSrc` is the URL actually chosen from next/image's srcset, so the
   * loupe draws from the file already in memory instead of fetching the same
   * photo a second time. It is empty until the photo loads, hence the fallback
   * — hovering during load would otherwise blank the panel.
   */
  const syncLoupeSource = () => {
    const picture = loupeRef.current?.picture;
    const main = mainImgRef.current;
    if (!picture || !main) return;
    const chosen = main.currentSrc || main.src;
    if (chosen && picture.src !== chosen) picture.src = chosen;
  };

  const openLoupe = (target: HTMLElement) => {
    const picture = loupeRef.current?.picture;
    if (!picture) return;
    syncLoupeSource();

    // Measured once per hover, not per move: reading layout mid-move, right
    // before writing styles, forces a reflow on every frame.
    const box = target.getBoundingClientRect();
    boxRef.current = box;
    picture.style.width = `${box.width * HOVER_ZOOM}px`;
    picture.style.height = `${box.height * HOVER_ZOOM}px`;
  };

  const moveLoupe = (clientX: number, clientY: number) => {
    const panel = loupeRef.current?.panel;
    const picture = loupeRef.current?.picture;
    const box = boxRef.current;
    if (!panel || !picture || !box) return;

    const half = LOUPE_SIZE / 2;

    // Flip to the other side of the cursor rather than run off the screen,
    // and keep the panel inside the viewport vertically.
    const flip = clientX + LOUPE_GAP + LOUPE_SIZE > window.innerWidth;
    panel.style.left = `${flip ? clientX - LOUPE_GAP - LOUPE_SIZE : clientX + LOUPE_GAP}px`;
    panel.style.top = `${Math.min(
      Math.max(8, clientY - half),
      window.innerHeight - LOUPE_SIZE - 8,
    )}px`;

    // Put the point under the cursor in the middle of the panel.
    picture.style.left = `${half - (clientX - box.left) * HOVER_ZOOM}px`;
    picture.style.top = `${half - (clientY - box.top) * HOVER_ZOOM}px`;

    // Showing here as well as on enter is what brings the panel back after a
    // photo switch, which hides it: no mouseenter fires while the pointer is
    // already inside, so it would otherwise stay hidden until you left and
    // came back. Writing the same value costs nothing.
    setLoupeVisible(true);
  };

  // The strip hides its scrollbar, so these arrows are the only thing telling
  // the customer more photos exist — they have to track the real scroll offset
  // rather than just image count. Both true also means "nothing overflows",
  // which correctly hides them.
  const syncEdges = () => {
    const strip = stripRef.current;
    if (!strip) return;
    const max = strip.scrollWidth - strip.clientWidth;
    setAtStart(strip.scrollLeft <= 1);
    setAtEnd(strip.scrollLeft >= max - 1);
  };

  useEffect(() => {
    syncEdges();
    window.addEventListener("resize", syncEdges);
    return () => window.removeEventListener("resize", syncEdges);
    // Re-measured when the photo count changes; `syncEdges` reads refs only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  // The arrows on the main image can move the selection out of the strip's
  // view. Pull the new one back to the middle.
  //
  // Scrolls the strip itself rather than calling `scrollIntoView`, which walks
  // every scrollable ancestor including the document and would jerk the whole
  // page vertically when the gallery mounts below the fold.
  // Switching photo while hovering would leave the loupe reading the old one.
  useEffect(() => setLoupeVisible(false), [active]);

  // Scrolling fires no mousemove, so the panel would hang at a stale spot
  // while the photo slid out from under it. Close it instead.
  useEffect(() => {
    const close = () => setLoupeVisible(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, []);

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

  // Nearly a full strip, so consecutive pages keep one thumbnail of overlap as
  // a visual anchor.
  const page = (direction: -1 | 1) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollBy({
      left: direction * strip.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] border border-dashed border-white/10 flex items-center justify-center text-xs text-white/30 uppercase tracking-widest">
        Chưa có ảnh sản phẩm
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Lightbox
        images={images.map((src, i) => ({ src, alt: `Ảnh ${i + 1}` }))}
        openAt={lightboxAt}
        onClose={() => setLightboxAt(null)}
      />

      <Loupe ref={loupeRef} />

      {/* Main image */}
      <div className="relative aspect-[4/3] bg-[#0a0a0a] overflow-hidden">
        <button
          type="button"
          onClick={() => setLightboxAt(active)}
          aria-label="Phóng to ảnh"
          className="absolute inset-0 z-10 cursor-zoom-in"
          // Feeds the loupe. The photo itself never moves — magnifying it in
          // place pushed the part being examined out from under the cursor,
          // so the magnification goes in a panel beside the pointer instead.
          onMouseEnter={(e) => {
            if (!canHover) return;
            openLoupe(e.currentTarget);
            moveLoupe(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => {
            if (!canHover) return;
            moveLoupe(e.clientX, e.clientY);
          }}
          onMouseLeave={() => setLoupeVisible(false)}
        />
        <Image
          ref={mainImgRef}
          src={images[active]}
          alt="Product"
          fill
          className="object-cover object-center"
          priority
          onLoad={syncLoupeSource}
          // Desktop asks for a wider file than it displays. The loupe reuses
          // this exact download, so the extra pixels are what it magnifies —
          // without them it would either be soft or need its own request.
          // Phones, which never see the loupe, are unaffected.
          sizes="(max-width: 1024px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/30 to-transparent pointer-events-none" />
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setActive((p) => (p - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 text-white p-2 hover:bg-amber-500 hover:text-black transition-colors"
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActive((p) => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 text-white p-2 hover:bg-amber-500 hover:text-black transition-colors"
              aria-label="Ảnh tiếp"
            >
              <ChevronRight size={16} />
            </button>
            <span className="absolute bottom-3 right-3 z-20 bg-black/60 text-white text-[10px] font-bold tracking-widest px-2 py-1">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail slider — always a single row, so a product with many photos
          never pushes the page content down. Scrolls via the arrows below
          rather than a scrollbar: globals.css re-declares ::-webkit-scrollbar
          at 2px after the global `display: none`, so it has to be hidden here
          explicitly on both engines. */}
      {images.length > 1 && (
        <div className="relative">
          <div
            ref={stripRef}
            onScroll={syncEdges}
            className="flex gap-2 overflow-x-auto snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

          {!atStart && (
            <button
              type="button"
              onClick={() => page(-1)}
              aria-label="Xem các ảnh trước đó"
              className="absolute left-0 top-0 h-full pr-6 flex items-center bg-gradient-to-r from-[#111111] via-[#111111]/85 to-transparent text-white hover:text-amber-500 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {!atEnd && (
            <button
              type="button"
              onClick={() => page(1)}
              aria-label="Xem các ảnh tiếp theo"
              className="absolute right-0 top-0 h-full pl-6 flex items-center bg-gradient-to-l from-[#111111] via-[#111111]/85 to-transparent text-white hover:text-amber-500 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          )}
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
