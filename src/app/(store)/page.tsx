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
  Gauge,
  MapPin,
  Truck,
  ChevronLeft,
} from "lucide-react";

// ─── Static data (Step 1) ────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Garage", href: "/shop" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const PRODUCTS = [
  {
    id: "sh-2026",
    name: "SH 2026",
    category: "Premium",
    price: "85.9 triệu",
    badge: "NEW",
    image: "/assets/den-led/SH/SH 2026/DSC08596.jpg",
  },
  {
    id: "ab-2026",
    name: "Air Blade 2026",
    category: "Sport",
    price: "52.9 triệu",
    badge: "BEST SALE",
    image: "/assets/den-led/AB/AB2026/DSC07552.jpg",
  },
  {
    id: "vario-2026",
    name: "Vario 2026",
    category: "Urban",
    price: "48.5 triệu",
    badge: "FEATURED",
    image: "/assets/den-led/Vario/Vario 2026/DSC06430.jpg",
  },
];

const FEATURES = [
  {
    Icon: Gauge,
    label: "LOW MILEAGE",
    description: "Tất cả xe được kiểm tra kỹ lưỡng trước khi giao",
  },
  {
    Icon: MapPin,
    label: "PICK UP",
    description: "Nhận xe tại showroom hoặc địa điểm của bạn",
  },
  {
    Icon: Truck,
    label: "DELIVERY",
    description: "Giao xe tận nơi trong nội thành",
  },
];

