"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BrandTreeBrand } from "@/features/vehicle-taxonomy/types";

type TaxonomyPickerProps = {
  brands: BrandTreeBrand[];
  /** Current generationId — the only value committed to the form. */
  value: string | null;
  onChange: (generationId: string | null) => void;
};

/** Walk the tree upward from a generationId to its model and brand. */
const locate = (brands: BrandTreeBrand[], generationId: string | null) => {
  if (!generationId) return { brandId: null, modelId: null };
  for (const brand of brands) {
    for (const model of brand.models) {
      if (model.generations.some((g) => g.id === generationId)) {
        return { brandId: brand.id, modelId: model.id };
      }
    }
  }
  return { brandId: null, modelId: null };
};

/**
 * Three-step Hãng Xe -> Dòng Xe -> Đời Xe picker.
 *
 * The whole tree is passed in from the server page, so resolving an existing
 * generationId back to its brand/model is a synchronous lookup — no extra
 * request, no loading state, no race on mount.
 */
function TaxonomyPicker({ brands, value, onChange }: TaxonomyPickerProps) {
  const initial = useMemo(() => locate(brands, value), [brands, value]);

  const [brandId, setBrandId] = useState<string | null>(
    // Convenience only: pre-select the sole brand for brand-new products.
    // The step itself is never skipped.
    initial.brandId ?? (brands.length === 1 ? brands[0].id : null),
  );
  const [modelId, setModelId] = useState<string | null>(initial.modelId);

  const brand = brands.find((b) => b.id === brandId) ?? null;
  const model = brand?.models.find((m) => m.id === modelId) ?? null;

  const onBrandChange = (nextBrandId: string) => {
    setBrandId(nextBrandId);
    setModelId(null);
    onChange(null);
  };

  const onModelChange = (nextModelId: string) => {
    setModelId(nextModelId);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select value={brandId ?? undefined} onValueChange={onBrandChange}>
          <SelectTrigger aria-label="Hãng Xe">
            <SelectValue placeholder="Hãng xe" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={modelId ?? undefined}
          onValueChange={onModelChange}
          disabled={!brand}
        >
          <SelectTrigger aria-label="Dòng Xe">
            <SelectValue placeholder="Dòng xe" />
          </SelectTrigger>
          <SelectContent>
            {(brand?.models ?? []).map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value ?? undefined}
          onValueChange={(v) => onChange(v)}
          disabled={!model}
        >
          <SelectTrigger aria-label="Đời Xe">
            <SelectValue placeholder="Đời xe" />
          </SelectTrigger>
          <SelectContent>
            {(model?.generations ?? []).map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {brands.length === 0 && (
        <p className="text-xs text-amber-700">
          Chưa có hãng xe nào.{" "}
          <Link href="/admin/brands/new" className="underline">
            Thêm hãng xe
          </Link>{" "}
          trước đã.
        </p>
      )}

      {brand && brand.models.length === 0 && (
        <p className="text-xs text-amber-700">
          Hãng {brand.label} chưa có dòng xe nào.{" "}
          <Link href={`/admin/brands/${brand.id}`} className="underline">
            Thêm dòng xe
          </Link>
          .
        </p>
      )}

      {model && model.generations.length === 0 && (
        <p className="text-xs text-amber-700">
          Dòng {model.label} chưa có đời xe nào.{" "}
          <Link href={`/admin/brands/${brandId}`} className="underline">
            Thêm đời xe
          </Link>
          .
        </p>
      )}
    </div>
  );
}

export default TaxonomyPicker;
