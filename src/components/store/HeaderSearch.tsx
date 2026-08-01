"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

type Hit = {
  id: string;
  name: string;
  slug: string;
  brandLabel: string | null;
  isAccessory: boolean;
};

/** Long enough that a single letter does not fire a query for the whole table. */
const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

type Props = {
  /** Full-width, no dropdown positioning — used inside the mobile menu. */
  variant?: "desktop" | "mobile";
  /** Lets the mobile menu close itself when a suggestion is taken. */
  onNavigate?: () => void;
};

/**
 * Search box in the header, matching vehicles and accessories by name.
 *
 * Suggestions come from a narrow endpoint that returns at most eight rows;
 * pressing Enter hands off to `/shop?q=`, which already filters and paginates
 * server-side. That split keeps the dropdown cheap without giving up the full
 * result set — and means there is exactly one place where searching is
 * implemented.
 */
export default function HeaderSearch({
  variant = "desktop",
  onNavigate,
}: Props) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const query = term.trim();

  useEffect(() => {
    if (query.length < MIN_CHARS) {
      setHits(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    // `ignore` rather than an AbortController: a slow early request must not be
    // allowed to overwrite the results of a later one the customer is actually
    // waiting on.
    let ignore = false;
    const id = setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(query)}`, {
        cache: "no-store",
      })
        .then((r) => r.json())
        .then((data) => {
          if (ignore) return;
          setHits(Array.isArray(data) ? (data as Hit[]) : []);
          setLoading(false);
        })
        .catch(() => {
          if (ignore) return;
          setHits([]);
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      ignore = true;
      clearTimeout(id);
    };
  }, [query]);

  // Close on an outside click. Desktop only — the mobile variant is already
  // inside a full-screen menu with nothing behind it to click.
  useEffect(() => {
    if (variant !== "desktop" || !open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [variant, open]);

  const go = () => {
    if (!query) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/shop?q=${encodeURIComponent(query)}`);
  };

  const take = () => {
    setOpen(false);
    setTerm("");
    onNavigate?.();
  };

  const isMobile = variant === "mobile";

  return (
    <div
      ref={boxRef}
      className={`relative ${isMobile ? "w-full" : "w-56 xl:w-72"}`}
    >
      <Search
        size={14}
        strokeWidth={1.5}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
      />
      <input
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") go();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Tìm xe, phụ kiện..."
        aria-label="Tìm xe hoặc phụ kiện"
        className={`w-full bg-white/5 border border-white/10 text-white outline-none placeholder:text-white/25 focus:border-amber-500 transition-colors ${
          isMobile ? "text-sm px-9 py-3" : "text-xs px-9 py-2"
        }`}
      />

      {(loading || term) && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 size={14} className="animate-spin text-white/30" />
          ) : (
            <button
              type="button"
              onClick={() => {
                setTerm("");
                setHits(null);
              }}
              aria-label="Xoá tìm kiếm"
              className="text-white/30 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </span>
      )}

      {open && query.length >= MIN_CHARS && !loading && hits && (
        <div
          className={`bg-[#0a0a0a] border border-white/10 max-h-80 overflow-y-auto ${
            isMobile ? "mt-2" : "absolute top-full left-0 right-0 mt-1 z-50"
          }`}
        >
          {hits.length === 0 ? (
            <p className="text-[11px] text-white/40 px-4 py-4">
              Không tìm thấy “{query}”.
            </p>
          ) : (
            <>
              {hits.map((h) => (
                <Link
                  key={h.id}
                  href={`/shop/${h.slug}`}
                  onClick={take}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
                >
                  <span className="text-[13px] text-white/80 truncate">
                    {h.name}
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/30 shrink-0">
                    {h.isAccessory ? "Phụ Kiện" : (h.brandLabel ?? "Xe")}
                  </span>
                </Link>
              ))}
              {/* The dropdown stops at eight rows, so there is always a way
                  through to the full, paginated result set. */}
              <button
                type="button"
                onClick={go}
                className="w-full text-left px-4 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-amber-500 hover:bg-white/5 transition-colors"
              >
                Xem tất cả kết quả →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
