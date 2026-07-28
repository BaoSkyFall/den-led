import type { SidebarNavItem } from "@/types";

export type DashboardConfig = {
  sidebarNav: SidebarNavItem[];
};

export const dashboardConfig: DashboardConfig = {
  sidebarNav: [
    {
      title: "Sản Phẩm",
      href: "/admin/products",
      icon: "cart",
      items: [],
    },
    {
      title: "Bộ Sưu Tập",
      href: "/admin/collections",
      icon: "folder",
      items: [],
    },
    {
      title: "Hình Ảnh",
      href: "/admin/medias",
      icon: "image",
      items: [],
    },
    {
      title: "Người Dùng",
      href: "/admin/users",
      icon: "user",
      items: [],
    },
    {
      title: "Đơn Hàng",
      href: "/admin/orders",
      icon: "receipt",
      items: [],
    },
  ],
};
