/**
 * @jest-environment node
 */
import { stripMediaRefs } from "../productValues";

/**
 * Duplicating a product carries no images across. Blocks keep their text and
 * layout; only the pointer at a media row is dropped, so the copy shows an
 * empty picture slot instead of silently sharing the original's photo.
 */
describe("stripMediaRefs", () => {
  it("drops the media pointer from an image block but keeps the rest", () => {
    expect(
      stripMediaRefs({
        mediaId: "med_1",
        caption: "Sau khi độ",
        align: "center",
      }),
    ).toEqual({ caption: "Sau khi độ", align: "center" });
  });

  it("drops both sides of a before/after block", () => {
    expect(
      stripMediaRefs({
        leftMediaId: "med_a",
        rightMediaId: "med_b",
        leftLabel: "Trước độ",
        rightLabel: "Sau độ",
      }),
    ).toEqual({ leftLabel: "Trước độ", rightLabel: "Sau độ" });
  });

  it("leaves a block with no media untouched", () => {
    const paragraph = { html: "<p>Xin chào</p>" };
    expect(stripMediaRefs(paragraph)).toEqual(paragraph);
  });

  it("does not mutate the block it was given", () => {
    const original = { mediaId: "med_1", caption: "giữ nguyên" };
    stripMediaRefs(original);
    expect(original.mediaId).toBe("med_1");
  });

  it("returns an empty object for anything that is not a block payload", () => {
    expect(stripMediaRefs(null)).toEqual({});
    expect(stripMediaRefs(undefined)).toEqual({});
    expect(stripMediaRefs("mediaId")).toEqual({});
    expect(stripMediaRefs([{ mediaId: "x" }])).toEqual({});
  });
});