// ─── Components ──────────────────────────────────────────────────────────────

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

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 h-24 backdrop-blur-md bg-[#111111]/90 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500 flex flex-col items-center justify-center">
              <span className="text-[10px] tracking-widest font-bold text-black leading-none">
                UNITED
              </span>
              <span className="text-lg tracking-tighter font-black text-black leading-none">
                MOTORS
              </span>
            </div>
            <button
              className="hidden lg:flex items-center gap-1 text-xs font-bold tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors"
              onClick={() => {}}
            >
              <Menu size={14} strokeWidth={1.5} />
              <span className="ml-1">Menu</span>
            </button>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs font-bold tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right CTA */}
          <div className="flex items-center gap-4">
            <a
              href="tel:+84000000000"
              className="hidden lg:flex items-center gap-2 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-5 py-3 hover:bg-amber-400 transition-colors"
            >
              <Phone size={12} strokeWidth={2} />
              <span>0900 000 000</span>
            </a>
            <button
              className="lg:hidden text-white"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col p-8">
          <button
            className="self-end text-white mb-12"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
          <nav className="flex flex-col gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="text-3xl font-black uppercase tracking-tighter text-white hover:text-amber-500 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
          <a
            href="tel:+84000000000"
            className="mt-auto flex items-center gap-2 bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-5 py-4 w-fit"
          >
            <Phone size={14} strokeWidth={2} />
            <span>0900 000 000</span>
          </a>
        </div>
      )}
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[800px] lg:h-screen bg-[#111111] overflow-hidden">
      {/* Page indicator */}
      <div className="absolute top-40 left-10 z-20 hidden lg:flex items-center gap-4">
        <span className="text-xs font-bold tracking-[0.2em] text-white/30 uppercase">
          01
        </span>
        <div className="w-12 h-px bg-white/20" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 h-full">
        <div className="lg:grid lg:grid-cols-12 h-full items-center pt-24">
          {/* Text content — col 5 */}
          <div className="relative z-10 lg:col-span-5 pt-24 lg:pt-0">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-6">
              Premium Collection
            </p>
            <h1
              className="text-6xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter text-white mb-8"
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              Luxury
              <br />
              Lifestyle
              <br />
              <span className="text-amber-500">Rentals</span>
            </h1>

            {/* Pricing callout */}
            <div className="border-l-2 border-amber-500 pl-6 mb-10">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-1">
                Honda SH 2026
              </p>
              <p className="text-white font-bold text-sm tracking-wide">
                85.9 Triệu / Chiếc
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="/shop"
                className="bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 hover:bg-amber-400 transition-colors"
              >
                Xem Xe
              </Link>
              <a
                href="#contact"
                className="border border-white/20 text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 hover:bg-white hover:text-black transition-all duration-300"
              >
                Liên hệ
              </a>
            </div>
          </div>

          {/* Hero image — col 7 */}
          <div className="relative lg:col-span-7 h-[400px] lg:h-full mt-12 lg:mt-0">
            {/* Gradient bridge */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#111111] to-transparent z-10" />

            <Image
              src="/assets/den-led/SH/SH 2026/DSC01116.jpg"
              alt="SH 2026 Hero"
              fill
              priority
              className="object-cover object-center grayscale-[20%] contrast-125"
            />

            {/* Floating amber box */}
            <div className="absolute top-1/2 -left-6 -translate-y-1/2 z-20 bg-amber-500 p-4 hidden lg:flex flex-col items-center gap-1">
              {["DEN", "LED", "MOTORS"].map((word) => (
                <span
                  key={word}
                  className="text-[9px] font-black tracking-[0.2em] uppercase text-black leading-tight"
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

function SpecialsSection() {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "SH", "Air Blade", "Vario"];

  return (
    <section className="bg-[#111111] py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-3">
              Our Collection
            </p>
            <h2
              className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white"
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              Todays Specials
            </h2>
          </div>

          {/* Filter pills */}
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

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {PRODUCTS.map((product) => (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className="group relative block bg-white/5 overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111111]/80" />

                {/* Badge */}
                <span className="absolute top-4 left-4 bg-amber-500 text-black text-[9px] font-black tracking-[0.15em] uppercase px-2 py-1">
                  {product.badge}
                </span>
              </div>

              {/* Info */}
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
                    Giá
                  </p>
                  <p className="text-amber-500 font-bold text-sm">
                    {product.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
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

function FeatureCollage() {
  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: image + floating box */}
          <div className="relative">
            <div className="relative h-[500px] lg:h-[600px] overflow-hidden">
              <Image
                src="/assets/den-led/Winner/DSC07725.jpg"
                alt="Feature"
                fill
                className="object-cover object-center grayscale"
              />
              <div className="absolute inset-0 bg-[#111111]/30" />
            </div>

            {/* Floating amber brand box */}
            <div className="absolute top-1/2 -right-6 lg:-right-12 -translate-y-1/2 z-20 bg-amber-500 px-5 py-8 hidden lg:flex flex-col items-center gap-1">
              <span className="text-[9px] font-black tracking-[0.25em] uppercase text-black">
                UNITED
              </span>
              <span className="text-[9px] font-black tracking-[0.25em] uppercase text-black">
                MOTORS
              </span>
              <span className="text-[9px] font-black tracking-[0.25em] uppercase text-black">
                GROUP
              </span>
            </div>
          </div>

          {/* Right: content */}
          <div className="relative flex flex-col justify-center px-8 lg:px-16 py-16 lg:py-0 overflow-hidden">
            {/* Faded background image */}
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
                Why Choose Us
              </p>
              <h2
                className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white mb-6"
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                Premium
                <br />
                Experience
              </h2>
              <p className="text-sm text-white/50 leading-relaxed mb-12 max-w-sm">
                Chúng tôi cung cấp những chiếc xe máy cao cấp nhất với dịch vụ
                chuyên nghiệp và đáng tin cậy. Mỗi xe đều được kiểm tra kỹ lưỡng
                trước khi đến tay khách hàng.
              </p>

              {/* Feature icons */}
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

              <Link
                href="/shop"
                className="inline-flex items-center gap-3 mt-12 text-xs font-bold tracking-[0.2em] uppercase text-white hover:text-amber-500 transition-colors group"
              >
                <span>Khám Phá Thêm</span>
                <ChevronRight
                  size={14}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact" className="bg-[#050505]">
      <div className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: brand + info */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-amber-500 flex flex-col items-center justify-center">
                <span className="text-[10px] tracking-widest font-bold text-black leading-none">
                  UNITED
                </span>
                <span className="text-lg tracking-tighter font-black text-black leading-none">
                  MOTORS
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                  Den Led
                </p>
                <p className="text-sm font-bold uppercase text-white tracking-wide">
                  Motors Group
                </p>
              </div>
            </div>

            <p className="text-sm text-white/40 leading-relaxed mb-8 max-w-sm">
              Chuyên cung cấp xe máy Honda cao cấp, chính hãng. Dịch vụ chuyên
              nghiệp, uy tín và đáng tin cậy.
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
              Get In Touch
            </p>
            <h3
              className="text-3xl font-black uppercase tracking-tighter text-white mb-8"
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              Liên Hệ Tư Vấn
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
              <input
                type="email"
                placeholder="Email"
                className="bg-[#111] border border-white/10 text-white text-sm px-4 py-3 outline-none placeholder:text-white/20 focus:border-amber-500 transition-colors"
              />
              <select className="bg-[#111] border border-white/10 text-white/60 text-sm px-4 py-3 outline-none focus:border-amber-500 transition-colors appearance-none">
                <option value="">Xe quan tâm</option>
                <option value="sh-2026">SH 2026</option>
                <option value="ab-2026">Air Blade 2026</option>
                <option value="vario-2026">Vario 2026</option>
              </select>
              <textarea
                placeholder="Tin nhắn"
                rows={3}
                className="bg-[#111] border border-white/10 text-white text-sm px-4 py-3 outline-none placeholder:text-white/20 focus:border-amber-500 transition-colors resize-none"
              />
              <button
                type="submit"
                className="bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 hover:bg-amber-400 transition-colors text-left"
              >
                Gửi Yêu Cầu →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col lg:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-white/20 tracking-widest uppercase">
            © 2026 Den Led Motors Group. All rights reserved.
          </p>
          <div className="flex gap-8">
            {["Privacy", "Terms", "Cookies"].map((item) => (
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
    <div
      className="bg-[#111111] text-gray-300 antialiased selection:bg-amber-500 selection:text-black"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      <SocialSidebar />
      <Header />
      <HeroSection />
      <SpecialsSection />
      <FeatureCollage />
      <Footer />
    </div>
  );
}
