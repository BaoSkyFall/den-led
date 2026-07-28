import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CustomProvider from "../providers/CustomProvider";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Sân Chơi Đèn LED | Độ Đèn LED Xe Máy Cao Cấp",
  description: "Dịch vụ độ đèn LED xe máy cao cấp - SH, Air Blade, Vario",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={montserrat.variable}>
      <CustomProvider>
        <body className={montserrat.className}>
          {children}
          <Toaster />
        </body>
      </CustomProvider>
    </html>
  );
}
