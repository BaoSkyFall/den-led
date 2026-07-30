"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { gql, DocumentType } from "@/gql";

import ProductRowActions from "./ProductRowActions";
import ProductStatusSwitch from "./ProductStatusSwitch";

export const ProductColumnFragment = gql(/* GraphQL */ `
  fragment ProductColumnFragment on products {
    id
    name
    rating
    slug
    badge
    price
    badge
    featured
    status
    featuredImage: medias {
      id
      key
      alt
    }
    collections {
      id
      label
      slug
    }
  }
`);

const ProductsColumns: ColumnDef<{
  node: DocumentType<typeof ProductColumnFragment>;
}>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Tên Sản Phẩm</div>,
    cell: ({ row }) => {
      const product = row.original.node;

      return (
        <Link
          href={`/admin/products/${product.id}`}
          className="text-center font-medium capitalize px-3 hover:underline"
        >
          {product.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "slug",
    header: () => <div className="">Slug (Đường dẫn)</div>,
    cell: ({ row }) => {
      const product = row.original.node;

      return <div className="font-medium">{product.slug}</div>;
    },
  },
  {
    accessorKey: "Collection",
    header: () => <div className="">Danh Mục</div>,
    cell: ({ row }) => {
      const product = row.original.node;

      return (
        <div className="font-medium">
          {product.collections ? product.collections.label : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "featured",
    header: () => <div className="">Nổi Bật</div>,
    cell: ({ row }) => {
      const product = row.original.node;

      return <div className="font-medium">{`${product.featured}`}</div>;
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="">Giá (Cơ Bản)</div>,
    cell: ({ row }) => {
      const product = row.original.node;
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(Number(product.price));
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="">Trạng Thái</div>,
    cell: ({ row }) => {
      const product = row.original.node;

      return (
        <ProductStatusSwitch
          productId={product.id}
          productName={product.name}
          status={product.status}
        />
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Thao Tác</div>,
    cell: ({ row }) => {
      const product = row.original.node;

      return (
        <ProductRowActions productId={product.id} productName={product.name} />
      );
    },
  },
];

export default ProductsColumns;
