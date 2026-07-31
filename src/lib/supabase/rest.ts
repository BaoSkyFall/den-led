import { createClient } from "@supabase/supabase-js";

import { env } from "@/env.mjs";

/**
 * Next.js patches the global `fetch` and, inside an App Router route handler,
 * stores every un-annotated GET in its Data Cache. `export const dynamic =
 * "force-dynamic"` does NOT opt out of that: it only sets `forceDynamic`, and
 * the route module then falls back to `revalidate = false`, which patch-fetch
 * reads as "cache this forever" (`revalidate: CACHE_ONE_YEAR`).
 *
 * supabase-js issues its PostgREST reads as exactly such GETs, so a storefront
 * route built on it kept serving the snapshot taken on the very first request —
 * editing a product or its variants in admin changed nothing on the shop page.
 * Admin routes were unaffected because drizzle talks Postgres over a socket and
 * never goes through `fetch`.
 *
 * Forcing `no-store` on the request is what actually opts out.
 */
const noStoreFetch: typeof fetch = (input, init) =>
  // `cache` is spread last on purpose: a caller must not be able to put the
  // storefront back on the stale path.
  fetch(input, { ...init, cache: "no-store" });

/**
 * Supabase REST client for live storefront reads — never served from the Next
 * Data Cache. Named for that guarantee: the routes below are the ones an admin
 * edit has to reach immediately, and swapping this for a plain `createClient`
 * silently reintroduces the year-long staleness described above.
 *
 * Reads with the service-role key, so it is server-only.
 */
export const createLiveRestClient = () =>
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.DATABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  });

/** Exported for the regression test that pins the `no-store` behaviour. */
export const __noStoreFetch = noStoreFetch;
