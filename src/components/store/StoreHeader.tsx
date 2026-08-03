"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import type { NavGroup } from "@/features/vehicle-taxonomy";
import HeaderSearch from "./HeaderSearch";

type Props = { groups: NavGroup[] };

/** Type used by the bar's own items, shared so they cannot drift apart. */
const BAR_LINK =
  "text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors px-3 py-2";

/**
 * Geometry of a dropdown panel, in pixels.
 *
 * These have to be numbers rather than Tailwind classes because the panel's
 * width is computed: it is absolutely positioned, so leaving the width to the
 * layout would size it against the ~80px bar item above it. They must stay in
 * step with `gap-x-8` and `p-6` on the panel itself.
 */
const COLUMN_WIDTH = 200;
const COLUMN_GAP = 32;
const PANEL_PADDING = 24;
const MAX_COLUMNS = 3;

/** Three columns once there are three types to fill them, fewer before that. */
export const columnsFor = (sections: number) =>
  Math.min(MAX_COLUMNS, Math.max(1, sections));

export const panelWidth = (sections: number) => {
  const columns = columnsFor(sections);
  return (
    COLUMN_WIDTH * columns + COLUMN_GAP * (columns - 1) + PANEL_PADDING * 2
  );
};

export default function StoreHeader({ groups }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <>
      <header className="fixed top-0 w-full z-50 h-24 backdrop-blur-md bg-[#111111]/90 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 shrink-0">
            {/* 56px -> 70px, a quarter larger. The bar is 96px tall, so this
                still clears the border with room either side. */}
            <Image
              src="/logo.png"
              alt="Sân Chơi Đèn Led"
              width={80}
              height={70}
              priority
              className="h-[70px] w-auto object-contain"
            />
          </Link>

          {/* Each heading sits on the bar in its own right rather than behind a
              single "Sản Phẩm" item: a customer after a light should not have
              to discover that lights live inside something else first. */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className={BAR_LINK}>
              Trang Chủ
            </Link>

            {groups.map((group) => (
              <div
                key={group.key}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.key)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <Link
                  href={group.href}
                  className={`flex items-center gap-1.5 ${BAR_LINK}`}
                >
                  {group.label}
                  <ChevronDown
                    size={10}
                    strokeWidth={2.5}
                    className={`transition-transform duration-200 ${openGroup === group.key ? "rotate-180" : ""}`}
                  />
                </Link>

                {openGroup === group.key && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 z-50">
                    {/* Products are listed under the type they belong to, both
                        levels visible at once. Nothing here is inert text —
                        the type navigates to its filtered list, each product
                        to its own page. */}
                    {/* Three columns, wrapping onto more rows as types are
                        added — Dòng Xe already holds seven.

                        The width is set outright rather than left to
                        `max-width`. The panel is absolutely positioned, so its
                        containing block is the ~80px bar item above it; a
                        wrapping container sized against that shrinks to one
                        column wide no matter what maximum it is given. A panel
                        holding fewer than three types is narrowed to fit them
                        instead of leaving empty tracks. */}
                    <div
                      className="bg-[#0a0a0a] border border-white/10 p-6 grid gap-x-8 gap-y-6 max-w-[calc(100vw-3rem)]"
                      style={{
                        width: panelWidth(group.sections.length),
                        gridTemplateColumns: `repeat(${columnsFor(group.sections.length)}, minmax(0, 1fr))`,
                      }}
                    >
                      {group.sections.map((section) => (
                        <div key={section.id}>
                          <Link
                            href={section.href}
                            className="block text-[13px] font-black uppercase tracking-wide text-white hover:text-amber-500 transition-colors mb-2"
                          >
                            {section.label}
                          </Link>
                          <div className="flex flex-col">
                            {section.products.map((product) => (
                              <Link
                                key={product.id}
                                href={product.href}
                                className="block text-[13px] text-white/40 hover:text-white transition-colors py-0.5"
                              >
                                {product.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <a href="/#contact" className={BAR_LINK}>
              Liên Hệ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden xl:block">
              <HeaderSearch />
            </div>
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

          <div className="px-8 pt-6">
            <HeaderSearch
              variant="mobile"
              onNavigate={() => setMobileOpen(false)}
            />
          </div>

          {/* A phone has no hover and no room for three panels, so the headings
              fold here. The heading itself still navigates, so nothing is
              reachable only by expanding. */}
          <nav className="flex flex-col px-8 py-6 gap-0">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-xl font-black uppercase tracking-tighter text-white hover:text-amber-500 transition-colors py-4 border-b border-white/5"
            >
              Trang Chủ
            </Link>

            {groups.map((group) => (
              <div key={group.key} className="border-b border-white/5">
                <div className="flex items-center justify-between">
                  <Link
                    href={group.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-xl font-black uppercase tracking-tighter text-white py-4 flex-1"
                  >
                    {group.label}
                  </Link>
                  <button
                    className="p-4 text-white/40"
                    onClick={() =>
                      setMobileExpanded(
                        mobileExpanded === group.key ? null : group.key,
                      )
                    }
                    aria-expanded={mobileExpanded === group.key}
                    aria-label={`Mở rộng ${group.label}`}
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${mobileExpanded === group.key ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                {mobileExpanded === group.key && (
                  <div className="pb-4 pl-4 flex flex-col gap-4">
                    {group.sections.map((section) => (
                      <div key={section.id} className="flex flex-col gap-2">
                        <Link
                          href={section.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 pl-3"
                        >
                          {section.label}
                        </Link>
                        {section.products.map((product) => (
                          <Link
                            key={product.id}
                            href={product.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-sm text-white/50 hover:text-amber-500 transition-colors pl-6"
                          >
                            {product.name}
                          </Link>
                        ))}
                      </div>
                    ))}
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
