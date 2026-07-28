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
    <>
      {/* Mobile: horizontal scroll tab bar below header */}
      <div className="md:hidden sticky top-[56px] z-20 bg-white border-b overflow-x-auto">
        <div className="flex items-center gap-1 px-3 py-2 min-w-max">
          {items.map((item) => {
            const Icon = Icons[item.icon ?? "chevronLeft"];
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.title}</span>
              </Link>
            ) : null;
          })}
        </div>
      </div>

      {/* Tablet/mobile bottom fixed dock (md and below) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t md:hidden">
        <div className="flex items-center justify-around px-2 py-1">
          {items.slice(0, 5).map((item) => {
            const Icon = Icons[item.icon ?? "chevronLeft"];
            const isActive =
              pathname === item.href ||
              pathname.startsWith((item.href ?? "") + "/");
            return item.href ? (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md transition-colors min-w-0",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive && "text-foreground",
                  )}
                />
                <span className="text-[9px] font-medium leading-none truncate max-w-[52px] text-center">
                  {item.title}
                </span>
              </Link>
            ) : null;
          })}
        </div>
      </nav>
    </>
  );
}
