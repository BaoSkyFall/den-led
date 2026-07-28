"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarNavItem } from "@/types";
import { Icons } from "../layouts/icons";
import { cn } from "@/lib/utils";

type Props = { items: SidebarNavItem[] };

export default function AdminMobileNav({ items }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-1 py-1.5">
        {items.slice(0, 5).map((item) => {
          if (!item.href) return null;
          const Icon = Icons[item.icon ?? "chevronLeft"];
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-1.5 rounded-md transition-colors min-w-0",
                isActive
                  ? "text-amber-600"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              <Icon
                className={cn("h-5 w-5 shrink-0", isActive && "text-amber-600")}
              />
              <span
                className={cn(
                  "text-[10px] leading-none truncate max-w-full px-1",
                  isActive ? "font-bold" : "font-medium",
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
