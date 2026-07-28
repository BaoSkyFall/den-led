"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useFormContext } from "react-hook-form";

type BadgeSelectFieldProps = {
  name: string;
  label: string;
};

function BadgeSelectField({ name, label }: BadgeSelectFieldProps) {
  const { setValue, control } = useFormContext();

  return (
    <FormField
      control={control}
      name="badge"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nhãn Hiển Thị</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value || undefined}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhãn (tuỳ chọn)" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>Nhãn</SelectLabel>
                <SelectItem value="new_product">Sản phẩm mới</SelectItem>
                <SelectItem value="best_sale">Bán chạy</SelectItem>
                <SelectItem value="featured">Nổi bật</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <FormDescription>
            Chọn nhãn hiển thị trên card sản phẩm (không bắt buộc).
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default BadgeSelectField;
