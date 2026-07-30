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
      title: "Danh Mục",
      href: "/admin/collections",
      icon: "folder",
      items: [],
    },
    {
      title: "Hãng Xe",
      href: "/admin/brands",
      icon: "tag",
      items: [],
    },
    {
      title: "Cấu Hình Menu",
      href: "/admin/menu",
      icon: "menu",
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
