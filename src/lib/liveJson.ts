import { NextResponse } from "next/server";

/**
 * `Cache-Control` for any read that must reflect the latest write — storefront
 * and admin alike.
 *
 * Bypassing the Next Data Cache (see `lib/supabase/rest.ts`) only fixes the
 * server side. Without this header the browser disk cache — and any CDN or
 * reverse proxy in front of the container — can still replay a response from
 * before the edit. Next sends no `Cache-Control` at all on a dynamic route
 * handler, and "no header" means the browser is free to cache heuristically.
 *
 * On the admin side that is worse than a stale screen: the editors load the
 * whole sections/gallery/variants tree, let the admin edit it, then PUT the
 * whole tree back. A cached GET means edits get layered onto a stale snapshot
 * and saved over newer data.
 */
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

/**
 * Body for a 500 on a public storefront endpoint. These routes are
 * unauthenticated and query with the service-role key, so the driver's own
 * message — which names tables, columns and constraints — must not reach the
 * browser. The real error is logged server-side at each call site.
 */
export const PUBLIC_ERROR = "Không tải được dữ liệu. Vui lòng thử lại.";

/** `NextResponse.json` that no layer between Postgres and the tab may cache. */
export const liveJson = (
  body: unknown,
  init?: { status?: number },
): NextResponse =>
  NextResponse.json(body, { ...init, headers: NO_STORE_HEADERS });
