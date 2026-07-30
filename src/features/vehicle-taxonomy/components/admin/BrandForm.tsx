"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import DeleteDialog from "@/components/ui/deleteDialog";
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
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { type InsertBrand, type SelectBrand } from "@/lib/supabase/schema";
import { slugify } from "@/lib/utils";

import {
  createBrandAction,
  deleteBrandAction,
  updateBrandAction,
} from "../../actions";
import { brandInsertSchema } from "../../validations";

type BrandFormProps = {
  brand?: SelectBrand;
};

function BrandForm({ brand }: BrandFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<InsertBrand>({
    // `id` and `createdAt` both have defaults, so drizzle-zod marks them
    // optional — no client-side nanoid() needed here. The shared schema (not a
    // bare createInsertSchema) is what rejects an empty label/slug, matching
    // what the server action parses.
    resolver: zodResolver(brandInsertSchema),
    defaultValues: {
      label: brand?.label ?? "",
      slug: brand?.slug ?? "",
      displayOrder: brand?.displayOrder ?? 0,
    },
  });

  const { control, handleSubmit, getValues, setValue } = form;

  const onSubmit = handleSubmit((data: InsertBrand) => {
    startTransition(async () => {
      try {
        if (brand) {
          await updateBrandAction(brand.id, data);
        } else {
          await createBrandAction(data);
        }

        toast({
          title: brand ? "Đã cập nhật hãng xe" : "Đã tạo hãng xe mới",
          description: data.label,
        });

        router.push("/admin/brands");
        router.refresh();
      } catch {
        toast({
          title: "Có lỗi xảy ra",
          description: "Không thể lưu hãng xe. Vui lòng thử lại.",
        });
      }
    });
  });

  const onDelete = () => {
    if (!brand) return;
    startTransition(async () => {
      try {
        await deleteBrandAction(brand.id);
        toast({
          title: "Đã xoá hãng xe",
          description: brand.label,
        });
        router.push("/admin/brands");
        router.refresh();
      } catch {
        toast({
          title: "Có lỗi xảy ra",
          description: "Không thể xoá hãng xe. Vui lòng thử lại.",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        id="brand-form"
        onSubmit={onSubmit}
        className="flex flex-col gap-y-5"
      >
        {/* Every field is wrapped in FormField: without it, useFormField's
            default context is still truthy, so FormMessage silently renders
            nothing and validation errors would be invisible. */}
        <div className="flex flex-col gap-y-5 max-w-[500px]">
          <FormField
            control={control}
            name="label"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Tên Hãng *</FormLabel>
                <FormControl>
                  <Input
                    aria-invalid={!!fieldState.error}
                    placeholder="vd: Honda"
                    {...field}
                    value={field.value ?? ""}
                    onBlur={(e) => {
                      field.onBlur();
                      if (!getValues("slug")) {
                        setValue("slug", slugify(e.target.value), {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="slug"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Slug *</FormLabel>
                <FormControl>
                  <Input
                    aria-invalid={!!fieldState.error}
                    placeholder="vd: honda"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>
                  Tự động tạo từ tên hãng nếu để trống.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="displayOrder"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Thứ Tự Hiển Thị</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    aria-invalid={!!fieldState.error}
                    placeholder="vd: 1"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? 0}
                    // Number input emits a string; the column is an integer.
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Số nhỏ hiển thị trước. Dùng để sắp xếp danh sách hãng xe.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-x-3 items-center">
          <Button
            type="submit"
            form="brand-form"
            disabled={isPending}
            className="inline-flex items-center gap-2"
          >
            {isPending && (
              <Spinner className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {brand ? "Cập Nhật" : "Thêm"}
          </Button>
          <Link
            href="/admin/brands"
            className={buttonVariants({ variant: "outline" })}
          >
            Huỷ
          </Link>

          {brand && (
            <div className="ml-auto">
              <DeleteDialog
                onClickHandler={onDelete}
                triggerLabel="Xoá Hãng Xe"
                title="Xoá hãng xe này?"
                description="Toàn bộ dòng xe và đời xe thuộc hãng này cũng sẽ bị xoá. Sản phẩm sẽ mất phân loại xe (không bị xoá). Thao tác không thể hoàn tác."
                cancelLabel="Huỷ"
                actionLabel="Xoá"
              />
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}

export default BrandForm;
