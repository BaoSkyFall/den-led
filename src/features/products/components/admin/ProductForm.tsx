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
import { Suspense, useState, useTransition } from "react";
import VariantManager from "./VariantManager";
import GalleryManager from "./GalleryManager";
import TaxonomyPicker from "./TaxonomyPicker";
import ProductSectionsEditorDialog from "@/features/product-sections/admin/ProductSectionsEditorDialog";
import type { BrandTreeBrand } from "@/features/vehicle-taxonomy/types";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { gql } from "urql";
import { ChevronDown, Save, X } from "lucide-react";

type ProductsFormProps = {
  product?: SelectProducts;
  /** Full Brand -> Model -> Generation tree, fetched by the server page. */
  brands: BrandTreeBrand[];
};

// Every collapsible section, in render order. Used by "Mở tất cả / Đóng tất cả"
// and by the invalid-submit handler that has to reveal hidden errors.
const SECTION_KEYS = [
  "basic",
  "description",
  "category",
  "pricing",
  "image",
  "gallery",
  "variants",
] as const;
function Section({
  title,
  description,
  children,
  open,
  onToggle,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full text-left px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
      >
        <span className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {/* Children stay MOUNTED and are hidden with CSS. Unmounting would reset
          the uncontrolled inputs (name/slug/rating use defaultValue) and throw
          away in-progress Gallery/Variant/Sections edits. */}
      <div className={cn("p-5 space-y-5", !open && "hidden")}>{children}</div>
    </section>
  );
}

function ProductForm({ product, brands }: ProductsFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  // All sections start collapsed — an absent key means closed.
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  const setAllOpen = (open: boolean) =>
    setOpenMap(Object.fromEntries(SECTION_KEYS.map((key) => [key, open])));
  const allOpen = SECTION_KEYS.every((key) => openMap[key]);

  const form = useForm<InsertProducts>({
    resolver: zodResolver(createInsertSchema(products)),
    defaultValues: {
      ...product,
      status: product?.status ?? "active",
      // Seeded explicitly so Controller has a value to hold. Left undefined it
      // falls back to "" to keep the input controlled, and an empty string is a
      // key Postgres goes looking for — the save then dies on the foreign key
      // instead of storing "no vehicle class".
      generationId: product?.generationId ?? null,
      featuredImageId: product?.featuredImageId ?? null,
    },
  });

  const { register, control, handleSubmit } = form;

  const onSubmit = handleSubmit(
    async (data: InsertProducts) => {
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
    },
    // Collapsed sections hide their own validation errors, so Save would look
    // like it silently did nothing. Reveal everything instead.
    () => {
      setAllOpen(true);
      toast({ title: "Vui lòng kiểm tra lại các trường bắt buộc" });
    },
  );

  return (
    <Form {...form}>
      <form
        id="project-form"
        onSubmit={onSubmit}
        className="pb-24 lg:pb-8 space-y-5 max-w-4xl"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setAllOpen(!allOpen)}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
          >
            {allOpen ? "Đóng tất cả" : "Mở tất cả"}
          </button>
        </div>

        {/* Basic info */}
        <Section
          title="Thông Tin Cơ Bản"
          description="Tên, đường dẫn và mô tả sản phẩm"
          open={!!openMap.basic}
          onToggle={() => toggleSection("basic")}
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

        {/* Blog-style product description — opens in a fullscreen dialog to
            give the editor real estate without fighting the outer form scroll */}
        {product && (
          <Section
            title="Mô Tả Sản Phẩm (Blog-style)"
            description="Chỉnh sửa trong dialog toàn màn hình để có nhiều không gian, không đụng scroll của form ngoài."
            open={!!openMap.description}
            onToggle={() => toggleSection("description")}
          >
            <ProductSectionsEditorDialog productId={product.id} />
          </Section>
        )}

        {/* Categorization */}
        <Section
          title="Phân Loại"
          description="Phân loại xe, trạng thái và tags"
          open={!!openMap.category}
          onToggle={() => toggleSection("category")}
        >
          <BadgeSelectField name="badge" label={""} />

          <FormField
            control={form.control}
            name="generationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phân Loại Xe *</FormLabel>
                <TaxonomyPicker
                  brands={brands}
                  value={field.value ?? null}
                  onChange={field.onChange}
                />
                <FormDescription>
                  Chọn Hãng -&gt; Dòng xe -&gt; Đời xe. Dùng cho menu và sản
                  phẩm đề xuất.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng Thái</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? "active"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Đang hiển thị</SelectItem>
                    <SelectItem value="inactive">Đang ẩn</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Ẩn sản phẩm khỏi menu mà không cần tắt cả đời xe.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
          open={!!openMap.pricing}
          onToggle={() => toggleSection("pricing")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => {
                const raw = String(field.value ?? "").replace(/[^0-9]/g, "");
                const formatted = raw
                  ? new Intl.NumberFormat("en-US").format(Number(raw))
                  : "";
                return (
                  <FormItem>
                    <FormLabel>Giá Cơ Bản (VND)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        aria-invalid={!!form.formState.errors.price}
                        placeholder="vd: 1,500,000"
                        value={formatted}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(digits);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      Dùng khi sản phẩm chưa có variant. Có variant sẽ hiển thị
                      giá thấp nhất. Không có giới hạn tiền triệu / tỷ.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

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
          open={!!openMap.image}
          onToggle={() => toggleSection("image")}
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
            open={!!openMap.gallery}
            onToggle={() => toggleSection("gallery")}
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
            open={!!openMap.variants}
            onToggle={() => toggleSection("variants")}
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
