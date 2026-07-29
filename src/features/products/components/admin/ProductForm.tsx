"use client";

import { createProductAction, updateProductAction } from "@/_actions/products";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useTransition } from "react";
import VariantManager from "./VariantManager";
import GalleryManager from "./GalleryManager";
import ProductSectionsEditor from "@/features/product-sections/admin/ProductSectionsEditor";
import { useForm } from "react-hook-form";
import { gql } from "urql";
import { Save, X } from "lucide-react";

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

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <header className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </header>
      <div className="p-5 space-y-5">{children}</div>
    </section>
  );
}

function ProductForm({ product }: ProductsFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const [{ data }] = useQuery({ query: ProductFormQuery });

  const form = useForm<InsertProducts>({
    resolver: zodResolver(createInsertSchema(products)),
    defaultValues: { ...product },
  });

  const { register, control, handleSubmit } = form;

  const onSubmit = handleSubmit(async (data: InsertProducts) => {
    startTransition(async () => {
      try {
        product
          ? await updateProductAction(product.id, data)
          : await createProductAction(data);

        toast({
          title: product ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm mới",
          description: data.name,
        });

        router.push("/admin/products");
        router.refresh();
      } catch (err) {
        toast({
          title: "Có lỗi xảy ra",
          description: "Không thể lưu sản phẩm. Vui lòng thử lại.",
        });
      }
    });
  });

  return (
    <Form {...form}>
      <form
        id="project-form"
        onSubmit={onSubmit}
        className="pb-24 lg:pb-8 space-y-5 max-w-4xl"
      >
        {/* Basic info */}
        <Section
          title="Thông Tin Cơ Bản"
          description="Tên, đường dẫn và mô tả sản phẩm"
        >
          <FormItem>
            <FormLabel>Tên Sản Phẩm *</FormLabel>
            <FormControl>
              <Input
                aria-invalid={!!form.formState.errors.name}
                placeholder="vd: SH 2026 Độ Đèn Bi Cầu"
                {...register("name")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Slug (đường dẫn URL) *</FormLabel>
            <FormControl>
              <Input
                defaultValue={product?.slug}
                aria-invalid={!!form.formState.errors.slug}
                placeholder="vd: sh-2026"
                {...register("slug")}
              />
            </FormControl>
            <FormDescription>
              Đường dẫn hiển thị trên URL: /shop/
              <span className="text-slate-700 font-medium">slug</span>
            </FormDescription>
            <FormMessage />
          </FormItem>

        </Section>

        {/* Blog-style product description */}
        {product && (
          <Section
            title="Mô Tả Sản Phẩm (Blog-style)"
            description="Chia mô tả thành nhiều section, mỗi section có nhiều block: tiêu đề, đoạn văn, ảnh, YouTube, danh sách, bảng thông số, FAQ..."
          >
            <ProductSectionsEditor productId={product.id} />
          </Section>
        )}

        {/* Categorization */}
        <Section
          title="Phân Loại"
          description="Bộ sưu tập, nhãn hiển thị và tags"
        >
          <Suspense>
            {data && data.collectionsCollection && (
              <FormField
                control={control}
                name={"collectionId"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh Mục</FormLabel>
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
                      Nhóm sản phẩm vào một bộ sưu tập.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </Suspense>

          <BadgeSelectField name="badge" label={""} />

          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <TagsField name={"tags"} defaultValue={product?.tags || []} />
            </FormControl>
            <FormDescription>
              Nhập từ khoá rồi nhấn Enter để thêm.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </Section>

        {/* Pricing & rating */}
        <Section
          title="Giá & Đánh Giá"
          description="Giá cơ bản (fallback) và điểm đánh giá hiển thị"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormItem>
              <FormLabel>Giá Cơ Bản (VND)</FormLabel>
              <FormControl>
                <Input
                  defaultValue={product?.price}
                  aria-invalid={!!form.formState.errors.price}
                  placeholder="0"
                  {...register("price")}
                />
              </FormControl>
              <FormDescription>
                Dùng khi sản phẩm chưa có variant. Có variant sẽ hiển thị giá
                thấp nhất.
              </FormDescription>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>Đánh Giá (0–5) *</FormLabel>
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
          </div>
        </Section>

        {/* Featured image */}
        <Section
          title="Ảnh Đại Diện"
          description="Ảnh chính hiển thị trên card và làm ảnh mặc định"
        >
          <FormField
            control={form.control}
            name="featuredImageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ảnh Đại Diện *</FormLabel>
                <Suspense>
                  <ImageDialog
                    defaultValue={product?.featuredImageId}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </Suspense>
                <FormDescription>
                  Kéo thả ảnh vào hoặc chọn từ thư viện.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* Gallery — only for existing products */}
        {product?.id && (
          <Section
            title="Gallery Ảnh Sản Phẩm"
            description="Nhiều ảnh hiển thị trong trang chi tiết. Ảnh đầu tiên là ảnh lớn nhất."
          >
            <Suspense
              fallback={
                <p className="text-xs text-muted-foreground">Đang tải...</p>
              }
            >
              <GalleryManager productId={product.id} />
            </Suspense>
          </Section>
        )}

        {/* Variants — only for existing products */}
        {product?.id && (
          <Section
            title="Gói Dịch Vụ (Variants)"
            description="Quản lý các gói dịch vụ và mức giá cho sản phẩm này"
          >
            <Suspense
              fallback={
                <p className="text-xs text-muted-foreground">Đang tải...</p>
              }
            >
              <VariantManager productId={product.id} />
            </Suspense>
          </Section>
        )}

        {/* Sticky action bar */}
        <div className="fixed bottom-14 md:bottom-0 left-0 right-0 md:left-auto md:right-auto md:relative z-30 border-t md:border md:rounded-lg bg-white shadow-lg md:shadow-none">
          <div className="max-w-4xl mx-auto px-4 md:px-5 py-3 flex items-center justify-end gap-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X size={14} />
              Huỷ
            </Link>
            <Button
              type="submit"
              form="project-form"
              disabled={isPending}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-2 shadow-sm"
            >
              {isPending ? (
                <Spinner className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save size={14} />
              )}
              {product ? "Lưu Thay Đổi" : "Tạo Sản Phẩm"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default ProductForm;
