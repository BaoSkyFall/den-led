export type MiniProduct = {
  id: string;
  name: string;
  slug: string;
  badge: string | null;
  price: string;
  imageKey: string | null;
  minVariantPrice: string | null;
};

export type RecentlyViewedEntry = {
  slug: string;
  name: string;
  imageKey: string | null;
  minVariantPrice: string | null;
  badge: string | null;
  viewedAt: number;
};
