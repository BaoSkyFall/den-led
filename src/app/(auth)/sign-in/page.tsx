import { type Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SigninForm } from "@/features/auth";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Đăng Nhập | Sân Chơi Đèn Led",
  description: "Đăng nhập vào trang quản trị",
};

export default function SignInPage() {
  return (
    <section>
      <Card className="border-0 shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Đăng Nhập</CardTitle>
          <CardDescription>Nhập email và mật khẩu để tiếp tục</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Suspense
            fallback={
              <div className="bg-zinc-400 animate-pulse max-w-xl w-full h-[200px]" />
            }
          >
            <SigninForm />
          </Suspense>
        </CardContent>
      </Card>
    </section>
  );
}
