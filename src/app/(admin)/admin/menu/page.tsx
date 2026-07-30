import AdminShell from "@/components/admin/AdminShell";
import { MenuConfigEditor } from "@/features/vehicle-taxonomy/components";
import { getMenuConfigTree } from "@/features/vehicle-taxonomy/queries";

// Ordering must never be served stale.
export const dynamic = "force-dynamic";

async function AdminMenuPage() {
  const tree = await getMenuConfigTree();

  return (
    <AdminShell
      heading="Cấu Hình Menu"
      description="Sắp xếp thứ tự và bật/tắt hiển thị dòng xe & đời xe trên menu của trang bán hàng."
    >
      <MenuConfigEditor tree={tree} />
    </AdminShell>
  );
}

export default AdminMenuPage;
