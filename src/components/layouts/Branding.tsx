import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type Props = { className?: string };

function Branding({ className }: Props) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 align-middle", className)}
    >
      <span className="w-9 h-9 bg-amber-500 flex flex-col items-center justify-center px-1">
        <span className="text-[7px] tracking-widest font-bold text-black leading-none text-center">
          SÂN CHƠI
        </span>
        <span className="text-[9px] tracking-tight font-black text-black leading-none text-center">
          ĐÈN LED
        </span>
      </span>
      <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">
        Sân Chơi Đèn Led
      </span>
    </Link>
  );
}

export default Branding;
