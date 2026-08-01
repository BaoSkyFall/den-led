import Link from "next/link";

/**
 * A product slug that no longer resolves.
 *
 * Worth its own page rather than the generic 404: product links get shared on
 * Zalo and Facebook and stay in circulation long after a product is renamed or
 * deactivated, so this is a route real customers reach. It says what happened
 * and points at the catalogue instead of leaving them at a dead end.
 *
 * Reached from the page's own `notFound()` when the API answers 404.
 */
export default function ProductNotFound() {
  return (
    <div className="bg-[#111111] min-h-screen flex items-center justify-center px-6 pt-24">
      <div className="text-center max-w-md">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">
          Không tìm thấy
        </p>
        <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white mb-4">
          Sản phẩm không còn
        </h1>
        <p className="text-sm text-white/40 leading-relaxed mb-8">
          Sản phẩm này đã được đổi tên hoặc ngừng bán. Anh/chị xem các gói độ
          đèn khác, hoặc gọi để được tư vấn mẫu tương đương.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-6 py-3 hover:bg-amber-400 transition-colors"
          >
            Xem Sản Phẩm Khác
          </Link>
          <a
            href="tel:+84949955644"
            className="border border-white/10 text-white text-xs font-bold tracking-[0.2em] uppercase px-6 py-3 hover:border-amber-500 hover:text-amber-500 transition-colors"
          >
            Gọi Tư Vấn
          </a>
        </div>
      </div>
    </div>
  );
}
