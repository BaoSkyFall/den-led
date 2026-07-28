"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Instagram,
  Facebook,
  Twitter,
  Phone,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Zap,
  Award,
  Shield,
  ChevronLeft,
} from "lucide-react";

// ─── Dữ liệu xe — từ public/assets/den-led/ ────────────────────────────────

type VehicleChild = { label: string; href: string };
type VehicleItem = { label: string; href: string; children: VehicleChild[] };

const NAV_VEHICLES: VehicleItem[] = [
  {
    label: "SH",
    href: "/shop/sh-2026",
    children: [
      { label: "SH 2026", href: "/shop/sh-2026" },
      { label: "SH 2020", href: "/shop/sh-2020" },
    ],
  },
  {
    label: "Air Blade",
    href: "/shop/air-blade-2026",
    children: [
      { label: "Air Blade 2026", href: "/shop/air-blade-2026" },
      { label: "Air Blade 2013", href: "/shop/air-blade-2013" },
    ],
  },
  {
    label: "Vario",
    href: "/shop/vario-2026",
    children: [
      { label: "Vario 2026", href: "/shop/vario-2026" },
      { label: "Vario 2020", href: "/shop/vario-2020" },
      { label: "Vario 160", href: "/shop/vario-160" },
    ],
  },
  {
    label: "Lead",
    href: "/shop/lead-2025",
    children: [
      { label: "Lead 2025", href: "/shop/lead-2025" },
      { label: "Lead 2018", href: "/shop/lead-2018" },
    ],
  },
  { label: "Winner", href: "/shop/winner", children: [] },
  { label: "Vision", href: "/shop/vision", children: [] },
  { label: "Future", href: "/shop/future", children: [] },
  { label: "Phụ Kiện", href: "/shop/phu-kien", children: [] },
];

const PRODUCTS = [
  {
    id: "sh-2026",
    name: "SH 2026",
    category: "Premium",
    price: "Từ 999.000đ",
    badge: "MỚI",
    image: "/assets/den-led/SH/SH 2026/DSC08596.jpg",
  },
  {
    id: "air-blade-2026",
    name: "Air Blade 2026",
    category: "Sport",
    price: "Từ 1.300.000đ",
    badge: "NỔI BẬT",
    image: "/assets/den-led/AB/AB2026/DSC07552.jpg",
  },
  {
    id: "vario-2026",
    name: "Vario 2026",
    category: "Urban",
    price: "Từ 1.500.000đ",
    badge: "HOT",
    image: "/assets/den-led/Vario/Vario 2026/DSC06430.jpg",
  },
];

const FEATURES = [
  {
    Icon: Zap,
    label: "BI CẦU CAO CẤP",
    description:
      "Sử dụng bi cầu Kenzo, HD chính hãng — ánh sáng rõ nét, hiệu ứng đẹp mắt",
  },
  {
    Icon: Award,
    label: "LINH KIỆN CHÍNH HÃNG",
    description:
      "LED Audi A11PRO, A7, A8X — nhập khẩu, chống nước, tuổi thọ cao",
  },
  {
    Icon: Shield,
    label: "BẢO HÀNH 12 THÁNG",
    description:
      "Cam kết bảo hành toàn bộ linh kiện và công lắp đặt sau thi công",
  },
];

