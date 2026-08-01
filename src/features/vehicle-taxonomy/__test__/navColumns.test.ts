import { buildNavColumns, type RawNavBrand } from "../navColumns";
import {
  ACCESSORY_BRAND_LABEL,
  ACCESSORY_BRAND_SLUG,
  NAV_COLUMN_LIMIT,
} from "../types";

/** Wrap products in the Model -> Generation nesting the query returns. */
const brand = (
  over: Partial<RawNavBrand> & { id: string; label: string; slug: string },
  products: {
    id: string;
    name: string;
    featured?: boolean;
    created_at?: string;
  }[] = [],
): RawNavBrand => ({
  ...over,
  models: [
    {
      generations: [
        {
          products: products.map((p) => ({
            slug: p.id,
            created_at: "2026-01-01T00:00:00Z",
            ...p,
          })),
        },
      ],
    },
  ],
});

const names = (products: { name: string }[]) => products.map((p) => p.name);

describe("buildNavColumns", () => {
  it("gives each vehicle brand its own column", () => {
    const columns = buildNavColumns([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { id: "p1", name: "SH 2026" },
      ]),
      brand({ id: "b2", label: "Vinfast", slug: "vinfast" }, [
        { id: "p2", name: "VF3" },
      ]),
    ]);

    expect(columns.map((c) => c.label)).toEqual(["Honda", "Vinfast"]);
    expect(columns.every((c) => c.isAccessory)).toBe(false);
  });

  it("collapses every accessory brand into one trailing column", () => {
    const columns = buildNavColumns([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { id: "p1", name: "SH 2026" },
      ]),
      brand({ id: "b2", label: "Đồ Đúc", slug: "-c", is_accessory: true }, [
        { id: "p2", name: "Pha Đèn" },
      ]),
      brand(
        {
          id: "b3",
          label: "Phụ Kiện Bi Cầu",
          slug: "ph-kin",
          is_accessory: true,
        },
        [{ id: "p3", name: "Pat Inox" }],
      ),
    ]);

    expect(columns).toHaveLength(2);
    const accessories = columns[1];
    expect(accessories.label).toBe(ACCESSORY_BRAND_LABEL);
    expect(accessories.slug).toBe(ACCESSORY_BRAND_SLUG);
    expect(accessories.isAccessory).toBe(true);
    expect(names(accessories.products).sort()).toEqual(["Pat Inox", "Pha Đèn"]);
  });

  it("caps every column, vehicle brands included", () => {
    const many = Array.from({ length: NAV_COLUMN_LIMIT + 4 }, (_, i) => ({
      id: `p${i}`,
      name: `SP ${i}`,
    }));
    const [honda] = buildNavColumns([
      brand({ id: "b1", label: "Honda", slug: "honda" }, many),
    ]);

    expect(honda.products).toHaveLength(NAV_COLUMN_LIMIT);
    expect(honda.hasMore).toBe(true);
  });

  it("does not flag hasMore when the column exactly fills the cap", () => {
    const exact = Array.from({ length: NAV_COLUMN_LIMIT }, (_, i) => ({
      id: `p${i}`,
      name: `SP ${i}`,
    }));
    const [honda] = buildNavColumns([
      brand({ id: "b1", label: "Honda", slug: "honda" }, exact),
    ]);

    expect(honda.hasMore).toBe(false);
  });

  it("puts featured products first, then the newest", () => {
    const [honda] = buildNavColumns([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { id: "p1", name: "Cũ", created_at: "2020-01-01T00:00:00Z" },
        { id: "p2", name: "Mới", created_at: "2026-06-01T00:00:00Z" },
        {
          id: "p3",
          name: "Nổi bật nhưng cũ",
          featured: true,
          created_at: "2019-01-01T00:00:00Z",
        },
      ]),
    ]);

    expect(names(honda.products)).toEqual(["Nổi bật nhưng cũ", "Mới", "Cũ"]);
  });

  it("drops a brand with no active product", () => {
    const columns = buildNavColumns([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { id: "p1", name: "SH 2026" },
      ]),
      // Yamaha / Suzuki / Datbike in the real data: rows with no models at all.
      { id: "b2", label: "Yamaha", slug: "yamaha" },
      brand({ id: "b3", label: "Suzuki", slug: "suzuki" }, []),
    ]);

    expect(columns.map((c) => c.label)).toEqual(["Honda"]);
  });

  it("omits the accessory column entirely when nothing is in stock", () => {
    const columns = buildNavColumns([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { id: "p1", name: "SH 2026" },
      ]),
      brand({ id: "b2", label: "Đồ Đúc", slug: "-c", is_accessory: true }, []),
    ]);

    expect(columns.map((c) => c.label)).toEqual(["Honda"]);
  });

  it("returns nothing for an empty tree rather than an empty accessory column", () => {
    expect(buildNavColumns([])).toEqual([]);
  });
});
