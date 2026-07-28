import React, { ReactNode } from "react";
import { Icons } from "../layouts/icons";
import Link from "next/link";
import { Button } from "../ui/button";
import BackButton from "../layouts/BackButton";

type AdminShellProps = {
  heading: string;
  description: string;
  showBackButton?: boolean;
  children: ReactNode;
};

function AdminShell({
  heading,
  description,
  showBackButton,
  children,
}: AdminShellProps) {
  return (
    <section className="w-full min-w-0">
      <div className="flex gap-x-3 mb-5 pb-3 border-b">
        {showBackButton && <BackButton />}
        <div className="flex justify-between items-center w-full min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold mb-2 leading-tight truncate">
              {heading}
            </h1>
            <p className="text-zinc-500 text-sm leading-tight line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}

export default AdminShell;