// ─── Header với dropdown xe ──────────────────────────────────────────────────

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [desktopHover, setDesktopHover] = useState<string | null>(null);

  return (
    <>
      <header className="fixed top-0 w-full z-50 h-24 backdrop-blur-md bg-[#111111]/90 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 bg-amber-500 flex flex-col items-center justify-center px-1">
              <span className="text-[8px] tracking-widest font-bold text-black leading-none text-center">
                SÂN CHƠI
              </span>
              <span className="text-[11px] tracking-tight font-black text-black leading-none text-center">
                ĐÈN LED
              </span>
            </div>
          </Link>

          {/* Desktop nav — vehicle dropdown */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors px-3 py-2"
            >
              Trang Chủ
            </Link>

            {/* Dropdown trigger wrapper */}
            <div
              className="relative"
              onMouseEnter={() => setDesktopHover("vehicles")}
              onMouseLeave={() => setDesktopHover(null)}
            >
              <button className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors px-3 py-2">
                Danh Sách Xe
                <ChevronDown
                  size={10}
                  strokeWidth={2.5}
                  className={`transition-transform duration-200 ${desktopHover === "vehicles" ? "rotate-180" : ""}`}
                />
              </button>

              {/* Mega dropdown */}
              {desktopHover === "vehicles" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 z-50 min-w-[520px]">
                  <div className="bg-[#0a0a0a] border border-white/10 p-6">
                    <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">
                      Chọn dòng xe để xem gói độ đèn
                    </p>
                    <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                      {NAV_VEHICLES.map((v) => (
                        <div key={v.label}>
                          <Link
                            href={v.href}
                            className="block text-xs font-black uppercase tracking-wide text-white hover:text-amber-500 transition-colors mb-2"
                          >
                            {v.label}
                          </Link>
                          {v.children.map((c) => (
                            <Link
                              key={c.href}
                              href={c.href}
                              className="block text-[10px] text-white/40 hover:text-white transition-colors py-0.5"
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#contact"
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors px-3 py-2"
            >
              Liên Hệ
            </a>
          </nav>

          {/* Right CTA */}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between p-8 border-b border-white/5">
            <div className="w-10 h-10 bg-amber-500 flex flex-col items-center justify-center px-1">
              <span className="text-[7px] tracking-widest font-bold text-black leading-none text-center">
                SÂN CHƠI
              </span>
              <span className="text-[9px] tracking-tight font-black text-black leading-none text-center">
                ĐÈN LED
              </span>
            </div>
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

            {NAV_VEHICLES.map((v) => (
              <div key={v.label} className="border-b border-white/5">
                <div className="flex items-center justify-between">
                  <Link
                    href={v.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-xl font-black uppercase tracking-tighter text-white hover:text-amber-500 transition-colors py-4 flex-1"
                  >
                    {v.label}
                  </Link>
                  {v.children.length > 0 && (
                    <button
                      className="p-4 text-white/40"
                      onClick={() =>
                        setMobileExpanded(
                          mobileExpanded === v.label ? null : v.label,
                        )
                      }
                    >
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${mobileExpanded === v.label ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {mobileExpanded === v.label && v.children.length > 0 && (
                  <div className="pb-3 pl-4 flex flex-col gap-2">
                    {v.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm text-white/50 hover:text-amber-500 transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <a
              href="#contact"
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

// ─── Social Sidebar ──────────────────────────────────────────────────────────

function SocialSidebar() {
  return (
    <aside className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 flex-col gap-5">
      {[
        { Icon: Instagram, href: "#" },
        { Icon: Facebook, href: "#" },
        { Icon: Twitter, href: "#" },
      ].map(({ Icon, href }, i) => (
        <a
          key={i}
          href={href}
          aria-label="social"
          className="text-gray-500 hover:text-amber-500 transition-colors duration-300"
        >
          <Icon size={16} strokeWidth={1.5} />
        </a>
      ))}
      <div className="w-px h-16 bg-white/10 mx-auto mt-2" />
    </aside>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-[800px] lg:h-screen bg-[#111111] overflow-hidden">
      <div className="absolute top-40 left-10 z-20 hidden lg:flex items-center gap-4">
        <span className="text-xs font-bold tracking-[0.2em] text-white/30 uppercase">
          01
        </span>
        <div className="w-12 h-px bg-white/20" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 h-full">
        <div className="lg:grid lg:grid-cols-12 h-full items-center pt-24">
          {/* Text */}
          <div className="relative z-10 lg:col-span-5 pt-24 lg:pt-0">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-6">
              Bi Cầu & Đèn LED Xe Máy
            </p>
            <h1 className="text-6xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter text-white mb-8">
              Nâng
              <br />
              Cấp
              <br />
              <span className="text-amber-500">Đèn Xe</span>
            </h1>

            <div className="border-l-2 border-amber-500 pl-6 mb-10">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-1">
                Bi Cầu Kenzo S700PRO V2
              </p>
              <p className="text-white font-bold text-sm tracking-wide">
                Chỉ Từ 999.000đ / Chiếc
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="#specials"
                className="bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 hover:bg-amber-400 transition-colors"
              >
                Xem Dịch Vụ
              </Link>
              <a
                href="#contact"
                className="border border-white/20 text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 hover:bg-white hover:text-black transition-all duration-300"
              >
                Tư Vấn Miễn Phí
              </a>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative lg:col-span-7 h-[400px] lg:h-full mt-12 lg:mt-0">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#111111] to-transparent z-10" />
            <Image
              src="/assets/den-led/SH/SH 2026/DSC01116.jpg"
              alt="SH 2026 độ đèn LED bi cầu"
              fill
              priority
              className="object-cover object-center grayscale-[20%] contrast-125"
            />
            <div className="absolute top-1/2 -left-6 -translate-y-1/2 z-20 bg-amber-500 p-4 hidden lg:flex flex-col items-center gap-1">
              {["SÂN", "CHƠI", "ĐÈN LED"].map((word) => (
                <span
                  key={word}
                  className="text-[8px] font-black tracking-[0.15em] uppercase text-black leading-tight"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Specials Section ────────────────────────────────────────────────────────

function SpecialsSection() {
  const [activeFilter, setActiveFilter] = useState("Tất Cả");
  const filters = ["Tất Cả", "SH", "Air Blade", "Vario"];

  const filtered =
    activeFilter === "Tất Cả"
      ? PRODUCTS
      : PRODUCTS.filter((p) =>
          p.name.toLowerCase().includes(activeFilter.toLowerCase()),
        );

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

          <div className="flex items-center gap-0">
            {filters.map((f, i) => (
              <div key={f} className="flex items-center">
                {i > 0 && <div className="w-px h-4 bg-white/10 mx-4" />}
                <button
                  onClick={() => setActiveFilter(f)}
                  className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
                    activeFilter === f
                      ? "text-amber-500"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className="group relative block bg-white/5 overflow-hidden"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={product.image}
                  alt={`${product.name} độ đèn LED bi cầu`}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111111]/80" />
                <span className="absolute top-4 left-4 bg-amber-500 text-black text-[9px] font-black tracking-[0.15em] uppercase px-2 py-1">
                  {product.badge}
                </span>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-1">
                    {product.category}
                  </p>
                  <h3 className="text-lg font-black uppercase tracking-tighter text-white">
                    {product.name}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40 mb-1">
                    Giá Từ
                  </p>
                  <p className="text-amber-500 font-bold text-sm">
                    {product.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mt-12">
          <button className="text-white/30 hover:text-white transition-colors">
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <span className="text-xs font-bold tracking-[0.2em] text-amber-500">
            1
          </span>
          <div className="w-12 h-px bg-white/20" />
          <span className="text-xs font-bold tracking-[0.2em] text-white/30">
            4
          </span>
          <button className="text-white/30 hover:text-white transition-colors">
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Feature Collage ─────────────────────────────────────────────────────────

function FeatureCollage() {
  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="relative">
            <div className="relative h-[500px] lg:h-[600px] overflow-hidden">
              <Image
                src="/assets/den-led/Winner/DSC07725.jpg"
                alt="Độ đèn Winner bi cầu LED"
                fill
                className="object-cover object-center grayscale"
              />
              <div className="absolute inset-0 bg-[#111111]/30" />
            </div>
            <div className="absolute top-1/2 -right-6 lg:-right-12 -translate-y-1/2 z-20 bg-amber-500 px-4 py-8 hidden lg:flex flex-col items-center gap-1">
              <span className="text-[8px] font-black tracking-[0.15em] uppercase text-black">
                SÂN CHƠI
              </span>
              <span className="text-[8px] font-black tracking-[0.15em] uppercase text-black">
                ĐÈN LED
              </span>
            </div>
          </div>

          <div className="relative flex flex-col justify-center px-8 lg:px-16 py-16 lg:py-0 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <Image
                src="/assets/den-led/Winner/DSC07732.jpg"
                alt=""
                fill
                className="object-cover object-center"
              />
            </div>
            <div
              className="absolute inset-0"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, #0a0a0a 60%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, #0a0a0a 60%)",
              }}
            />

            <div className="relative z-10">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-4">
                Vì Sao Chọn Chúng Tôi
              </p>
              <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white mb-6">
                Chuyên
                <br />
                Nghiệp
              </h2>
              <p className="text-sm text-white/50 leading-relaxed mb-12 max-w-sm">
                Chuyên độ bi cầu, đèn LED cho xe máy — từ bi cầu Kenzo, HD đến
                đèn Audi DRL. Thi công chuẩn kỹ thuật, thẩm mỹ cao, bảo hành rõ
                ràng.
              </p>

              <div className="flex flex-col gap-8">
                {FEATURES.map(({ Icon, label, description }) => (
                  <div key={label} className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-10 h-10 border border-white/10 flex items-center justify-center">
                      <Icon
                        size={16}
                        strokeWidth={1.5}
                        className="text-amber-500"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-white mb-1">
                        {label}
                      </p>
                      <p className="text-xs text-white/40 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="#contact"
                className="inline-flex items-center gap-3 mt-12 text-xs font-bold tracking-[0.2em] uppercase text-white hover:text-amber-500 transition-colors group"
              >
                <span>Liên Hệ Tư Vấn</span>
                <ChevronRight
                  size={14}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer id="contact" className="bg-[#050505]">
      <div className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: brand */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-amber-500 flex flex-col items-center justify-center px-1">
                <span className="text-[8px] tracking-widest font-bold text-black leading-none text-center">
                  SÂN CHƠI
                </span>
                <span className="text-[11px] tracking-tight font-black text-black leading-none text-center">
                  ĐÈN LED
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                  Sân Chơi Đèn Led
                </p>
                <p className="text-sm font-bold uppercase text-white tracking-wide">
                  Độ Đèn Xe Máy
                </p>
              </div>
            </div>

            <p className="text-sm text-white/40 leading-relaxed mb-8 max-w-sm">
              Chuyên độ bi cầu, đèn LED cho xe máy Honda: SH, Air Blade, Vario,
              Lead, Winner, Vision, Future. Linh kiện chính hãng, thi công chuẩn
              kỹ thuật, bảo hành 12 tháng.
            </p>

            <div className="flex gap-5">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 border border-white/10 flex items-center justify-center text-white/40 hover:border-amber-500 hover:text-amber-500 transition-all duration-300"
                  aria-label="social"
                >
                  <Icon size={14} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Right: contact form */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-6">
              Liên Hệ Ngay
            </p>
            <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-8">
              Tư Vấn Miễn Phí
            </h3>

            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Họ và tên"
                  className="bg-[#111] border border-white/10 text-white text-sm px-4 py-3 outline-none placeholder:text-white/20 focus:border-amber-500 transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  className="bg-[#111] border border-white/10 text-white text-sm px-4 py-3 outline-none placeholder:text-white/20 focus:border-amber-500 transition-colors"
                />
              </div>
              <select className="bg-[#111] border border-white/10 text-white/60 text-sm px-4 py-3 outline-none focus:border-amber-500 transition-colors appearance-none">
                <option value="">Dòng xe cần độ đèn</option>
                <option value="sh-2026">SH 2026</option>
                <option value="sh-2020">SH 2020</option>
                <option value="air-blade-2026">Air Blade 2026</option>
                <option value="air-blade-2013">Air Blade 2013</option>
                <option value="vario-2026">Vario 2026</option>
                <option value="vario-2020">Vario 2020</option>
                <option value="vario-160">Vario 160</option>
                <option value="lead-2025">Lead 2025</option>
                <option value="lead-2018">Lead 2018</option>
                <option value="winner">Winner</option>
                <option value="vision">Vision</option>
                <option value="future">Future</option>
              </select>
              <select className="bg-[#111] border border-white/10 text-white/60 text-sm px-4 py-3 outline-none focus:border-amber-500 transition-colors appearance-none">
                <option value="">Dịch vụ quan tâm</option>
                <option value="bi-cau">Độ Bi Cầu (Kenzo, HD)</option>
                <option value="den-led">Đèn LED Audi / DRL</option>
                <option value="tron-bo">Trọn Bộ Bi Cầu + LED</option>
                <option value="phu-kien">Phụ Kiện</option>
              </select>
              <textarea
                placeholder="Ghi chú thêm (xe đời, màu, yêu cầu đặc biệt...)"
                rows={3}
                className="bg-[#111] border border-white/10 text-white text-sm px-4 py-3 outline-none placeholder:text-white/20 focus:border-amber-500 transition-colors resize-none"
              />
              <button
                type="submit"
                className="bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 hover:bg-amber-400 transition-colors text-left"
              >
                Gửi Yêu Cầu Tư Vấn →
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col lg:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-white/20 tracking-widest uppercase">
            © 2026 Sân Chơi Đèn Led. All rights reserved.
          </p>
          <div className="flex gap-8">
            {["Chính Sách", "Điều Khoản", "Liên Hệ"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[10px] text-white/20 tracking-widest uppercase hover:text-white/50 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="bg-[#111111] text-gray-300 antialiased selection:bg-amber-500 selection:text-black">
      <SocialSidebar />
      <Header />
      <HeroSection />
      <SpecialsSection />
      <FeatureCollage />
      <Footer />
    </div>
  );
}
