import { buildNavGroups, type RawNavBrand } from "../navColumns";

/** A brand whose models each hold the named products. */
const brand = (
  over: Partial<RawNavBrand> & { id: string; label: string; slug: string },
  models: {
    label: string;
    slug: string;
    group?: string;
    products?: string[];
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
        products: (m.products ?? ["SP"]).map((name, j) => ({
          id: `${over.id}-m${i}-p${j}`,
          name,
          slug: `${m.slug}-${j}`,
        })),
      },
    ],
  })),
});

const names = (products: { name: string }[]) => products.map((p) => p.name);

describe("buildNavGroups", () => {
  it("puts each heading on the bar with its own sections", () => {
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
    expect(groups.map((g) => g.sections.map((s) => s.label))).toEqual([
      ["SH"],
      ["Pha Đèn"],
      ["Pat Inox"],
    ]);
  });

  it("lists the products themselves under each type", () => {
    const [vehicles] = buildNavGroups([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        {
          label: "Vario",
          slug: "vario",
          products: ["Vario 160", "Vario 2018"],
        },
      ]),
    ]);

    expect(names(vehicles.sections[0].products)).toEqual([
      "Vario 160",
      "Vario 2018",
    ]);
  });

  it("links the type to its filtered list and each product to its page", () => {
    const [vehicles] = buildNavGroups([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { label: "SH", slug: "sh", products: ["SH 2026"] },
      ]),
    ]);

    expect(vehicles.href).toBe("/shop?group=dong-xe");
    expect(vehicles.sections[0].href).toBe("/shop?model=sh");
    expect(vehicles.sections[0].products[0].href).toBe("/shop/sh-0");
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

  it("percent-encodes a model slug so it cannot inject a parameter", () => {
    const [vehicles] = buildNavGroups([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { label: "SH", slug: "a&b=c" },
      ]),
    ]);

    expect(vehicles.sections[0].href).toBe("/shop?model=a%26b%3Dc");
  });

  it("gathers Dòng Xe from every vehicle brand", () => {
    const [vehicles] = buildNavGroups([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { label: "SH", slug: "sh" },
      ]),
      brand({ id: "b2", label: "Vinfast", slug: "vinfast" }, [
        { label: "VF3", slug: "vf3" },
      ]),
    ]);

    expect(vehicles.sections.map((s) => s.label)).toEqual(["SH", "VF3"]);
  });

  it("gathers a heading from every accessory brand carrying that group", () => {
    const [lights] = buildNavGroups([
      brand({ id: "b1", label: "Đồ Đúc", slug: "-c", is_accessory: true }, [
        { label: "Pha Đèn", slug: "pha-den", group: "den" },
      ]),
      brand({ id: "b2", label: "Bi Cầu", slug: "bc", is_accessory: true }, [
        { label: "Đèn Hậu", slug: "den-hau", group: "den" },
      ]),
    ]);

    expect(lights.sections.map((s) => s.label)).toEqual(["Pha Đèn", "Đèn Hậu"]);
  });

  it("drops a type with nothing in stock", () => {
    // Hộp In 3D and Hộp Nhôm in the real data: models with zero active
    // products, which would otherwise render as a heading over nothing.
    const [linhKien] = buildNavGroups([
      brand({ id: "b1", label: "Bi Cầu", slug: "bc", is_accessory: true }, [
        { label: "Pat Inox", slug: "pat-inox", group: "linh-kien" },
        {
          label: "Hộp In 3D",
          slug: "hop-3d",
          group: "linh-kien",
          products: [],
        },
      ]),
    ]);

    expect(linhKien.sections.map((s) => s.label)).toEqual(["Pat Inox"]);
  });

  it("omits a heading left with no sections rather than opening an empty panel", () => {
    const groups = buildNavGroups([
      brand({ id: "b1", label: "Honda", slug: "honda" }, [
        { label: "SH", slug: "sh" },
      ]),
      brand({ id: "b2", label: "Bi Cầu", slug: "bc", is_accessory: true }, [
        {
          label: "Hộp In 3D",
          slug: "hop-3d",
          group: "linh-kien",
          products: [],
        },
      ]),
    ]);

    expect(groups.map((g) => g.key)).toEqual(["dong-xe"]);
  });

  it("returns nothing at all for an empty tree", () => {
    expect(buildNavGroups([])).toEqual([]);
  });

  it("ignores an accessory model whose group is unrecognised", () => {
    expect(
      buildNavGroups([
        brand({ id: "b1", label: "Đồ Đúc", slug: "-c", is_accessory: true }, [
          { label: "Thứ lạ", slug: "la", group: "khong-biet" },
        ]),
      ]),
    ).toEqual([]);
  });
});
