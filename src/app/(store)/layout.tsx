import { ReactNode } from "react";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import SocialSidebar from "@/components/store/SocialSidebar";
import { getNavTree } from "@/features/vehicle-taxonomy";

type Props = { children: ReactNode };

export default async function StoreLayout({ children }: Props) {
  // Menu is DB-driven (Dòng Xe -> Đời Xe -> Sản phẩm), cached by the
  // "nav-taxonomy" tag so admin edits show up on the next request.
  const navModels = await getNavTree();

  return (
    <div className="bg-[#111111] text-gray-300 antialiased selection:bg-amber-500 selection:text-black min-h-screen flex flex-col">
      <SocialSidebar />
      <StoreHeader models={navModels} />
      <div className="flex-1">{children}</div>
      <StoreFooter />
    </div>
  );
}
