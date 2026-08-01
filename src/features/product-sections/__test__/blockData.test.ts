import { parseBlockData } from "../blockData";

/**
 * Rows written before the jsonb fix hold a JSON string instead of a JSON
 * object. drizzle parsed that back so the admin looked fine, but PostgREST
 * returned the string verbatim and the storefront saw `data.url === undefined`
 * — the block rendered as nothing. Reads normalise both shapes.
 */
describe("parseBlockData", () => {
  const payload = {
    url: "https://www.tiktok.com/@a/video/7123456789012345678",
  };

  it("passes a proper object through", () => {
    expect(parseBlockData(payload)).toEqual(payload);
  });

  it("decodes a double-encoded row", () => {
    expect(parseBlockData(JSON.stringify(payload))).toEqual(payload);
  });

  it("decodes a row that was encoded more than twice", () => {
    expect(parseBlockData(JSON.stringify(JSON.stringify(payload)))).toEqual(
      payload,
    );
  });

  it("returns an empty object for values a block cannot use", () => {
    expect(parseBlockData(null)).toEqual({});
    expect(parseBlockData(undefined)).toEqual({});
    expect(parseBlockData("not json at all")).toEqual({});
    expect(parseBlockData("[1,2,3]")).toEqual({});
    expect(parseBlockData(42)).toEqual({});
  });

  it("keeps an empty object empty", () => {
    expect(parseBlockData({})).toEqual({});
    expect(parseBlockData("{}")).toEqual({});
  });
});
