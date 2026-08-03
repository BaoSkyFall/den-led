import AdminShell from "@/components/admin/AdminShell";
import { BrandForm } from "@/features/vehicle-taxonomy/components";

function NewBrandPage() {
  return (
    <AdminShell
      heading="Thêm phân loại sản phẩm"
      description="Điền thông tin bên dưới rồi nhấn Thêm để tạo phân loại sản phẩm mới."
      showBackButton
    >
      <BrandForm />
    </AdminShell>
  );
}

export default NewBrandPage;
