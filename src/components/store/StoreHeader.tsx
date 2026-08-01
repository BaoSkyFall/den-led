"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, Menu, Phone, X } from "lucide-react";
import type { NavBrand } from "@/features/vehicle-taxonomy";

type Props = { brands: NavBrand[] };

/** Where a column's "Xem thêm" sends the customer. */
const moreHref = (slug: string) => `/shop?brand=${encodeURIComponent(slug)}`;

export default function StoreHeader({ brands }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [desktopHover, setDesktopHover] = useState<string | null>(null);

  // Empty tree (fetch error / empty DB) => plain link, never a broken dropdown.
  const hasMenu = brands.length > 0;

  return (
    <>
      <header className="fixed top-0 w-full z-50 h-24 backdrop-blur-md bg-[#111111]/90 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 shrink-0">
            <Image
              src="/logo.png"
              alt="Sân Chơi Đèn Led"
              width={64}
              height={56}
              priority
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* The horizontal bar keeps its 10px type: it is balanced against the
              logo and the "Gọi Ngay" button, and these three items carry 0.2em
              letter-spacing, so growing them eats real width. Only the dropdown
              below — where a customer actually reads — was scaled up. */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors px-3 py-2"
            >
              Trang Chủ
            </Link>

            {hasMenu ? (
              <div
                className="relative"
                onMouseEnter={() => setDesktopHover("vehicles")}
                onMouseLeave={() => setDesktopHover(null)}
              >
                <Link
                  href="/shop"
                  className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors px-3 py-2"
                >
                  Danh Sách Xe
                  <ChevronDown
                    size={10}
                    strokeWidth={2.5}
                    className={`transition-transform duration-200 ${desktopHover === "vehicles" ? "rotate-180" : ""}`}
                  />
                </Link>

                {desktopHover === "vehicles" && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 z-50 min-w-[520px]">
                    <div className="bg-[#0a0a0a] border border-white/10 p-6">
                      <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">
                        Chọn hãng xe để xem gói độ đèn
                      </p>
                      {/* One column per brand. Columns are capped at five rows
                          each, so the grid can never grow past a screen no
                          matter how much stock is added. */}
                      <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                        {brands.map((b) => (
                          <div key={b.id}>
                            <p className="text-[15px] font-black uppercase tracking-wide text-white mb-2">
                              {b.label}
                            </p>
                            {b.products.map((p) => (
                              <Link
                                key={p.id}
                                href={`/shop/${p.slug}`}
                                className="block text-[13px] text-white/40 hover:text-white transition-colors py-0.5"
                              >
                                {p.name}
                              </Link>
                            ))}
                            {b.hasMore && (
                              <Link
                                href={moreHref(b.slug)}
                                className="mt-1 inline-flex items-center gap-1 text-[13px] font-bold text-amber-500 hover:text-amber-400 transition-colors py-0.5"
                              >
                                Xem thêm
                                <ChevronRight size={12} strokeWidth={2.5} />
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/shop"
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors px-3 py-2"
              >
                Danh Sách Xe
              </Link>
            )}

            <a
              href="/#contact"
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors px-3 py-2"
            >
              Liên Hệ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="tel:+84949955644"
              className="hidden lg:flex items-center gap-2 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-5 py-3 hover:bg-amber-400 transition-colors"
            >
              <Phone size={12} strokeWidth={2} />
              <span>Gọi Ngay</span>
            </a>
            <button
              className="lg:hidden text-white"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between p-8 border-b border-white/5">
            <Image
              src="/logo.png"
              alt="Sân Chơi Đèn Led"
              width={56}
              height={48}
              className="h-12 w-auto object-contain"
            />
            <button className="text-white" onClick={() => setMobileOpen(false)}>
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* Same brand columns as desktop, stacked as accordions. Type is left
              alone here — it was already text-xl, which is not what looked
              small. */}
          <nav className="flex flex-col px-8 py-6 gap-0">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-xl font-black uppercase tracking-tighter text-white hover:text-amber-500 transition-colors py-4 border-b border-white/5"
            >
              Trang Chủ
            </Link>

            {brands.map((b) => (
              <div key={b.id} className="border-b border-white/5">
                <button
                  className="w-full flex items-center justify-between text-left"
                  onClick={() =>
                    setMobileExpanded(mobileExpanded === b.id ? null : b.id)
                  }
                  aria-expanded={mobileExpanded === b.id}
                >
                  <span className="text-xl font-black uppercase tracking-tighter text-white py-4 flex-1">
                    {b.label}
                  </span>
                  <span className="p-4 text-white/40">
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${mobileExpanded === b.id ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>
                {mobileExpanded === b.id && (
                  <div className="pb-3 pl-4 flex flex-col gap-3">
                    {b.products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/shop/${p.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm text-white/50 hover:text-amber-500 transition-colors pl-3"
                      >
                        {p.name}
                      </Link>
                    ))}
                    {b.hasMore && (
                      <Link
                        href={moreHref(b.slug)}
                        onClick={() => setMobileOpen(false)}
                        className="inline-flex items-center gap-1 text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors pl-3"
                      >
                        Xem thêm
                        <ChevronRight size={14} strokeWidth={2.5} />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}

            <a
              href="/#contact"
              onClick={() => setMobileOpen(false)}
              className="text-xl font-black uppercase tracking-tighter text-white hover:text-amber-500 transition-colors py-4"
            >
              Liên Hệ
            </a>
          </nav>

          <a
            href="tel:+84949955644"
            className="mx-8 mb-8 mt-auto flex items-center gap-2 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-5 py-4 w-fit"
          >
            <Phone size={14} strokeWidth={2} />
            <span>Gọi Ngay</span>
          </a>
        </div>
      )}
    </>
  );
}
