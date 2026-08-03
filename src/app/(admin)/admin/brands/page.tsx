import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/features/cms";
import { BrandsColumns } from "@/features/vehicle-taxonomy/components";
import { listBrands } from "@/features/vehicle-taxonomy/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function AdminBrandsPage() {
  const brands = await listBrands();

  return (
    <AdminShell
      heading="Phân loại sản phẩm"
      description="Quản lý phân loại sản phẩm (Honda, Yamaha, ...)."
    >
      <section className="flex justify-end items-center pb-5 w-full">
        <Link href="/admin/brands/new" className={cn(buttonVariants())}>
          Thêm phân loại sản phẩm
        </Link>
      </section>

      <DataTable columns={BrandsColumns} data={brands} />
    </AdminShell>
  );
}

export default AdminBrandsPage;
