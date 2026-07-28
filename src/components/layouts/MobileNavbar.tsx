import { Suspense } from "react";
import CartNav from "../../features/carts/components/CartNav";
import Branding from "./Branding";
import MobileSearchInput from "./MobileSearchInput";
import { SideMenu } from "./SideMenu";
import CartLink from "../../features/carts/components/CartLink";

type Props = { adminLayout: boolean };

function MobileNavbar({ adminLayout }: Props) {
  if (adminLayout) {
    // Admin mobile navbar: bottom dock provides nav, so just brand centered
    return (
      <div className="md:hidden flex items-center justify-between h-16">
        <Branding />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
          Admin
        </span>
      </div>
    );
  }

  return (
    <div className="md:hidden flex gap-x-8 justify-between items-center h-16">
      <div className="flex gap-x-3 items-center">
        <SideMenu />
        <MobileSearchInput />
      </div>

      <Branding />
      <Suspense fallback={<CartLink productCount={0} />}>
        <CartNav />
      </Suspense>
    </div>
  );
}

export default MobileNavbar;
