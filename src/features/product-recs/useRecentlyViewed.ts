"use client";

import { useCallback, useEffect, useState } from "react";
import type { RecentlyViewedEntry } from "./types";

const KEY = "dev-recently-viewed-v1";
const MAX_ITEMS = 20;
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function read(): RecentlyViewedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentlyViewedEntry[];
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter(
      (e) =>
        e &&
        typeof e.slug === "string" &&
        typeof e.viewedAt === "number" &&
        now - e.viewedAt <= TTL_MS,
    );
  } catch {
    return [];
  }
}

function write(items: RecentlyViewedEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded / disabled — silently ignore
  }
}

export function useRecentlyViewed(): {
  items: RecentlyViewedEntry[];
  track: (entry: Omit<RecentlyViewedEntry, "viewedAt">) => void;
  clear: () => void;
} {
  const [items, setItems] = useState<RecentlyViewedEntry[]>([]);

  useEffect(() => {
    setItems(read());
  }, []);

  const track = useCallback(
    (entry: Omit<RecentlyViewedEntry, "viewedAt">) => {
      if (!entry?.slug) return;
      const now = Date.now();
      const next: RecentlyViewedEntry = { ...entry, viewedAt: now };
      const current = read();
      const deduped = current.filter((e) => e.slug !== entry.slug);
      const list = [next, ...deduped].slice(0, MAX_ITEMS);
      write(list);
      setItems(list);
    },
    [],
  );

  const clear = useCallback(() => {
    write([]);
    setItems([]);
  }, []);

  return { items, track, clear };
}
