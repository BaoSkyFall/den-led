"use client";

import { Copy, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { duplicateProductAction } from "@/_actions/products";

type ProductRowActionsProps = {
  productId: string;
  productName: string;
};

function ProductRowActions({ productId, productName }: ProductRowActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const duplicate = () => {
    startTransition(async () => {
      try {
        await duplicateProductAction(productId);
        router.refresh();
        toast({
          title: "Đã nhân bản sản phẩm",
          description: `Bản sao của "${productName}" được tạo ở trạng thái ẩn.`,
        });
      } catch {
        toast({
          title: "Có lỗi xảy ra",
          description: "Không thể nhân bản sản phẩm. Vui lòng thử lại.",
        });
      }
    });
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
    </div>
  );
}

export default ProductRowActions;
