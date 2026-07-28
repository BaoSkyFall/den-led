"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  createVariantGroup,
  createVariantOption,
  deleteVariantGroup,
  deleteVariantOption,
  updateVariantGroup,
  updateVariantOption,
} from "@/_actions/variants";
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
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/products-variants/${productId}`)
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
    field: "name" | "price",
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

      {groups.map((group) => (
        <div key={group.id} className="border rounded-lg overflow-hidden">
          {/* Group header */}
          <div className="flex items-center gap-2 p-3 bg-muted/40">
            <GripVertical
              size={14}
              className="text-muted-foreground shrink-0"
            />
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
                  <Input
                    className="h-8 text-sm w-32"
                    placeholder="Giá (VND)"
                    defaultValue={String(opt.price)}
                    type="number"
                    onBlur={(e) =>
                      updateOption(group.id, opt.id, "price", e.target.value)
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
