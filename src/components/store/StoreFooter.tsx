"use client";

import Image from "next/image";
import { Facebook } from "lucide-react";

type IconProps = { size?: number; strokeWidth?: number; className?: string };

function Tiktok({ size = 14, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.28a8.16 8.16 0 0 0 4.77 1.52V6.31a4.85 4.85 0 0 1-1.84-.62z" />
    </svg>
  );
}

function Shopee({ size = 14, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2c-2.76 0-5 2.24-5 5v1H4.5a1 1 0 0 0-1 .93l-.7 11a2 2 0 0 0 2 2.14h14.4a2 2 0 0 0 2-2.14l-.7-11a1 1 0 0 0-1-.93H17V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v1H9V7c0-1.66 1.34-3 3-3zm-.4 7.5c1.6 0 2.9.7 3.5 1.9l-1.3 1c-.4-.7-1.2-1.1-2.2-1.1-.8 0-1.5.3-1.5.9 0 .5.5.7 1.6 1 1.6.4 3.3.9 3.3 2.7 0 1.8-1.6 2.8-3.6 2.8-1.8 0-3.2-.7-3.9-1.8l1.4-1c.4.7 1.4 1.2 2.5 1.2 1 0 1.7-.4 1.7-1 0-.6-.6-.8-1.9-1.1-1.5-.4-3-.9-3-2.6 0-1.7 1.5-2.9 3.4-2.9z" />
    </svg>
  );
}

export default function StoreFooter() {
  return (
    <footer id="contact" className="bg-[#050505]">
      <div className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: brand */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <Image
                src="/logo.png"
                alt="Sân Chơi Đèn Led"
                width={72}
                height={64}
                className="h-16 w-auto object-contain"
              />
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                  Sân Chơi Đèn Led
                </p>
                <p className="text-sm font-bold uppercase text-white tracking-wide">
                  Không chỉ để sáng, Mà để khác biệt.
                </p>
              </div>
            </div>

            <p className="text-sm text-white/40 leading-relaxed mb-8 max-w-sm">
              Chuyên độ bi cầu, đèn LED cho xe máy Honda: SH, Air Blade, Vario,
              Lead, Winner, Vision, Future. Linh kiện chính hãng, thi công chuẩn
              kỹ thuật, bảo hành 12 tháng.
            </p>

            <div className="flex gap-5">
              {[Facebook, Tiktok, Shopee].map((Icon, i) => (
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
          {/* <div>
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
          </div> */}
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
