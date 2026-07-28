import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = { className?: string };

function Branding({ className }: Props) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 align-middle", className)}
    >
      <Image
        src="/logo.png"
        alt="Sân Chơi Đèn Led"
        width={48}
        height={42}
        priority
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}

export default Branding;
