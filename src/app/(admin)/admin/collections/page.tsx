import AdminShell from "@/components/admin/AdminShell";
import { buttonVariants } from "@/components/ui/button";
import { gql } from "@/gql";
import { getClient } from "@/lib/urql";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionsColumns } from "@/features/collections";
import { DataTable } from "@/features/cms";

type AdminCollectionsPageProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

const AdminCollectionsPageQuery = gql(/* GraphQL */ `
  query AdminCollectionsPageQuery {
    collectionsCollection(orderBy: [{ title: AscNullsLast }]) {
      edges {
        node {
          __typename
          id
          ...CollectionColumnsFragment
        }
      }
    }
  }
`);

async function collectionsPage({ searchParams }: AdminCollectionsPageProps) {
  const { data } = await getClient().query(AdminCollectionsPageQuery, {});

  if (!data) return notFound();

  return (
    <AdminShell
      heading="Bộ Sưu Tập"
      description="Quản lý bộ sưu tập sản phẩm."
    >
      <section className="flex justify-end items-center pb-5 w-full">
        <Link href="/admin/collections/new" className={cn(buttonVariants())}>
          Thêm Bộ Sưu Tập
        </Link>
      </section>

      <DataTable
        columns={CollectionsColumns}
        data={data.collectionsCollection?.edges || []}
      />
    </AdminShell>
  );
}

export default collectionsPage;
