"use client";

import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/ui/deleteDialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import type { SelectGeneration, SelectModel } from "@/lib/supabase/schema";
import { cn, slugify } from "@/lib/utils";

import {
  createGenerationAction,
  createModelAction,
  deleteGenerationAction,
  deleteModelAction,
  updateGenerationAction,
  updateModelAction,
} from "../../actions";

type ModelWithGenerations = SelectModel & { generations: SelectGeneration[] };

type ModelGenerationManagerProps = {
  brandId: string;
  models: ModelWithGenerations[];
};

type Draft = { label: string; slug: string };

const emptyDraft: Draft = { label: "", slug: "" };

/**
 * Model + Generation CRUD for one brand.
 *
 * This lives on the brand detail page on purpose: "Cấu Hình Menu" is
 * curate-only (reorder + show/hide), so creating, renaming and deleting
 * taxonomy nodes has to happen here.
 */
function ModelGenerationManager({
  brandId,
  models,
}: ModelGenerationManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [modelDraft, setModelDraft] = useState<Draft>(emptyDraft);
  const [generationDrafts, setGenerationDrafts] = useState<
    Record<string, Draft>
  >({});
  const [editing, setEditing] = useState<{ kind: "model" | "generation"; id: string } | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);

  const run = (fn: () => Promise<unknown>, successTitle: string) => {
    startTransition(async () => {
      try {
        await fn();
        toast({ title: successTitle });
        router.refresh();
      } catch {
        toast({
          title: "Có lỗi xảy ra",
          description: "Không thể lưu thay đổi. Vui lòng thử lại.",
        });
      }
    });
  };

  const getGenerationDraft = (modelId: string) =>
    generationDrafts[modelId] ?? emptyDraft;

  const setGenerationDraft = (modelId: string, draft: Draft) =>
    setGenerationDrafts((prev) => ({ ...prev, [modelId]: draft }));

  const startEdit = (
    kind: "model" | "generation",
    row: { id: string; label: string; slug: string },
  ) => {
    setEditing({ kind, id: row.id });
    setEditDraft({ label: row.label, slug: row.slug });
  };

  const onAddModel = () => {
    const label = modelDraft.label.trim();
    if (!label) return;
    const slug = modelDraft.slug.trim() || slugify(label);

    run(async () => {
      // No displayOrder here on purpose: model ordering is global across
      // brands, so the next slot is computed server-side in createModelAction.
      await createModelAction({ brandId, label, slug });
      setModelDraft(emptyDraft);
    }, "Đã thêm dòng xe");
  };

  const onAddGeneration = (model: ModelWithGenerations) => {
    const draft = getGenerationDraft(model.id);
    const label = draft.label.trim();
    if (!label) return;
    const slug = draft.slug.trim() || slugify(label);

    run(async () => {
      await createGenerationAction({
        modelId: model.id,
        label,
        slug,
        displayOrder: model.generations.length + 1,
      });
      setGenerationDraft(model.id, emptyDraft);
    }, "Đã thêm đời xe");
  };

  const onSaveEdit = () => {
    if (!editing) return;
    const label = editDraft.label.trim();
    const slug = editDraft.slug.trim() || slugify(label);
    if (!label) return;

    const { kind, id } = editing;
    run(async () => {
      if (kind === "model") {
        await updateModelAction(id, { label, slug });
      } else {
        await updateGenerationAction(id, { label, slug });
      }
      setEditing(null);
    }, kind === "model" ? "Đã cập nhật dòng xe" : "Đã cập nhật đời xe");
  };

  const isEditing = (kind: "model" | "generation", id: string) =>
    editing?.kind === kind && editing.id === id;

  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <header className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900">
            Dòng Xe &amp; Đời Xe
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thêm, đổi tên và xoá dòng xe / đời xe của hãng này. Thứ tự và ẩn/hiện
            được chỉnh ở trang Cấu Hình Menu.
          </p>
        </div>
        {isPending && (
          <Spinner className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        )}
      </header>

      <div className="p-5 space-y-4">
        {models.length === 0 && (
          <p className="text-sm text-slate-500">
            Hãng này chưa có dòng xe nào. Thêm dòng xe đầu tiên bên dưới.
          </p>
        )}

        <ul className="space-y-3">
          {models.map((model) => {
            const open = !!expanded[model.id];
            const genDraft = getGenerationDraft(model.id);

            return (
              <li
                key={model.id}
                className="border border-slate-200 rounded-md overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/70">
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
                    {isEditing("model", model.id) ? (
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {model.label}
                      </span>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {model.label}
                        </span>
                        <span className="text-xs text-slate-400 truncate">
                          /{model.slug}
                        </span>
                        {!model.isActive && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 shrink-0">
                            Đang ẩn
                          </span>
                        )}
                      </>
                    )}
                    <span className="text-xs text-slate-400 ml-auto shrink-0">
                      {model.generations.length} đời xe
                    </span>
                  </button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => startEdit("model", model)}
                    aria-label={`Sửa dòng xe ${model.label}`}
                  >
                    <Pencil size={14} />
                  </Button>
                  <DeleteDialog
                    onClickHandler={() =>
                      run(() => deleteModelAction(model.id), "Đã xoá dòng xe")
                    }
                    title={`Xoá dòng xe "${model.label}"?`}
                    description="Toàn bộ đời xe thuộc dòng xe này cũng sẽ bị xoá. Sản phẩm sẽ mất phân loại xe (không bị xoá). Thao tác không thể hoàn tác."
                    cancelLabel="Huỷ"
                    actionLabel="Xoá"
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        aria-label={`Xoá dòng xe ${model.label}`}
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </Button>
                    }
                  />
                </div>

                {isEditing("model", model.id) && (
                  <div className="px-3 py-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                    <Input
                      value={editDraft.label}
                      placeholder="Tên dòng xe"
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, label: e.target.value }))
                      }
                    />
                    <Input
                      value={editDraft.slug}
                      placeholder="Slug"
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, slug: e.target.value }))
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={isPending}
                      onClick={onSaveEdit}
                    >
                      Lưu
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing(null)}
                    >
                      Huỷ
                    </Button>
                  </div>
                )}

                {open && (
                  <div className="px-3 py-3 border-t border-slate-200 space-y-2">
                    {model.generations.length === 0 && (
                      <p className="text-xs text-slate-500">
                        Chưa có đời xe nào.
                      </p>
                    )}

                    {model.generations.map((generation) => (
                      <div key={generation.id} className="space-y-2">
                        <div className="flex items-center gap-2 pl-5">
                          <span className="text-sm text-slate-800 truncate">
                            {generation.label}
                          </span>
                          <span className="text-xs text-slate-400 truncate">
                            /{generation.slug}
                          </span>
                          {!generation.isActive && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 shrink-0">
                              Đang ẩn
                            </span>
                          )}
                          <div className="ml-auto flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isPending}
                              onClick={() => startEdit("generation", generation)}
                              aria-label={`Sửa đời xe ${generation.label}`}
                            >
                              <Pencil size={14} />
                            </Button>
                            <DeleteDialog
                              onClickHandler={() =>
                                run(
                                  () => deleteGenerationAction(generation.id),
                                  "Đã xoá đời xe",
                                )
                              }
                              title={`Xoá đời xe "${generation.label}"?`}
                              description="Sản phẩm thuộc đời xe này sẽ mất phân loại xe (không bị xoá). Thao tác không thể hoàn tác."
                              cancelLabel="Huỷ"
                              actionLabel="Xoá"
                              trigger={
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={isPending}
                                  aria-label={`Xoá đời xe ${generation.label}`}
                                >
                                  <Trash2
                                    size={14}
                                    className="text-red-500"
                                  />
                                </Button>
                              }
                            />
                          </div>
                        </div>

                        {isEditing("generation", generation.id) && (
                          <div className="pl-5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                            <Input
                              value={editDraft.label}
                              placeholder="Tên đời xe"
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...d,
                                  label: e.target.value,
                                }))
                              }
                            />
                            <Input
                              value={editDraft.slug}
                              placeholder="Slug"
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...d,
                                  slug: e.target.value,
                                }))
                              }
                            />
                            <Button
                              type="button"
                              size="sm"
                              disabled={isPending}
                              onClick={onSaveEdit}
                            >
                              Lưu
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditing(null)}
                            >
                              Huỷ
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="pl-5 pt-2 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <Input
                        value={genDraft.label}
                        placeholder="Tên đời xe mới (vd: SH 2026)"
                        onChange={(e) =>
                          setGenerationDraft(model.id, {
                            ...genDraft,
                            label: e.target.value,
                          })
                        }
                      />
                      <Input
                        value={genDraft.slug}
                        placeholder="Slug (tự động nếu để trống)"
                        onChange={(e) =>
                          setGenerationDraft(model.id, {
                            ...genDraft,
                            slug: e.target.value,
                          })
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending || !genDraft.label.trim()}
                        onClick={() => onAddGeneration(model)}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        Thêm Đời Xe
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center">
          <Input
            value={modelDraft.label}
            placeholder="Tên dòng xe mới (vd: SH)"
            onChange={(e) =>
              setModelDraft((d) => ({ ...d, label: e.target.value }))
            }
          />
          <Input
            value={modelDraft.slug}
            placeholder="Slug (tự động nếu để trống)"
            onChange={(e) =>
              setModelDraft((d) => ({ ...d, slug: e.target.value }))
            }
          />
          <Button
            type="button"
            disabled={isPending || !modelDraft.label.trim()}
            onClick={onAddModel}
            className="inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            Thêm Dòng Xe
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ModelGenerationManager;
