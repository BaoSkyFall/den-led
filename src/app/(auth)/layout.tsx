"use client";
import Image from "next/image";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 overflow-hidden md:grid-cols-3 lg:grid-cols-2">
      {/* Left: brand image */}
      <div className="relative w-full hidden md:block">
        <Image
          src="/assets/den-led/SH/SH 2026/DSC01116.jpg"
          alt="Sân Chơi Đèn Led"
          priority
          fill
          className="object-cover object-center grayscale-[30%] contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />

        {/* Brand overlay */}
        <div className="absolute left-8 top-8 z-20">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Sân Chơi Đèn Led"
              width={64}
              height={56}
              priority
              className="h-14 w-auto object-contain drop-shadow-lg"
            />
          </Link>
        </div>

        <div className="absolute bottom-8 left-8 z-20">
          <p className="text-white/60 text-xs tracking-widest uppercase">
            Bi Cầu & LED Xe Máy Cao Cấp
          </p>
        </div>
      </div>

      {/* Right: form */}
      <main className="container absolute top-1/2 col-span-1 flex -translate-y-1/2 items-center md:static md:top-0 md:col-span-2 md:flex md:translate-y-0 lg:col-span-1">
        {children}
      </main>
    </div>
  );
}
