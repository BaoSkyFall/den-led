import { SidebarNav } from "@/components/admin/SidebarNav";
import { ScrollArea } from "@/components/ui/scrollArea";
import { dashboardConfig } from "@/config/dashboard";
import createServerClient from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = cookies();
  const supabase = createServerClient({ cookieStore });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto px-3 sm:px-6 lg:px-[3rem] max-w-[2500px] pt-[50px] flex flex-col md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 bg-white min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
        <ScrollArea className="py-6 pr-6 lg:py-8">
          <SidebarNav items={dashboardConfig.sidebarNav} />
        </ScrollArea>
      </aside>

      {/* Mobile nav strip */}
      <AdminMobileNav items={dashboardConfig.sidebarNav} />

      {/* Main content */}
      <main className="flex w-full flex-col overflow-hidden pt-2 md:pt-[50px] pb-24 md:pb-0 min-w-0">
        {children}
      </main>
    </div>
  );
}
