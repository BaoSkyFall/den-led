"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { keytoUrl } from "@/lib/utils";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

function badgeLabel(badge: string | null): string | null {
  if (!badge) return null;
  if (badge === "new_product") return "MỚI";
  if (badge === "best_sale") return "BÁN CHẠY";
  if (badge === "featured") return "NỔI BẬT";
  return badge.toUpperCase();
}

type Props = {
  name: string;
  slug: string;
  imageKey: string | null;
  minPrice: string | null;
  fallbackPrice: string | null;
  badge: string | null;
};

export default function ProductRecCard({
  name,
  slug,
  imageKey,
  minPrice,
  fallbackPrice,
  badge,
}: Props) {
  const image = imageKey ? keytoUrl(imageKey) : "/catalog.pdf/1.jpg";
  const price = minPrice
    ? `Từ ${formatVND(Number(minPrice))}`
    : fallbackPrice
      ? formatVND(Number(fallbackPrice))
      : "Liên hệ";
  const label = badgeLabel(badge);

  return (
    <Link
      href={`/shop/${slug}`}
      className="group relative block bg-white/5 overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111111]/80" />
        {label && (
          <span className="absolute top-3 left-3 bg-amber-500 text-black text-[9px] font-black tracking-[0.15em] uppercase px-2 py-0.5">
            {label}
          </span>
        )}
      </div>
      <div className="p-4 border-t border-white/5">
        <h3 className="text-sm font-black uppercase tracking-tighter text-white group-hover:text-amber-500 transition-colors truncate">
          {name}
        </h3>
        <div className="flex items-end justify-between pt-2 mt-2 border-t border-white/5">
          <p className="text-xs font-black text-amber-500">{price}</p>
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/40 group-hover:text-amber-500 transition-colors flex items-center gap-1">
            Xem
            <ChevronRight size={10} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
