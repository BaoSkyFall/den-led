"use client";

import { useState } from "react";
import { LayoutList, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import ProductSectionsEditor from "./ProductSectionsEditor";

type Props = { productId: string };

export default function ProductSectionsEditorDialog({ productId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-amber-500 hover:bg-amber-50 text-slate-700 text-sm font-medium px-4 py-3 rounded-md transition-colors"
        >
          <LayoutList size={16} />
          Mở trình chỉnh sửa Sections
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-2 sm:inset-4 z-50 flex flex-col bg-white shadow-2xl rounded-lg overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3 bg-slate-50 shrink-0">
            <div>
              <DialogPrimitive.Title className="text-sm font-bold text-slate-900">
                Mô Tả Sản Phẩm (Blog-style)
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-xs text-slate-500 mt-0.5">
                Chia mô tả thành nhiều section, mỗi section chứa nhiều block:
                tiêu đề, đoạn văn, ảnh, YouTube, bảng thông số, FAQ...
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Đóng"
                className="w-8 h-8 inline-flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </DialogPrimitive.Close>
          </header>
          <div className="flex-1 overflow-y-auto p-5">
            <ProductSectionsEditor productId={productId} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
