"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { gql } from "@/gql";
import { cn, keytoUrl } from "@/lib/utils";
import { useQuery } from "@urql/next";
import { Check, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { ReactNode, useEffect, useRef, useState } from "react";
import { uploadImagesViaSignedUrl } from "../uploadImages";

// One screenful of the library per request. The grid accumulates pages, so this
// is a fetch size, not a ceiling on how many images an admin can pick.
const PAGE_SIZE = 48;

const MediasQuery = gql(/* GraphQL */ `
  query MultiImageDialogMediasQuery($first: Int, $after: Cursor) {
    mediasCollection(
      first: $first
      after: $after
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          key
          alt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

type Props = {
  onConfirm: (mediaIds: string[]) => void;
  excludeIds?: string[];
  renderTrigger: ReactNode;
};

export default function MultiImageDialog({
  onConfirm,
  excludeIds = [],
  renderTrigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [{ data, fetching }, refetch] = useQuery({
    query: MediasQuery,
    variables: { first: PAGE_SIZE, after: cursor },
    pause: !open,
  });

  const page = data?.mediasCollection?.edges;

  // "Tải thêm" moves the cursor, and urql hands back only that page — so the
  // grid used to be *replaced* by the next 24 rather than grown. An admin could
  // never see, let alone select, more than one page at a time. Pages accumulate
  // here instead, keyed by media id so a refetch after an upload cannot double
  // up a row that is already on screen.
  const [loadedPages, setLoadedPages] = useState<
    Map<string, NonNullable<typeof page>[number]>
  >(new Map());

  useEffect(() => {
    if (!page) return;
    setLoadedPages((prev) => {
      const next = new Map(prev);
      for (const edge of page) next.set(edge.node.id, edge);
      return next;
    });
  }, [page]);

  const items = Array.from(loadedPages.values());
  const excludeSet = new Set(excludeIds);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      setOpen(false);
      return;
    }
    onConfirm(ids);
    setSelected(new Set());
    setOpen(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Start clean on the next open: keeping accumulated pages would show a
      // stale library, and keeping the cursor would resume mid-way through it.
      setSelected(new Set());
      setLoadedPages(new Map());
      setCursor(undefined);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    let errorCount = 0;
    try {
      // Signed-URL direct upload — no serverless body cap, validated client-side.
      const uploaded = await uploadImagesViaSignedUrl(Array.from(files), {
        onFileStatus: (_i, status, error) => {
          if (status === "error") {
            errorCount++;
            toast({ title: "Ảnh lỗi", description: error });
          }
        },
      });

      if (uploaded.length > 0) {
        refetch({ requestPolicy: "network-only" });
        // Auto-select uploaded medias so user can just click "Thêm"
        setSelected((prev) => {
          const next = new Set(prev);
          uploaded.forEach((m) => next.add(m.id));
          return next;
        });
        toast({
          title: `Đã upload ${uploaded.length} ảnh`,
          description: errorCount ? undefined : "Ảnh mới đã được chọn sẵn.",
        });
      }
    } catch (err) {
      toast({
        title: "Lỗi upload",
        description: (err as Error).message,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{renderTrigger}</DialogTrigger>
      <DialogContent className="max-w-[1080px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn nhiều ảnh</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Nhấn vào ảnh để chọn / bỏ chọn. Ảnh đã trong gallery được đánh dấu
            xám. Có thể upload ảnh mới từ máy tính.
          </p>
        </DialogHeader>

        <div className="flex items-center justify-between border-b pb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 border border-slate-300 hover:border-amber-500 hover:bg-amber-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Đang upload...
              </>
            ) : (
              <>
                <Upload size={14} />
                Upload từ máy tính
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground">
            Đã chọn:{" "}
            <span className="font-bold text-amber-600">{selected.size}</span>{" "}
            ảnh
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {fetching && items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Đang tải...
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Chưa có ảnh nào trong thư viện. Nhấn “Upload từ máy tính” để thêm
              ảnh.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {items.map(({ node }) => {
                const isExcluded = excludeSet.has(node.id);
                const isSelected = selected.has(node.id);
                return (
                  <button
                    key={node.id}
                    type="button"
                    disabled={isExcluded}
                    onClick={() => toggle(node.id)}
                    className={cn(
                      "relative aspect-square overflow-hidden border-2 transition-all",
                      isExcluded &&
                        "opacity-30 cursor-not-allowed border-slate-200",
                      !isExcluded &&
                        isSelected &&
                        "border-amber-500 ring-2 ring-amber-500/40",
                      !isExcluded &&
                        !isSelected &&
                        "border-slate-200 hover:border-slate-400",
                    )}
                  >
                    <Image
                      src={keytoUrl(node.key)}
                      alt={node.alt || ""}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                          <Check
                            size={16}
                            strokeWidth={3}
                            className="text-black"
                          />
                        </div>
                      </div>
                    )}
                    {isExcluded && (
                      <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1 py-0.5 uppercase tracking-wider text-center">
                        Đã có
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {data?.mediasCollection?.pageInfo?.hasNextPage && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() =>
                  setCursor(
                    data.mediasCollection.pageInfo.endCursor ?? undefined,
                  )
                }
                className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 hover:border-slate-500 px-4 py-2 rounded transition-colors"
              >
                Tải thêm
              </button>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-end w-full gap-2">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-md hover:bg-slate-100"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-black font-semibold text-sm px-5 py-2 rounded-md transition-colors"
            >
              Thêm {selected.size > 0 && `(${selected.size})`}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
