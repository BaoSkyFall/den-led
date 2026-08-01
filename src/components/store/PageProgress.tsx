"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The thin amber bar that runs along the top of the window during navigation.
 *
 * The App Router exposes no navigation events in Next 14, so this watches the
 * two things it can see: a click on an internal link starts the bar, and the
 * pathname or query changing means the new page has committed, which ends it.
 *
 * It covers the gap a `loading.tsx` cannot — the stretch between the click and
 * the server responding at all, where the old page is still on screen and
 * nothing else says the site heard you.
 */

/** Creeps toward, but never reaches, this — the last stretch is the commit. */
const CEILING = 90;
const TICK_MS = 200;
/** How long the finished bar stays at 100% before fading out. */
const SETTLE_MS = 250;

export default function PageProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState<number | null>(null);
  const creep = useRef<ReturnType<typeof setInterval> | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTimers = () => {
    if (creep.current) clearInterval(creep.current);
    if (settle.current) clearTimeout(settle.current);
    creep.current = null;
    settle.current = null;
  };

  useEffect(() => {
    const start = () => {
      stopTimers();
      setProgress(8);
      // Decelerating creep: fast at first, then crawling, so a slow route never
      // looks stalled and a quick one never looks like it skipped ahead.
      creep.current = setInterval(() => {
        setProgress((p) => {
          if (p === null) return p;
          return p >= CEILING ? p : p + Math.max(0.4, (CEILING - p) / 12);
        });
      }, TICK_MS);
    };

    const onClick = (event: MouseEvent) => {
      // Let the browser have modified clicks — they open tabs, not routes.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }
      // Anything leaving the app — tel:, mailto:, another origin — unloads the
      // page anyway, so a bar here would just hang until it did.
      if (/^([a-z]+:)?\/\//i.test(href) || /^(tel:|mailto:|#)/i.test(href)) {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
      }

      const next = new URL(anchor.href, window.location.href);
      const here = new URL(window.location.href);
      // Same page, or a jump to an anchor on it: nothing is loading.
      if (next.pathname === here.pathname && next.search === here.search)
        return;

      start();
    };

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", start);
      stopTimers();
    };
  }, []);

  // The route committed — fill the bar, hold a beat, then clear it.
  useEffect(() => {
    stopTimers();
    setProgress((p) => (p === null ? null : 100));
    settle.current = setTimeout(() => setProgress(null), SETTLE_MS);
    return stopTimers;
    // Query changes are navigations too: /shop?page=2 keeps the same pathname.
  }, [pathname, searchParams]);

  if (progress === null) return null;

  return (
    <div
      // Above the header (z-50) because it belongs to the window, not the page.
      className="fixed top-0 left-0 right-0 z-[60] h-0.5 pointer-events-none"
      role="progressbar"
      aria-label="Đang tải trang"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.7)]"
        style={{
          width: `${progress}%`,
          transition: "width 200ms ease-out, opacity 200ms ease-out",
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
