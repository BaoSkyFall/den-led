"use client";
import { gql } from "@/gql";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { useMutation } from "@urql/next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icons } from "@/components/layouts/icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import useWishlistStore from "../useWishlistStore";

type Props = {
  productId: string;
};

const AddProductToWishList = gql(/* GraphQL */ `
  mutation AddProductToWishList($productId: String, $userId: UUID) {
    insertIntowishlistCollection(
      objects: { user_id: $userId, product_id: $productId }
    ) {
      affectedCount
      records {
        __typename
        user_id
        product_id
      }
    }
  }
`);
const RemoveWishlistItemMutation = gql(/* GraphQL */ `
  mutation RemoveWishlistItemMutation($productId: String, $userId: UUID) {
    deleteFromwishlistCollection(
      filter: {
        and: [{ user_id: { eq: $userId } }, { product_id: { eq: $productId } }]
      }
      atMost: 1
    ) {
      records {
        __typename
      }
    }
  }
`);

function AddToWishListButton({ productId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const wishlist = useWishlistStore((s) => s.wishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishItem);

  const [, addToWishlist] = useMutation(AddProductToWishList);
  const [, removeWishlistItem] = useMutation(RemoveWishlistItemMutation);
  const [pending, setPending] = useState(false);

  // Both mutations are round trips, and the heart gave no sign one was in
  // flight — so a double tap could add and immediately remove, leaving the
  // icon and the server disagreeing about what the customer saved.
  const onClickHandler = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (pending) return;

    setPending(true);
    try {
      if (wishlist[productId]) {
        const res = await removeWishlistItem({ productId, userId: user.id });
        if (res.data) toast({ title: "Đã bỏ khỏi danh sách yêu thích" });
      } else {
        const res = await addToWishlist({ productId, userId: user.id });
        if (res.data) toast({ title: "Đã thêm vào danh sách yêu thích" });
      }
      toggleWishlist(productId);
    } catch {
      toast({
        title: "Không cập nhật được danh sách",
        description: "Vui lòng thử lại.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      className="rounded-full p-3"
      variant="ghost"
      onClick={onClickHandler}
      disabled={pending}
      aria-label={
        wishlist[productId] ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"
      }
    >
      {pending ? (
        <Spinner className="w-4 h-4" />
      ) : (
        <Icons.heart
          className={cn(
            "w-4 h-4",
            wishlist[productId] ? "fill-red-600 " : "fill-none",
          )}
        />
      )}
    </Button>
  );
}

export default AddToWishListButton;
