import AdminShell from "@/components/admin/AdminShell";
import { BrandForm } from "@/features/vehicle-taxonomy/components";

function NewBrandPage() {
  return (
    <AdminShell
      heading="Thêm Hãng Xe"
      description="Điền thông tin bên dưới rồi nhấn Thêm để tạo hãng xe mới."
      showBackButton
    >
      <BrandForm />
    </AdminShell>
  );
}

export default NewBrandPage;
