"use client";

import { createProductAction, updateProductAction } from "@/_actions/products";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import TagsField from "@/components/ui/tagsField";
import { useToast } from "@/components/ui/use-toast";
import { BadgeSelectField } from "@/features/cms";
import { ImageDialog } from "@/features/medias";
import {
  InsertProducts,
  SelectProducts,
  products,
} from "@/lib/supabase/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@urql/next";
import { createInsertSchema } from "drizzle-zod";
import RichTextEditor from "@/components/ui/RichTextEditor";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useTransition } from "react";
import VariantManager from "./VariantManager";
import { useForm } from "react-hook-form";
import { gql } from "urql";

type ProductsFormProps = {
  product?: SelectProducts;
};
export const ProductFormQuery = gql(/* GraphQL */ `
  query ProductFormQuery {
    collectionsCollection(orderBy: [{ label: AscNullsLast }]) {
      __typename
      edges {
        node {
          id
          label
        }
      }
    }
  }
`);

function ProductFrom({ product }: ProductsFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const [{ data }] = useQuery({
    query: ProductFormQuery,
  });

  const form = useForm<InsertProducts>({
    resolver: zodResolver(createInsertSchema(products)),
    defaultValues: { ...product },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = handleSubmit(async (data: InsertProducts) => {
    startTransition(async () => {
      try {
        product
          ? await updateProductAction(product.id, data)
          : await createProductAction(data);

        router.push("/admin/products");
        router.refresh();

        toast({
          title: `Product is ${product ? "updated" : "created"}.`,
          description: `${data.name}`,
        });
      } catch (err) {
        // console.log("unexpected Error Occured")
      }
    });
  });

  console.log("!!data", data);
  return (
    <Form {...form}>
      <form
        id="project-form"
        className="gap-x-5 flex gap-y-5 flex-col px-3"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col gap-y-5 max-w-[500px]">
          <FormItem>
            <FormLabel className="text-sm">Tên Sản Phẩm*</FormLabel>
            <FormControl>
              <Input
                aria-invalid={!!form.formState.errors.name}
                placeholder="Nhập tên sản phẩm."
                {...register("name")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className="text-sm">Slug (đường dẫn)*</FormLabel>
            <FormControl>
              <Input
                defaultValue={product?.slug}
                aria-invalid={!!form.formState.errors.slug}
                placeholder="vd: sh-2026"
                {...register("slug")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Mô Tả Sản Phẩm</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Nhập mô tả sản phẩm (hỗ trợ định dạng)..."
                  />
                </FormControl>
                <FormDescription>
                  Hỗ trợ in đậm, nghiêng, tiêu đề, danh sách, và link.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <FormLabel>Featured*</FormLabel>
                  <Checkbox
                    defaultChecked={false}
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>

                <FormDescription>
                  You can manage your mobile notifications in the{" "}
                </FormDescription>
              </FormItem>
            )}
          /> */}
          <Suspense>
            {data && data.collectionsCollection && (
              <FormField
                control={control}
                name={"collectionId"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bộ Sưu Tập</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn bộ sưu tập" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {data.collectionsCollection.edges.map(
                          ({ node: collection }) => (
                            <SelectItem
                              value={collection.id}
                              key={collection.id}
                            >
                              {collection.label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Chọn bộ sưu tập cho sản phẩm này.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </Suspense>

          <BadgeSelectField name="badge" label={""} />

          <FormItem>
            <FormLabel className="text-sm">Đánh Giá (0–5)*</FormLabel>
            <FormControl>
              <Input
                defaultValue={product?.rating}
                aria-invalid={!!form.formState.errors.rating}
                placeholder="vd: 4.5"
                {...register("rating")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className="text-sm">Tags</FormLabel>
            <FormControl>
              <TagsField name={"tags"} defaultValue={product?.tags || []} />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel className="text-sm">Giá Cơ Bản (fallback)</FormLabel>
            <FormControl>
              <Input
                defaultValue={product?.price}
                aria-invalid={!!form.formState.errors.price}
                placeholder="vd: 0 (dùng variant để đặt giá)"
                {...register("price")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="featuredImageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ảnh Đại Diện*</FormLabel>
                <Suspense>
                  <ImageDialog
                    defaultValue={product?.featuredImageId}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </Suspense>

                <FormDescription>
                  Kéo thả hoặc chọn ảnh từ thư viện hình ảnh.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="py-8 flex gap-x-5 items-center">
          <Button disabled={isPending} variant={"outline"} form="project-form">
            {product ? "Cập Nhật" : "Tạo Mới"}
            {isPending && (
              <Spinner
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
          </Button>
          <Link href="/admin/products" className={buttonVariants()}>
            Huỷ
          </Link>
        </div>
      </form>

      {/* Variant management — only available for existing products */}
      {product?.id && (
        <div className="max-w-[500px] px-3 border-t pt-6 mt-2">
          <h3 className="text-base font-semibold mb-1">Gói Dịch Vụ (Variants)</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Quản lý gói dịch vụ và các mức giá cho sản phẩm này.
          </p>
          <Suspense fallback={<p className="text-xs text-muted-foreground">Đang tải...</p>}>
            <VariantManager productId={product.id} />
          </Suspense>
        </div>
      )}
    </Form>
  );
}

export default ProductFrom;
