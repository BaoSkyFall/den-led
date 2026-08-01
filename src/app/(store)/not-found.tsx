import Link from "next/link";

/** Any storefront URL that does not resolve to a page. */
export default function StoreNotFound() {
  return (
    <div className="bg-[#111111] min-h-screen flex items-center justify-center px-6 pt-24">
      <div className="text-center max-w-md">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-500 mb-4">
          404
        </p>
        <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-white mb-4">
          Không tìm thấy trang
        </h1>
        <p className="text-sm text-white/40 leading-relaxed mb-8">
          Đường dẫn này không tồn tại hoặc đã được đổi.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="bg-amber-500 text-black text-xs font-bold tracking-[0.2em] uppercase px-6 py-3 hover:bg-amber-400 transition-colors"
          >
            Xem Sản Phẩm
          </Link>
          <Link
            href="/"
            className="border border-white/10 text-white text-xs font-bold tracking-[0.2em] uppercase px-6 py-3 hover:border-amber-500 hover:text-amber-500 transition-colors"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
