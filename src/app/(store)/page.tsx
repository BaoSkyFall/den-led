"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Zap,
  Award,
  Shield,
  ChevronLeft,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  badge: string | null;
  rating: string;
  price: string;
  imageKey: string | null;
  minVariantPrice: string | null;
};

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

function resolveImageSrc(key: string | null): string {
  if (!key) return "/catalog.pdf/1.jpg";
  if (key.startsWith("http") || key.startsWith("/")) return key;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${key}`;
}

function badgeLabel(badge: string | null): string {
  if (!badge) return "SẢN PHẨM";
  if (badge === "new_product") return "MỚI";
  if (badge === "best_sale") return "BÁN CHẠY";
  if (badge === "featured") return "NỔI BẬT";
  return badge.toUpperCase();
}

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
                Chỉ Từ 3.750.000đ / Chiếc
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

function ProductCardSkeleton() {
  return (
    <div className="bg-white/5 overflow-hidden">
      <div className="aspect-[16/9] bg-white/5 animate-pulse" />
      <div className="p-5 flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-white/5 animate-pulse w-1/3" />
          <div className="h-5 bg-white/10 animate-pulse w-3/4" />
        </div>
        <div className="space-y-2 w-24">
          <div className="h-3 bg-white/5 animate-pulse" />
          <div className="h-4 bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SpecialsSection() {
  const [activeFilter, setActiveFilter] = useState("Tất Cả");
  const [products, setProducts] = useState<Product[] | null>(null);
  const filters = ["Tất Cả", "SH", "Air Blade", "Vario"];

  useEffect(() => {
    fetch("/api/products/list")
      .then((r) => r.json())
      .then((data) => setProducts(data as Product[]))
      .catch(() => setProducts([]));
  }, []);

  const filtered =
    products === null
      ? null
      : activeFilter === "Tất Cả"
        ? products
        : products.filter((p) =>
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

        {filtered === null ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-white/5">
            <p className="text-sm text-white/40">
              Chưa có sản phẩm phù hợp với bộ lọc này.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {filtered.map((product) => {
              const price = product.minVariantPrice
                ? `Từ ${formatVND(Number(product.minVariantPrice))}`
                : "Liên hệ";
              const image = resolveImageSrc(product.imageKey);
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group relative block bg-white/5 overflow-hidden"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={image}
                      alt={`${product.name} độ đèn LED bi cầu`}
                      fill
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111111]/80" />
                    <span className="absolute top-4 left-4 bg-amber-500 text-black text-[9px] font-black tracking-[0.15em] uppercase px-2 py-1">
                      {badgeLabel(product.badge)}
                    </span>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-1">
                        Honda
                      </p>
                      <h3 className="text-lg font-black uppercase tracking-tighter text-white truncate">
                        {product.name}
                      </h3>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40 mb-1">
                        Giá
                      </p>
                      <p className="text-amber-500 font-bold text-sm whitespace-nowrap">
                        {price}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-center gap-6 mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase text-white hover:text-amber-500 transition-colors group"
          >
            <ChevronLeft size={14} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" />
            <span>Xem Tất Cả Sản Phẩm</span>
            <ChevronRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
          </Link>
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
                maskImage: "linear-gradient(to right, transparent, #0a0a0a 60%)",
                WebkitMaskImage: "linear-gradient(to right, transparent, #0a0a0a 60%)",
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <HeroSection />
      <SpecialsSection />
      <FeatureCollage />
    </>
  );
}
