import Image from "next/image";

/**
 * The sticky contact rail.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TO FINISH THIS, EDIT THE TABLE BELOW. Nothing else needs touching.
 *
 *  1. `href` — every entry is "#" for now, which means the button renders but
 *     goes nowhere. Paste the real destinations in:
 *       Messenger  https://m.me/<page-id>
 *       Zalo       https://zalo.me/<phone-or-oa-id>
 *       TikTok     https://www.tiktok.com/@<handle>
 *       Shopee     https://shopee.vn/<shop>
 *
 *  2. `icon` — each points at a flat colour square in `public/social/`. Drop
 *     the real coloured PNGs over those four files, same names, and they
 *     appear. Square artwork around 96px or larger; the rail renders them at
 *     44px and the corners are rounded in CSS, so transparent PNGs are fine.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const CHANNELS = [
  { label: "Messenger", href: "#", icon: "/social/messenger.png" },
  { label: "Zalo", href: "#", icon: "/social/zalo.png" },
  { label: "TikTok", href: "#", icon: "/social/tiktok.png" },
  { label: "Shopee", href: "#", icon: "/social/shopee.png" },
];

/**
 * Pinned to the right edge, vertically centred, on every storefront page.
 *
 * A plain server component: it holds no state and the links are static, so
 * there is no reason to ship it to the browser as an island.
 *
 * `z-40` puts it under the header (z-50) and well under the mobile menu
 * (z-100), so an open menu covers it instead of the buttons floating on top.
 */
export default function SocialRail() {
  return (
    <div
      className="fixed right-2 sm:right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2"
      aria-label="Liên hệ nhanh"
    >
      {CHANNELS.map((c) => (
        <a
          key={c.label}
          href={c.href}
          target={c.href === "#" ? undefined : "_blank"}
          rel="noopener noreferrer"
          title={c.label}
          aria-label={c.label}
          className="group relative w-11 h-11 flex items-center justify-center overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md hover:border-amber-500 hover:scale-105 transition-all duration-300"
        >
          <Image
            src={c.icon}
            alt=""
            width={44}
            height={44}
            className="w-7 h-7 object-contain"
          />

          {/* Name slides out on hover. Hidden on touch screens, where there is
              no hover and the rail should stay out of the way. */}
          <span className="pointer-events-none absolute right-full mr-2 hidden lg:block whitespace-nowrap bg-[#0a0a0a] border border-white/10 text-white text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1.5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
            {c.label}
          </span>
        </a>
      ))}
    </div>
  );
}
