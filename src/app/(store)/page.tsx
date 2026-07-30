import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Zap, Award, Shield } from "lucide-react";

import SpecialsSection from "@/components/store/SpecialsSection";
import { getNavTree } from "@/features/vehicle-taxonomy";

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
            <h1 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter text-white mb-8">
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
            <div className="absolute top-1/2 -left-6 -translate-y-1/2 z-20 hidden lg:block">
              <Image
                src="/logo.png"
                alt="Sân Chơi Đèn Led"
                width={112}
                height={99}
                className="h-24 w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
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
                className="object-cover object-center "
              />
              <div className="absolute " />
            </div>
            <div className="absolute top-1/2 -right-6 lg:-right-12 -translate-y-1/2 z-20 hidden lg:block">
              <Image
                src="/logo.png"
                alt="Sân Chơi Đèn Led"
                width={112}
                height={99}
                className="h-24 w-auto object-contain drop-shadow-2xl"
              />
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  // Same DB-driven tree as the header menu and the /shop chips.
  const navModels = await getNavTree();

  return (
    <>
      <HeroSection />
      <SpecialsSection models={navModels} />
      <FeatureCollage />
    </>
  );
}
