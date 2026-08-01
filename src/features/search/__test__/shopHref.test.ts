import { pageItems, shopHref } from "../components/ShopPageContent";

describe("shopHref", () => {
  it("returns a bare /shop when nothing is filtered", () => {
    expect(shopHref({})).toBe("/shop");
    expect(shopHref({ brand: null, q: "", page: 1 })).toBe("/shop");
  });

  it("omits page 1 so the first page has one canonical URL", () => {
    expect(shopHref({ brand: "honda", page: 1 })).toBe("/shop?brand=honda");
    expect(shopHref({ brand: "honda", page: 2 })).toBe(
      "/shop?brand=honda&page=2",
    );
  });

  it("keeps the brand and the search term together", () => {
    expect(shopHref({ brand: "honda", q: "Vario", page: 3 })).toBe(
      "/shop?brand=honda&q=Vario&page=3",
    );
  });

  it("encodes values that would otherwise break the query string", () => {
    // "Đồ Đúc" slugifies to "-c" today, but a brand named with an ampersand or
    // a space must not be able to inject a second parameter.
    expect(shopHref({ brand: "a&b=c" })).toBe("/shop?brand=a%26b%3Dc");
    expect(shopHref({ q: "bi cầu" })).toBe("/shop?q=bi+c%E1%BA%A7u");
  });
});

describe("pageItems", () => {
  it("lists every page while there are few", () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(2, 2)).toEqual([1, 2]);
    expect(pageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("windows around the current page once the list grows", () => {
    expect(pageItems(5, 20)).toEqual([1, null, 4, 5, 6, null, 20]);
  });

  it("does not open a gap right next to the ends", () => {
    expect(pageItems(2, 20)).toEqual([1, 2, 3, null, 20]);
    expect(pageItems(19, 20)).toEqual([1, null, 18, 19, 20]);
  });

  it("never repeats the first or last page inside the window", () => {
    for (const current of [1, 2, 10, 19, 20]) {
      const numbers = pageItems(current, 20).filter(
        (p): p is number => p !== null,
      );
      expect(new Set(numbers).size).toBe(numbers.length);
    }
  });
});
