"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { setProductStatusAction } from "@/_actions/products";

type ProductStatusSwitchProps = {
  productId: string;
  productName: string;
  status: string;
};

/**
 * Inline Active/Inactive toggle. An inactive product disappears from the home
 * grid, /shop and the storefront menu — it is not deleted.
 */
function ProductStatusSwitch({
  productId,
  productName,
  status,
}: ProductStatusSwitchProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(status === "active");

  // Re-seed after router.refresh() brings fresh server data.
  useEffect(() => setIsActive(status === "active"), [status]);

  const toggle = (next: boolean) => {
    setIsActive(next);
    startTransition(async () => {
      try {
        await setProductStatusAction(productId, next ? "active" : "inactive");
        router.refresh();
      } catch {
        setIsActive(!next);
        toast({
          title: "Có lỗi xảy ra",
          description: "Không thể đổi trạng thái sản phẩm. Vui lòng thử lại.",
        });
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        onCheckedChange={toggle}
        disabled={isPending}
        title={isActive ? "Đang hiển thị" : "Đang ẩn"}
        aria-label={`Trạng thái của ${productName}`}
      />
      <span className="text-xs text-slate-500 whitespace-nowrap">
        {isActive ? "Đang hiển thị" : "Đang ẩn"}
      </span>
    </div>
  );
}

export default ProductStatusSwitch;
