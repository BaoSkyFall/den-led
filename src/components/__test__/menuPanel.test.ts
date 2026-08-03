import { columnsFor, panelWidth } from "../store/StoreHeader";

/**
 * The dropdown panel is absolutely positioned, so its containing block is the
 * ~80px bar item above it. A wrapping container sized against that collapses
 * to a single column no matter what `max-width` it is given — which is exactly
 * what shipped once, and why the width is computed rather than left to layout.
 */
describe("columnsFor", () => {
  it("fills three columns once there are three types", () => {
    expect(columnsFor(3)).toBe(3);
    expect(columnsFor(7)).toBe(3);
    expect(columnsFor(100)).toBe(3);
  });

  it("narrows rather than leaving empty tracks", () => {
    expect(columnsFor(1)).toBe(1);
    expect(columnsFor(2)).toBe(2);
  });

  it("never returns zero, so the panel cannot collapse", () => {
    expect(columnsFor(0)).toBe(1);
    expect(columnsFor(-1)).toBe(1);
  });
});

describe("panelWidth", () => {
  it("is wide enough for three columns plus their gaps and padding", () => {
    // 3 * 200 + 2 * 32 + 2 * 24
    expect(panelWidth(3)).toBe(712);
    expect(panelWidth(7)).toBe(712);
  });

  it("shrinks with the column count", () => {
    expect(panelWidth(1)).toBe(248);
    expect(panelWidth(2)).toBe(480);
  });

  it("always leaves room for at least one column", () => {
    expect(panelWidth(0)).toBe(248);
  });

  it("grows with columns and never shrinks along the way", () => {
    const widths = [1, 2, 3, 7].map(panelWidth);
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
  });
});
