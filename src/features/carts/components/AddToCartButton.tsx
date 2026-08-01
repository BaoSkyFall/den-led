"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";

import { Icons } from "@/components/layouts/icons";
import { Button, ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import useCartActions from "../hooks/useCartActions";

interface AddToCartButtonProps extends ButtonProps {
  productId: string;
  quantity?: number;
  cartId?: string;
}

function AddToCartButton({ productId, quantity = 1 }: AddToCartButtonProps) {
  const { user } = useAuth();
  const { addProductToCart } = useCartActions(user, productId);
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  // The button used to fire and say nothing at all, so a second impatient
  // click on a slow connection queued a second write. Disabling while a write
  // is in flight is what prevents that; the spinner is what explains why.
  const onClick = async () => {
    if (pending) return;
    setPending(true);
    try {
      await addProductToCart(quantity);
      toast({ title: "Đã thêm vào giỏ" });
    } catch {
      toast({
        title: "Không thêm được vào giỏ",
        description: "Vui lòng thử lại.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      className="rounded-full p-0 h-8 w-8"
      onClick={onClick}
      disabled={pending}
      aria-label="Thêm vào giỏ"
    >
      {pending ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <Icons.basket className="h-5 w-5 md:h-4 md:w-4" />
      )}
    </Button>
  );
}

export default AddToCartButton;
