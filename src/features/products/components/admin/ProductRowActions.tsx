"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import DeleteDialog from "@/components/ui/deleteDialog";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  deleteProductAction,
  duplicateProductAction,
  type DeleteProductFailure,
} from "@/_actions/products";

type ProductRowActionsProps = {
  productId: string;
  productName: string;
};

// Lives client-side: a server action's thrown message is redacted in production
// builds, so the reason travels as a code and the copy is resolved here.
const DELETE_FAILURE_COPY: Record<DeleteProductFailure, string> = {
  in_order:
    "Sản phẩm đã có trong đơn hàng nên không thể xoá. Hãy chuyển sang trạng thái ẩn để gỡ khỏi cửa hàng.",
  not_found: "Không tìm thấy sản phẩm này. Có thể nó đã bị xoá trước đó.",
};

function ProductRowActions({ productId, productName }: ProductRowActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Plain state, not `useTransition`: on React 18 the transition scope ends at the
  // first `await`, so its pending flag drops back to false while the server action
  // is still running — the spinner only blinks and `disabled` guards nothing.
  //
  // The ref is the actual re-entry guard. Radix keeps the dialog mounted (and
  // clickable) through its 200ms close animation, so "Xoá vĩnh viễn" can be
  // double-clicked; a ref flips synchronously, before React re-renders, where a
  // state update would not. Without it the second call deletes nothing and drops a
  // "not found" toast on top of the success one.
  const inFlight = useRef(false);

  const duplicate = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsPending(true);
    try {
      await duplicateProductAction(productId);
      router.refresh();
      toast({
        title: "Đã nhân bản sản phẩm",
        description: `Bản sao của "${productName}" được tạo ở trạng thái ẩn.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Có lỗi xảy ra",
        description: "Không thể nhân bản sản phẩm. Vui lòng thử lại.",
      });
    } finally {
      inFlight.current = false;
      setIsPending(false);
    }
  };

  const remove = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsDeleting(true);
    try {
      const result = await deleteProductAction(productId);

      if (result.status !== "deleted") {
        toast({
          variant: "destructive",
          title: "Không thể xoá sản phẩm",
          description: DELETE_FAILURE_COPY[result.status],
        });
        return;
      }

      router.refresh();
      toast({
        title: "Đã xoá sản phẩm",
        description: `"${productName}" đã bị xoá vĩnh viễn.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Không thể xoá sản phẩm",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    } finally {
      inFlight.current = false;
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <Link
        href={`/admin/products/${productId}`}
        title="Chỉnh sửa"
        className={cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0")}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Chỉnh sửa {productName}</span>
      </Link>

      <Button
        type="button"
        variant="ghost"
        className="h-8 w-8 p-0"
        disabled={isPending}
        onClick={duplicate}
        title="Nhân bản"
      >
        {isPending ? (
          <Spinner className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        <span className="sr-only">Nhân bản {productName}</span>
      </Button>

      <DeleteDialog
        onClickHandler={remove}
        title="Xoá sản phẩm này?"
        description={`"${productName}" sẽ bị xoá vĩnh viễn cùng toàn bộ ảnh, mô tả và các gói dịch vụ của nó. Thao tác này không thể hoàn tác — nếu chỉ muốn gỡ khỏi cửa hàng, hãy chuyển sang trạng thái ẩn.`}
        cancelLabel="Huỷ"
        actionLabel="Xoá vĩnh viễn"
        trigger={
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isDeleting}
            title="Xoá"
          >
            {isDeleting ? (
              <Spinner className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="sr-only">Xoá {productName}</span>
          </Button>
        }
      />
    </div>
  );
}

export default ProductRowActions;
