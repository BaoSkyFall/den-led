export type MiniProduct = {
  id: string;
  name: string;
  slug: string;
  badge: string | null;
  price: string;
  imageKey: string | null;
  vehicleFamily: string | null;
  minVariantPrice: string | null;
};

export type RecentlyViewedEntry = {
  slug: string;
  name: string;
  imageKey: string | null;
  vehicleFamily: string | null;
  minVariantPrice: string | null;
  badge: string | null;
  viewedAt: number;
};

export const VEHICLE_FAMILY_OPTIONS = [
  { value: "sh", label: "SH" },
  { value: "air-blade", label: "Air Blade" },
  { value: "vario", label: "Vario" },
  { value: "winner", label: "Winner" },
  { value: "lead", label: "Lead" },
  { value: "vision", label: "Vision" },
  { value: "future", label: "Future" },
  { value: "other", label: "Khác" },
] as const;

export type VehicleFamily = (typeof VEHICLE_FAMILY_OPTIONS)[number]["value"];
