import { ReactNode } from "react";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import SocialSidebar from "@/components/store/SocialSidebar";

type Props = { children: ReactNode };

export default function StoreLayout({ children }: Props) {
  return (
    <div className="bg-[#111111] text-gray-300 antialiased selection:bg-amber-500 selection:text-black min-h-screen flex flex-col">
      <SocialSidebar />
      <StoreHeader />
      <div className="flex-1">{children}</div>
      <StoreFooter />
    </div>
  );
}
