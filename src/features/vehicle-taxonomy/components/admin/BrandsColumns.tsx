"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { SelectBrand } from "@/lib/supabase/schema";

// NOTE: brands are read with drizzle, so rows arrive as plain objects — access
// `row.original.label`, NOT `row.original.node.label` like the GraphQL-fed
// collections table does.
const BrandsColumns: ColumnDef<SelectBrand>[] = [
  {
    accessorKey: "label",
    header: () => <div className="text-left">Tên Hãng</div>,
    cell: ({ row }) => {
      const brand = row.original;

      return (
        <Link
          href={`/admin/brands/${brand.id}`}
          className="font-medium px-3 hover:underline"
        >
          {brand.label}
        </Link>
      );
    },
  },
  {
    accessorKey: "slug",
    header: () => <div className="text-left">Slug</div>,
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.slug}</div>
    ),
  },
  {
    accessorKey: "displayOrder",
    header: () => <div className="text-left">Thứ Tự</div>,
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.displayOrder}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Thao Tác</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Link
          href={`/admin/brands/${row.original.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Chỉnh Sửa
        </Link>
      </div>
    ),
  },
];

export default BrandsColumns;
