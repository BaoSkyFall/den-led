"use client";

import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import {
  reorderGenerationsAction,
  reorderModelsAction,
  setGenerationActiveAction,
  setModelActiveAction,
} from "../../actions";
import type { MenuConfigModel } from "../../types";

type MenuConfigEditorProps = {
  tree: MenuConfigModel[];
};

const swap = <T,>(list: T[], a: number, b: number): T[] => {
  const next = [...list];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
};

/**
 * Curate-only menu editor: reorder + show/hide for Models and Generations.
 *
 * Deliberately NOT here: creating/deleting nodes, renaming, custom grouping,
 * and Brand itself (brand is context only, it never appears in the public
 * menu). Hiding is derived at query time — toggling a generation never writes
 * anything onto its products.
 */
function MenuConfigEditor({ tree }: MenuConfigEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<MenuConfigModel[]>(tree);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Re-seed after router.refresh() brings fresh server data.
  useEffect(() => setItems(tree), [tree]);

  const commit = (optimistic: MenuConfigModel[], fn: () => Promise<unknown>) => {
    const previous = items;
    setItems(optimistic);
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch {
        setItems(previous);
        toast({
          title: "Có lỗi xảy ra",
          description: "Không thể lưu thay đổi. Vui lòng thử lại.",
        });
      }
    });
  };

  const moveModel = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = swap(items, index, target);
    commit(next, () => reorderModelsAction(next.map((m) => m.id)));
  };

  const moveGeneration = (
    modelIndex: number,
    genIndex: number,
    direction: -1 | 1,
  ) => {
    const model = items[modelIndex];
    const target = genIndex + direction;
    if (target < 0 || target >= model.generations.length) return;

    const reordered = swap(model.generations, genIndex, target);
    const next = items.map((m, i) =>
      i === modelIndex ? { ...m, generations: reordered } : m,
    );
    commit(next, () =>
      reorderGenerationsAction(
        model.id,
        reordered.map((g) => g.id),
      ),
    );
  };

  const toggleModel = (modelIndex: number) => {
    const model = items[modelIndex];
    const isActive = !model.isActive;
    const next = items.map((m, i) => (i === modelIndex ? { ...m, isActive } : m));
    commit(next, () => setModelActiveAction(model.id, isActive));
  };

  const toggleGeneration = (modelIndex: number, genIndex: number) => {
    const generation = items[modelIndex].generations[genIndex];
    const isActive = !generation.isActive;
    const next = items.map((m, i) =>
      i === modelIndex
        ? {
            ...m,
            generations: m.generations.map((g, j) =>
              j === genIndex ? { ...g, isActive } : g,
            ),
          }
        : m,
    );
    commit(next, () => setGenerationActiveAction(generation.id, isActive));
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Chưa có dòng xe nào. Thêm dòng xe ở trang{" "}
        <Link href="/admin/brands" className="underline">
          Hãng Xe
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="space-y-3 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Ẩn một dòng xe sẽ ẩn luôn toàn bộ đời xe và sản phẩm bên dưới khỏi
          menu. Sản phẩm không bị thay đổi — bật lại là hiện y như cũ.
        </p>
        {isPending && (
          <Spinner className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        )}
      </div>

      <ul className="space-y-2">
        {items.map((model, modelIndex) => {
          const open = !!expanded[model.id];

          return (
            <li
              key={model.id}
              className={cn(
                "border border-slate-200 rounded-lg overflow-hidden bg-white",
                !model.isActive && "opacity-60",
              )}
            >
              <div className="flex items-center gap-2 px-3 py-2.5">
                <div className="flex flex-col shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1"
                    disabled={isPending || modelIndex === 0}
                    onClick={() => moveModel(modelIndex, -1)}
                    aria-label={`Đưa ${model.label} lên trên`}
                  >
                    <ChevronUp size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1"
                    disabled={isPending || modelIndex === items.length - 1}
                    onClick={() => moveModel(modelIndex, 1)}
                    aria-label={`Đưa ${model.label} xuống dưới`}
                  >
                    <ChevronDown size={14} />
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [model.id]: !prev[model.id],
                    }))
                  }
                  aria-expanded={open}
                  className="flex items-center gap-2 min-w-0 flex-1 text-left"
                >
                  <ChevronDown
                    size={14}
                    className={cn(
                      "shrink-0 text-slate-400 transition-transform",
                      open && "rotate-180",
                    )}
                  />
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    {model.label}
                  </span>
                  {/* Brand is context only — no toggle, no reorder. */}
                  <span className="text-xs text-slate-400 shrink-0">
                    {model.brandLabel}
                  </span>
                  <span className="text-xs text-slate-400 shrink-0">
                    · {model.generations.length} đời xe
                  </span>
                </button>

                <Link
                  href={`/admin/brands/${model.brandId}`}
                  className="text-xs text-slate-500 hover:text-slate-900 hover:underline shrink-0 px-2"
                >
                  Sửa
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => toggleModel(modelIndex)}
                  className="inline-flex items-center gap-1.5 shrink-0"
                >
                  {model.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  {model.isActive ? "Hiện" : "Ẩn"}
                </Button>
              </div>

              {open && (
                <div className="border-t border-slate-200 divide-y divide-slate-100">
                  {model.generations.length === 0 && (
                    <p className="px-3 py-2.5 pl-12 text-xs text-slate-500">
                      Chưa có đời xe nào.
                    </p>
                  )}

                  {model.generations.map((generation, genIndex) => (
                    <div
                      key={generation.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 pl-9",
                        !generation.isActive && "opacity-60",
                      )}
                    >
                      <div className="flex flex-col shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1"
                          disabled={isPending || genIndex === 0}
                          onClick={() => moveGeneration(modelIndex, genIndex, -1)}
                          aria-label={`Đưa ${generation.label} lên trên`}
                        >
                          <ChevronUp size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1"
                          disabled={
                            isPending ||
                            genIndex === model.generations.length - 1
                          }
                          onClick={() => moveGeneration(modelIndex, genIndex, 1)}
                          aria-label={`Đưa ${generation.label} xuống dưới`}
                        >
                          <ChevronDown size={14} />
                        </Button>
                      </div>

                      <span className="text-sm text-slate-800 truncate">
                        {generation.label}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">
                        {generation.productCount} sản phẩm
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => toggleGeneration(modelIndex, genIndex)}
                        className="inline-flex items-center gap-1.5 shrink-0 ml-auto"
                      >
                        {generation.isActive ? (
                          <Eye size={14} />
                        ) : (
                          <EyeOff size={14} />
                        )}
                        {generation.isActive ? "Hiện" : "Ẩn"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MenuConfigEditor;
