import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Bảng Điều Khiển | Sân Chơi Đèn Led",
};

export default function DashboardPage() {
  redirect("/admin/products");
}
