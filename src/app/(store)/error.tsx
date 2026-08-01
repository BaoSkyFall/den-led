"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Catches a render failure anywhere in the storefront.
 *
 * Without this the customer sees Next's built-in error screen: a bare English
 * sentence on a white page, which on a dark Vietnamese site reads as the site
 * being gone rather than one page having a problem.
 *
 * `reset()` re-renders the segment without a full reload, which is usually all
 * a flaky connection needs.
 */
export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The message is redacted in production builds; the digest is what ties
    // this back to a server log line.
    console.error("[storefront]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="bg-[#111111] min-h-screen flex items-center justify-center px-6 pt-24">
      <div className="text-center max-w-md">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">
          Có lỗi xảy ra
        </p>
        <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white mb-4">
          Không tải được trang
        </h1>
        <p className="text-sm text-white/40 leading-relaxed mb-8">
          Trang này gặp sự cố khi tải. Anh/chị thử lại giúp, hoặc gọi trực tiếp
          để được tư vấn ngay.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-6 py-3 hover:bg-amber-400 transition-colors"
          >
            Thử Lại
          </button>
          <Link
            href="/"
            className="border border-white/10 text-white text-xs font-bold tracking-[0.2em] uppercase px-6 py-3 hover:border-amber-500 hover:text-amber-500 transition-colors"
          >
            Về Trang Chủ
          </Link>
          <a
            href="tel:+84949955644"
            className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase px-4 py-3 hover:text-white transition-colors"
          >
            Gọi Ngay
          </a>
        </div>
      </div>
    </div>
  );
}
