import { notFound } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import {
  BrandForm,
  ModelGenerationManager,
} from "@/features/vehicle-taxonomy/components";
import {
  getBrand,
  listModelsWithGenerations,
} from "@/features/vehicle-taxonomy/queries";

export const dynamic = "force-dynamic";

type EditBrandPageProps = {
  params: {
    brandId: string;
  };
};

async function EditBrandPage({ params: { brandId } }: EditBrandPageProps) {
  const brand = await getBrand(brandId);
  if (!brand) return notFound();

  const models = await listModelsWithGenerations(brand.id);

  return (
    <AdminShell
      heading="Chỉnh Sửa Phân loại Sản Phẩm"
      description="Cập nhật thông tin Phân loại Sản Phẩm, dòng xe và đời xe."
      showBackButton
    >
      <div className="space-y-6 max-w-4xl">
        <BrandForm brand={brand} />
        <ModelGenerationManager brandId={brand.id} models={models} />
      </div>
    </AdminShell>
  );
}

export default EditBrandPage;
