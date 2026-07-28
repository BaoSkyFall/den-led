"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarNavItem } from "@/types";

import { cn } from "@/lib/utils";
import { Icons } from "../layouts/icons";

export interface SidebarNavProps {
  items: SidebarNavItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  if (!items?.length) return null;

  return (
    <div className="flex w-full flex-col gap-1">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 px-3 pb-2 mb-1 border-b border-slate-100">
        Quản Trị
      </p>
      {items.map((item, index) => {
        const Icon = Icons[item.icon ?? "chevronLeft"];
        const isActive =
          item.href &&
          (pathname === item.href || pathname.startsWith(item.href + "/"));

        return item.href ? (
          <Link
            key={index}
            href={item.href}
            target={item.external ? "_blank" : ""}
            rel={item.external ? "noreferrer" : ""}
          >
            <span
              className={cn(
                "group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-amber-50 text-amber-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                item.disabled && "pointer-events-none opacity-60",
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
            </span>
          </Link>
        ) : (
          <span
            key={index}
            className="flex w-full cursor-not-allowed items-center rounded-md p-2 text-slate-400 text-sm"
          >
            {item.title}
          </span>
        );
      })}
    </div>
  );
}
