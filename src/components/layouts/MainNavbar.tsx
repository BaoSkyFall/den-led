import { cn } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { CartLink, CartNav } from "../../features/carts";
import { UserNav } from "@/features/auth";
import { Icons } from "./icons";
import Branding from "./Branding";
import MobileNavbar from "./MobileNavbar";
import SearchInput from "./SearchInput";
import { SideMenu } from "./SideMenu";

interface MainNavbarProps {
  adminLayout?: boolean;
}

async function MainNavbar({ adminLayout = false }: MainNavbarProps) {
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 border-b",
        adminLayout
          ? "bg-white border-slate-200"
          : "bg-background/95 border-transparent",
      )}
    >
      <div
        className={cn(
          "h-full",
          adminLayout ? "mx-auto px-4 md:px-8 max-w-[2500px]" : "container",
        )}
      >
        <div className="hidden md:flex h-full gap-x-8 justify-between items-center">
          {/* Menu & branding */}
          <div className="flex gap-x-3 items-center">
            {!adminLayout && <SideMenu />}
            <Branding />
          </div>

          {adminLayout ? (
            <></>
          ) : (
            <Suspense>
              <SearchInput />
            </Suspense>
          )}

          {/* Nav Action */}
          <div className="flex gap-x-5 relative items-center">
            <Suspense>
              <UserNav />
            </Suspense>

            {!adminLayout && (
              <Link href={"/wish-list"}>
                <Icons.heart className="w-4 h-4" aria-label="wishlist" />
              </Link>
            )}

            <Suspense fallback={<CartLink productCount={0} />}>
              {!adminLayout && <CartNav />}
            </Suspense>
          </div>
        </div>

        <MobileNavbar adminLayout={adminLayout} />
      </div>
    </nav>
  );
}

export default MainNavbar;
