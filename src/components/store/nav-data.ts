export type VehicleChild = { label: string; href: string };
export type VehicleItem = {
  label: string;
  href: string;
  children: VehicleChild[];
};

export const NAV_VEHICLES: VehicleItem[] = [
  {
    label: "SH",
    href: "/shop/sh-2026",
    children: [
      { label: "SH 2026", href: "/shop/sh-2026" },
      { label: "SH 2020", href: "/shop/sh-2020" },
    ],
  },
  {
    label: "Air Blade",
    href: "/shop/air-blade-2026",
    children: [
      { label: "Air Blade 2026", href: "/shop/air-blade-2026" },
      { label: "Air Blade 2013", href: "/shop/air-blade-2013" },
    ],
  },
  {
    label: "Vario",
    href: "/shop/vario-2026",
    children: [
      { label: "Vario 2026", href: "/shop/vario-2026" },
      { label: "Vario 2020", href: "/shop/vario-2020" },
      { label: "Vario 160", href: "/shop/vario-160" },
    ],
  },
  {
    label: "Lead",
    href: "/shop/lead-2025",
    children: [
      { label: "Lead 2025", href: "/shop/lead-2025" },
      { label: "Lead 2018", href: "/shop/lead-2018" },
    ],
  },
  { label: "Winner", href: "/shop/winner", children: [] },
  { label: "Vision", href: "/shop/vision", children: [] },
  { label: "Future", href: "/shop/future", children: [] },
  { label: "Phụ Kiện", href: "/shop/phu-kien", children: [] },
];
