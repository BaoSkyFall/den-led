/**
 * @jest-environment node
 *
 * The schema pulls in cuid2, which needs TextEncoder — absent from the
 * project-wide jsdom environment.
 */
import { products, sectionBlocks } from "../schema";

/**
 * Pins the write side, which is where the bug actually lived.
 *
 * drizzle's built-in json()/jsonb() types run JSON.stringify in
 * mapToDriverValue. postgres.js then stringifies a second time — drizzle
 * executes through client.unsafe(), which forces the describe-first path, so
 * the server reports the column OID back and postgres.js applies its json
 * serialiser to the string drizzle already produced. The row ends up holding a
 * JSON string instead of a JSON object, drizzle parses it back on read so the
 * admin looks fine, and PostgREST hands the string to the storefront where the
 * block renders as nothing.
 *
 * Every existing test covers the read-side normaliser. Nothing covered this,
 * which is why the corruption survived. Reverting any of these columns to
 * drizzle's json()/jsonb() fails here.
 */
describe("json columns pass values to the driver unchanged", () => {
  it.each([
    ["section_blocks.data", sectionBlocks.data, { url: "https://x/1" }],
    ["products.tags", products.tags, ["a", "b"]],
    ["products.images", products.images, ["k1.jpg"]],
  ])("%s", (_label, column, value) => {
    const sent = (
      column as { mapToDriverValue: (v: unknown) => unknown }
    ).mapToDriverValue(value);

    expect(typeof sent).not.toBe("string");
    expect(sent).toEqual(value);
  });
});
