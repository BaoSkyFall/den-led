import { buildNavGroups, type RawNavBrand } from "../navColumns";

/** A brand whose models each hold `count` active products. */
const brand = (
  over: Partial<RawNavBrand> & { id: string; label: string; slug: string },
  models: {
    label: string;
    slug: string;
    group?: string;
    count?: number;
  }[] = [],
): RawNavBrand => ({
  ...over,
  models: models.map((m, i) => ({
    id: `${over.id}-m${i}`,
    label: m.label,
    slug: m.slug,
    group: m.group ?? null,
    generations: [
      {
        products: Array.from({ length: m.count ?? 1 }, (_, j) => ({
          id: `${over.id}-m${i}-p${j}`,
        })),
      },
    ],
  })),
});

const labels = (items: { label: string }[]) => items.map((i) => i.label);

describe("buildNavGroups", () => {
  it("lists brands under Dòng Xe and models under the accessory headings", () => {
    const groups = buildNavGroups([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { label: "SH", slug: "sh" },
      ]),
      brand({ id: "b2", label: "Đồ Đúc", slug: "-c", is_accessory: true }, [
        { label: "Pha Đèn", slug: "pha-den", group: "den" },
        { label: "Pat Inox", slug: "pat-inox", group: "linh-kien" },
      ]),
    ]);

    expect(groups.map((g) => g.label)).toEqual(["Dòng Xe", "Đèn", "Linh Kiện"]);
    // Dòng Xe answers "which bike is it for", so it lists the make itself
    // rather than the models underneath it.
    expect(labels(groups[0].items)).toEqual(["Honda"]);
    expect(labels(groups[1].items)).toEqual(["Pha Đèn"]);
    expect(labels(groups[2].items)).toEqual(["Pat Inox"]);
  });

  it("keeps the headings in their fixed order", () => {
    const groups = buildNavGroups([
      brand({ id: "b1", label: "Đồ Đúc", slug: "-c", is_accessory: true }, [
        { label: "Pat Inox", slug: "pat-inox", group: "linh-kien" },
        { label: "Pha Đèn", slug: "pha-den", group: "den" },
      ]),
      brand({ id: "b2", label: "Honda", slug: "honda" }, [
        { label: "SH", slug: "sh" },
      ]),
    ]);

    expect(groups.map((g) => g.key)).toEqual(["dong-xe", "den", "linh-kien"]);
  });

  it("makes every heading and every item a link", () => {
    const [vehicles, lights] = buildNavGroups([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { label: "SH", slug: "sh" },
      ]),
      brand({ id: "b2", label: "Đồ Đúc", slug: "-c", is_accessory: true }, [
        { label: "Pha Đèn", slug: "pha-den", group: "den" },
      ]),
    ]);

    expect(vehicles.href).toBe("/shop?group=dong-xe");
    expect(vehicles.items[0].href).toBe("/shop?brand=honda");
    expect(lights.href).toBe("/shop?group=den");
    expect(lights.items[0].href).toBe("/shop?model=pha-den");
  });

  it("percent-encodes slugs so one cannot inject a second parameter", () => {
    const [vehicles] = buildNavGroups([
      brand({ id: "b1", label: "Honda", slug: "a&b=c" }, [
        { label: "SH", slug: "sh" },
      ]),
    ]);

    expect(vehicles.items[0].href).toBe("/shop?brand=a%26b%3Dc");
  });

  it("groups models from every accessory brand under one heading", () => {
    const groups = buildNavGroups([
      brand({ id: "b1", label: "Đồ Đúc", slug: "-c", is_accessory: true }, [
        { label: "Pha Đèn", slug: "pha-den", group: "den" },
      ]),
      brand({ id: "b2", label: "Bi Cầu", slug: "bc", is_accessory: true }, [
        { label: "Đèn Hậu", slug: "den-hau", group: "den" },
      ]),
    ]);

    expect(labels(groups[0].items)).toEqual(["Pha Đèn", "Đèn Hậu"]);
  });

  it("drops a model with nothing in stock", () => {
    // Hộp In 3D and Hộp Nhôm in the real data: models with zero active
    // products, which would otherwise render as a link to an empty page.
    const [linhKien] = buildNavGroups([
      brand({ id: "b1", label: "Bi Cầu", slug: "bc", is_accessory: true }, [
        { label: "Pat Inox", slug: "pat-inox", group: "linh-kien", count: 1 },
        { label: "Hộp In 3D", slug: "hop-3d", group: "linh-kien", count: 0 },
      ]),
    ]);

    expect(labels(linhKien.items)).toEqual(["Pat Inox"]);
  });

  it("drops a brand with nothing in stock", () => {
    const groups = buildNavGroups([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { label: "SH", slug: "sh", count: 1 },
      ]),
      // Vinfast in the real data once its products were unfiled.
      brand({ id: "b2", label: "Vinfast", slug: "vinfast" }, [
        { label: "VF3", slug: "vf3", count: 0 },
      ]),
      { id: "b3", label: "Yamaha", slug: "yamaha" },
    ]);

    expect(labels(groups[0].items)).toEqual(["Honda"]);
  });

  it("omits a heading with no items rather than showing an empty one", () => {
    const groups = buildNavGroups([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { label: "SH", slug: "sh" },
      ]),
    ]);

    expect(groups.map((g) => g.key)).toEqual(["dong-xe"]);
  });

  it("returns nothing at all for an empty tree", () => {
    expect(buildNavGroups([])).toEqual([]);
  });

  it("ignores an accessory model whose group is unrecognised", () => {
    const groups = buildNavGroups([
      brand({ id: "b1", label: "Đồ Đúc", slug: "-c", is_accessory: true }, [
        { label: "Thứ lạ", slug: "la", group: "khong-biet" },
      ]),
    ]);

    expect(groups).toEqual([]);
  });
});
