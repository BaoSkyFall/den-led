import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { ProductForm } from "@/features/products";
import { getBrandTree } from "@/features/vehicle-taxonomy/queries";
import db from "@/lib/supabase/db";

async function NewProjectPage() {
  const products = await db.query.products.findMany();
  if (!products) return notFound();

  const brands = await getBrandTree();

  return (
    <AdminShell
      heading="Thêm Sản Phẩm"
      description="Điền thông tin bên dưới rồi nhấn Thêm để lưu sản phẩm."
    >
      <Suspense>
        <ProductForm brands={brands} />
      </Suspense>
    </AdminShell>
  );
}

export default NewProjectPage;
