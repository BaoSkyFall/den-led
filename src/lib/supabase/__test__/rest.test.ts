import { createLiveRestClient, __noStoreFetch } from "../rest";

/**
 * Regression guard for the stale-storefront bug: Next.js caches un-annotated
 * GETs made through the patched global `fetch`, which froze every supabase-js
 * read behind /api/products/* at its first response. Only `cache: "no-store"`
 * opts out — `export const dynamic = "force-dynamic"` does not.
 */
describe("live Supabase REST client", () => {
  const original = global.fetch;
  let spy: jest.Mock;

  beforeEach(() => {
    // jsdom has no global Response; postgrest-js only needs these fields.
    spy = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      text: async () => "[]",
      json: async () => [],
    });
    global.fetch = spy as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = original;
  });

  // Pins the wiring, not just the helper: renaming the `global: { fetch }`
  // option would otherwise leave supabase-js on the unpatched global fetch and
  // silently restore the bug.
  it("sends real PostgREST reads with no-store", async () => {
    await createLiveRestClient().from("products").select("id");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][1]).toMatchObject({ cache: "no-store" });
  });

  it("cannot be put back on the cached path by the caller", async () => {
    await __noStoreFetch("https://example.supabase.co/rest/v1/products", {
      cache: "force-cache",
    });

    expect(spy.mock.calls[0][1].cache).toBe("no-store");
  });
});
