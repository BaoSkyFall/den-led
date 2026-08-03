"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, Menu, Phone, X } from "lucide-react";
import type { NavGroup } from "@/features/vehicle-taxonomy";
import HeaderSearch from "./HeaderSearch";

type Props = { groups: NavGroup[] };

export default function StoreHeader({ groups }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [desktopHover, setDesktopHover] = useState<string | null>(null);

  // Empty tree (fetch error / empty DB) => plain link, never a broken dropdown.
  const hasMenu = groups.length > 0;

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
                onMouseEnter={() => setDesktopHover("catalogue")}
                onMouseLeave={() => setDesktopHover(null)}
              >
                <Link
                  href="/shop"
                  className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors px-3 py-2"
                >
                  Sản Phẩm
                  <ChevronDown
                    size={10}
                    strokeWidth={2.5}
                    className={`transition-transform duration-200 ${desktopHover === "catalogue" ? "rotate-180" : ""}`}
                  />
                </Link>

                {desktopHover === "catalogue" && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 z-50">
                    {/* Everything is visible at once and every word is a link.
                        The menu this replaced opened with a line of text
                        reading "Chọn hãng xe để xem gói độ đèn" — the most
                        prominent thing on it, and not clickable — which is why
                        customers said they could not tell where to press. */}
                    <div className="bg-[#0a0a0a] border border-white/10 p-6 flex gap-10">
                      {groups.map((group) => (
                        <div key={group.key} className="min-w-[150px]">
                          <Link
                            href={group.href}
                            className="block text-[15px] font-black uppercase tracking-wide text-white hover:text-amber-500 transition-colors mb-3"
                          >
                            {group.label}
                          </Link>
                          <div className="flex flex-col">
                            {group.items.map((item) => (
                              <Link
                                key={item.id}
                                href={item.href}
                                className="block text-[13px] text-white/40 hover:text-white transition-colors py-1"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/shop"
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors px-3 py-2"
              >
                Sản Phẩm
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
            <div className="hidden lg:block">
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

          {/* Same three headings as desktop, stacked. A phone has no room for
              them side by side, so here they do fold — but the heading itself
              still navigates, so nothing is reachable only by expanding. */}
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
                  <div className="pb-3 pl-4 flex flex-col gap-3">
                    {group.items.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm text-white/50 hover:text-amber-500 transition-colors pl-3"
                      >
                        {item.label}
                      </Link>
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
