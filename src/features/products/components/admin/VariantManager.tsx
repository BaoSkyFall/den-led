"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  createVariantGroup,
  createVariantOption,
  deleteVariantGroup,
  deleteVariantOption,
  reorderVariantGroups,
  updateVariantGroup,
  updateVariantOption,
} from "@/_actions/variants";
import { DEFAULT_SELECTION_MODE } from "@/features/products/selectionMode";
import { SelectVariantGroup, SelectVariantOption } from "@/lib/supabase/schema";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";

type GroupWithOptions = SelectVariantGroup & { options: SelectVariantOption[] };

type Props = { productId: string };

export default function VariantManager({ productId }: Props) {
  const [groups, setGroups] = useState<GroupWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/products-variants/${productId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setGroups(data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  function toggle(id: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addGroup() {
    startTransition(async () => {
      const group = await createVariantGroup({
        productId,
        name: "Nhóm mới",
        displayOrder: groups.length,
      });
      setGroups((prev) => [...prev, { ...group, options: [] }]);
      setExpandedGroups((prev) => new Set([...prev, group.id]));
      toast({ title: "Đã thêm nhóm variant" });
    });
  }

  function removeGroup(groupId: string) {
    startTransition(async () => {
      await deleteVariantGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      toast({ title: "Đã xóa nhóm" });
    });
  }

  function updateGroupName(groupId: string, name: string) {
    startTransition(async () => {
      await updateVariantGroup(groupId, { name });
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, name } : g)),
      );
    });
  }

  function addOption(groupId: string) {
    startTransition(async () => {
      const option = await createVariantOption({
        groupId,
        name: "Tùy chọn mới",
        price: "0",
        features: [],
        images: [],
        displayOrder: groups.find((g) => g.id === groupId)?.options.length ?? 0,
        // Sent explicitly rather than left to the column default, so a new
        // option is quantity-mode even on a database that has not had the
        // updated schema pushed.
        selectionMode: DEFAULT_SELECTION_MODE,
      });
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, options: [...g.options, option] } : g,
        ),
      );
      toast({ title: "Đã thêm option" });
    });
  }

  function removeOption(groupId: string, optionId: string) {
    startTransition(async () => {
      await deleteVariantOption(optionId);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, options: g.options.filter((o) => o.id !== optionId) }
            : g,
        ),
      );
      toast({ title: "Đã xóa option" });
    });
  }

  function updateOption(
    groupId: string,
    optionId: string,
    field: "name" | "price" | "selectionMode",
    value: string,
  ) {
    startTransition(async () => {
      await updateVariantOption(optionId, { [field]: value });
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                options: g.options.map((o) =>
                  o.id === optionId ? { ...o, [field]: value } : o,
                ),
              }
            : g,
        ),
      );
    });
  }

  // ── Drag-and-drop reorder of variant groups ──
  function moveGroup(from: number, to: number) {
    if (from === to) return;
    let nextOrder: GroupWithOptions[] = [];
    setGroups((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      nextOrder = next;
      return next;
    });
    startTransition(async () => {
      try {
        await reorderVariantGroups(nextOrder.map((g) => g.id));
      } catch {
        toast({ title: "Lỗi", description: "Không lưu được thứ tự nhóm." });
      }
    });
  }

  function resetDrag() {
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleGroupDragStart(index: number) {
    return (e: React.DragEvent) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
      // Firefox needs data attached to start a drag; also a fallback source idx.
      e.dataTransfer.setData("text/plain", String(index));
    };
  }

  function handleGroupDragOver(index: number) {
    return (e: React.DragEvent) => {
      if (dragIndex === null) return; // ignore non-group drags
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (index !== overIndex) setOverIndex(index);
    };
  }

  function handleGroupDrop(index: number) {
    return (e: React.DragEvent) => {
      if (dragIndex === null) return;
      e.preventDefault();
      const from = dragIndex;
      resetDrag();
      if (from < 0 || from >= groups.length || from === index) return;
      moveGroup(from, index);
    };
  }

  if (loading) {
    return (
      <div className="py-4 text-sm text-muted-foreground">
        Đang tải variants...
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Variant Groups</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addGroup}
          disabled={isPending}
        >
          <Plus size={14} className="mr-1" />
          Thêm nhóm
        </Button>
      </div>

      {groups.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">
          Chưa có variant group nào. Nhấn &ldquo;Thêm nhóm&rdquo; để bắt đầu.
        </p>
      )}

      {groups.map((group, index) => (
        <div
          key={group.id}
          onDragOver={handleGroupDragOver(index)}
          onDrop={handleGroupDrop(index)}
          className={`border rounded-lg overflow-hidden transition-colors ${
            dragIndex === index ? "opacity-50" : ""
          } ${
            overIndex === index && dragIndex !== index
              ? "border-amber-500 ring-1 ring-amber-500/40"
              : ""
          }`}
        >
          {/* Group header */}
          <div className="flex items-center gap-2 p-3 bg-muted/40">
            <span
              draggable
              onDragStart={handleGroupDragStart(index)}
              onDragEnd={resetDrag}
              title="Kéo để đổi thứ tự"
              className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
              <GripVertical size={14} />
            </span>
            <Input
              className="h-7 text-sm font-medium flex-1"
              defaultValue={group.name}
              onBlur={(e) => updateGroupName(group.id, e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0"
              onClick={() => toggle(group.id)}
            >
              {expandedGroups.has(group.id) ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive shrink-0"
              onClick={() => removeGroup(group.id)}
              disabled={isPending}
            >
              <Trash2 size={14} />
            </Button>
          </div>

          {/* Options */}
          {expandedGroups.has(group.id) && (
            <div className="p-3 space-y-2">
              {group.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <Input
                    className="h-8 text-sm flex-1"
                    placeholder="Tên option"
                    defaultValue={opt.name}
                    onBlur={(e) =>
                      updateOption(group.id, opt.id, "name", e.target.value)
                    }
                  />
                  <select
                    className="h-8 text-xs rounded-md border border-input bg-background px-2 shrink-0"
                    defaultValue={opt.selectionMode ?? DEFAULT_SELECTION_MODE}
                    onChange={(e) =>
                      updateOption(
                        group.id,
                        opt.id,
                        "selectionMode",
                        e.target.value,
                      )
                    }
                    title="Kiểu chọn"
                  >
                    <option value="select">Chọn</option>
                    <option value="quantity">Số lượng</option>
                  </select>
                  <Input
                    key={opt.id + "-" + String(opt.price)}
                    className="h-8 text-sm w-36"
                    placeholder="vd: 1,500,000"
                    inputMode="numeric"
                    defaultValue={
                      opt.price
                        ? new Intl.NumberFormat("en-US").format(
                            Number(String(opt.price).replace(/[^0-9]/g, "")),
                          )
                        : ""
                    }
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, "");
                      const formatted = digits
                        ? new Intl.NumberFormat("en-US").format(Number(digits))
                        : "";
                      // Reflect grouped format live without losing caret jump
                      if (e.target.value !== formatted) {
                        e.target.value = formatted;
                      }
                    }}
                    onBlur={(e) =>
                      updateOption(
                        group.id,
                        opt.id,
                        "price",
                        e.target.value.replace(/[^0-9]/g, ""),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
                    onClick={() => removeOption(group.id, opt.id)}
                    disabled={isPending}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={() => addOption(group.id)}
                disabled={isPending}
              >
                <Plus size={12} className="mr-1" />
                Thêm option
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
