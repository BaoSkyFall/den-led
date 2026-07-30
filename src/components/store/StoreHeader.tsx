"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import type { NavModel } from "@/features/vehicle-taxonomy";

type Props = { models: NavModel[] };

export default function StoreHeader({ models }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [desktopHover, setDesktopHover] = useState<string | null>(null);

  // Empty tree (fetch error / empty DB) => plain link, never a broken dropdown.
  const hasMenu = models.length > 0;

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
                      <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">
                        Chọn dòng xe để xem gói độ đèn
                      </p>
                      <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                        {models.map((m) => (
                          <div key={m.id}>
                            <p className="text-xs font-black uppercase tracking-wide text-white mb-2">
                              {m.label}
                            </p>
                            {m.generations.map((g) => (
                              <div key={g.id}>
                                <p className="text-[9px] uppercase tracking-wide text-white/30 mt-2">
                                  {g.label}
                                </p>
                                {g.products.map((p) => (
                                  <Link
                                    key={p.id}
                                    href={`/shop/${p.slug}`}
                                    className="block text-[10px] text-white/40 hover:text-white transition-colors py-0.5"
                                  >
                                    {p.name}
                                  </Link>
                                ))}
                              </div>
                            ))}
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

          <nav className="flex flex-col px-8 py-6 gap-0">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-xl font-black uppercase tracking-tighter text-white hover:text-amber-500 transition-colors py-4 border-b border-white/5"
            >
              Trang Chủ
            </Link>

            {models.map((m) => (
              <div key={m.id} className="border-b border-white/5">
                {m.generations.length > 0 ? (
                  <button
                    className="w-full flex items-center justify-between text-left"
                    onClick={() =>
                      setMobileExpanded(mobileExpanded === m.id ? null : m.id)
                    }
                    aria-expanded={mobileExpanded === m.id}
                  >
                    <span className="text-xl font-black uppercase tracking-tighter text-white py-4 flex-1">
                      {m.label}
                    </span>
                    <span className="p-4 text-white/40">
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${mobileExpanded === m.id ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>
                ) : (
                  <p className="text-xl font-black uppercase tracking-tighter text-white py-4">
                    {m.label}
                  </p>
                )}
                {mobileExpanded === m.id && m.generations.length > 0 && (
                  <div className="pb-3 pl-4 flex flex-col gap-3">
                    {m.generations.map((g) => (
                      <div key={g.id} className="flex flex-col gap-2">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                          {g.label}
                        </p>
                        {g.products.map((p) => (
                          <Link
                            key={p.id}
                            href={`/shop/${p.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="text-sm text-white/50 hover:text-amber-500 transition-colors pl-3"
                          >
                            {p.name}
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
