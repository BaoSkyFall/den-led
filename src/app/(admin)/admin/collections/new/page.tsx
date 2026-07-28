import AdminShell from "@/components/admin/AdminShell";
import { CollectionForm } from "@/features/collections";

type Props = {};

async function NewProjectPage({}: Props) {
  return (
    <AdminShell
      heading="Thêm Danh Mục"
      description="Điền thông tin bên dưới rồi nhấn Thêm để tạo bộ sưu tập mới."
    >
      <CollectionForm />
    </AdminShell>
  );
}

export default NewProjectPage;
