"use client";

import { useToast } from "@/components/ui/use-toast";
import { ImageDialog } from "@/features/medias";
import { keytoUrl } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";

type GalleryItem = {
  id: string;
  mediaId: string;
  key: string;
  alt: string;
  priority: number | null;
};

type Props = { productId: string };

export default function GalleryManager({ productId }: Props) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/product-gallery/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  function persist(next: GalleryItem[]) {
    setItems(next);
    startTransition(async () => {
      const res = await fetch(`/api/product-gallery/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaIds: next.map((i) => i.mediaId) }),
      });
      if (!res.ok) {
        toast({ title: "Lỗi", description: "Không lưu được thứ tự ảnh." });
      }
    });
  }

  function addMedia(mediaId: string) {
    if (items.some((i) => i.mediaId === mediaId)) {
      toast({ title: "Ảnh đã có trong gallery" });
      return;
    }
    // Fetch media details to render immediately
    fetch(`/api/medias/${mediaId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((media) => {
        if (!media) {
          toast({ title: "Không tìm thấy ảnh" });
          return;
        }
        const next: GalleryItem[] = [
          ...items,
          {
            id: `tmp-${mediaId}`,
            mediaId,
            key: media.key,
            alt: media.alt ?? "",
            priority: items.length,
          },
        ];
        persist(next);
        toast({ title: "Đã thêm ảnh vào gallery" });
      });
  }

  function removeAt(index: number) {
    const next = items.filter((_, i) => i !== index);
    persist(next);
    toast({ title: "Đã xoá ảnh" });
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    persist(next);
  }

  if (loading) {
    return (
      <p className="text-xs text-muted-foreground py-2">Đang tải gallery...</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            {items.length} ảnh trong gallery
          </p>
          <p className="text-xs text-muted-foreground">
            Kéo mũi tên để đổi thứ tự. Ảnh đầu tiên hiển thị lớn nhất.
          </p>
        </div>
        <ImageDialog
          onChange={addMedia}
          value={undefined}
          renderTrigger={
            <button
              type="button"
              className="inline-flex items-center gap-1 border border-slate-300 hover:border-amber-500 hover:bg-amber-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              <Plus size={14} />
              Thêm Ảnh
            </button>
          }
        />
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-lg py-10 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Chưa có ảnh nào trong gallery.
          </p>
          <ImageDialog
            onChange={addMedia}
            value={undefined}
            renderTrigger={
              <button
                type="button"
                className="inline-flex items-center gap-1 border border-slate-300 hover:border-amber-500 hover:bg-amber-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-md transition-colors"
              >
                <Plus size={14} />
                Thêm ảnh đầu tiên
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <div
              key={item.mediaId}
              className="relative group border border-slate-200 rounded-md overflow-hidden bg-slate-50"
            >
              <div className="relative aspect-square">
                <Image
                  src={keytoUrl(item.key)}
                  alt={item.alt || `Ảnh ${i + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                <span className="absolute top-1.5 left-1.5 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                  #{i + 1}
                </span>
              </div>

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-2">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0 || isSaving}
                  className="w-8 h-8 bg-white/90 hover:bg-white flex items-center justify-center rounded disabled:opacity-30"
                  title="Chuyển lên"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  disabled={isSaving}
                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded disabled:opacity-30"
                  title="Xoá"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === items.length - 1 || isSaving}
                  className="w-8 h-8 bg-white/90 hover:bg-white flex items-center justify-center rounded disabled:opacity-30"
                  title="Chuyển xuống"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
