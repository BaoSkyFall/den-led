"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { gql } from "@/gql";
import { cn, keytoUrl } from "@/lib/utils";
import { useQuery } from "@urql/next";
import { Check } from "lucide-react";
import Image from "next/image";
import { ReactNode, useState } from "react";

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

  const [{ data, fetching }] = useQuery({
    query: MediasQuery,
    variables: { first: 24, after: cursor },
    pause: !open,
  });

  const items = data?.mediasCollection?.edges ?? [];
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
    if (!next) setSelected(new Set());
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{renderTrigger}</DialogTrigger>
      <DialogContent className="max-w-[1080px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn nhiều ảnh</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Nhấn vào ảnh để chọn / bỏ chọn. Ảnh đã trong gallery được đánh dấu
            xám.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {fetching && items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Đang tải...
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Chưa có ảnh nào trong thư viện. Vào Admin → Hình Ảnh để upload.
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
                      !isExcluded && !isSelected && "border-slate-200 hover:border-slate-400",
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
                          <Check size={16} strokeWidth={3} className="text-black" />
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
                  setCursor(data.mediasCollection.pageInfo.endCursor ?? undefined)
                }
                className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 hover:border-slate-500 px-4 py-2 rounded transition-colors"
              >
                Tải thêm
              </button>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-slate-600">
              Đã chọn:{" "}
              <span className="font-bold text-amber-600">{selected.size}</span>{" "}
              ảnh
            </p>
            <div className="flex gap-2">
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
