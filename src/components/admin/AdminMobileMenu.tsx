"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { SidebarNavItem } from "@/types";
import { Icons } from "../layouts/icons";
import { cn } from "@/lib/utils";
import { dashboardConfig } from "@/config/dashboard";

export default function AdminMobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items: SidebarNavItem[] = dashboardConfig.sidebarNav;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở menu quản trị"
        className="inline-flex items-center justify-center w-9 h-9 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
                Quản Trị
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng menu"
                className="inline-flex items-center justify-center w-9 h-9 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
              {items.map((item) => {
                if (!item.href) return null;
                const Icon = Icons[item.icon ?? "chevronLeft"];
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-amber-50 text-amber-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    <Icon
                      className={cn(
                        "mr-2.5 h-4 w-4 shrink-0",
                        isActive ? "text-amber-600" : "text-slate-400",
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
