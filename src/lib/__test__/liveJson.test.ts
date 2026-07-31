/**
 * @jest-environment node
 *
 * `next/server` needs the Web Request/Response globals, which the project-wide
 * jsdom environment does not provide.
 */
import { liveJson, PUBLIC_ERROR } from "../liveJson";

/**
 * Next sends NO `Cache-Control` at all on a dynamic route handler, and "no
 * header" lets the browser cache heuristically. Every read that has to reflect
 * the latest admin write goes through `liveJson`, so this pins the header on.
 */
describe("liveJson", () => {
  it("marks every response no-store", () => {
    const res = liveJson({ ok: true });

    expect(res.headers.get("cache-control")).toBe(
      "no-store, no-cache, must-revalidate",
    );
  });

  it("keeps the status while still sending no-store", () => {
    const res = liveJson({ error: PUBLIC_ERROR }, { status: 500 });

    expect(res.status).toBe(500);
    expect(res.headers.get("cache-control")).toBe(
      "no-store, no-cache, must-revalidate",
    );
  });

  it("serialises the body unchanged", async () => {
    const res = liveJson([{ id: "a" }, { id: "b" }]);

    await expect(res.json()).resolves.toEqual([{ id: "a" }, { id: "b" }]);
  });
});
