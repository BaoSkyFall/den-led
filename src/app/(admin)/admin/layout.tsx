import { SidebarNav } from "@/components/admin/SidebarNav";
import { dashboardConfig } from "@/config/dashboard";
import createServerClient from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
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
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar — fixed to viewport, below the top navbar */}
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-56 lg:w-64 bg-white border-r border-slate-200 overflow-y-auto z-30">
        <div className="px-4 py-6">
          <SidebarNav items={dashboardConfig.sidebarNav} />
        </div>
      </aside>

      {/* Mobile bottom nav dock */}
      <AdminMobileNav items={dashboardConfig.sidebarNav} />

      {/* Main content — offset by navbar (top) and sidebar (left on desktop) */}
      <main className="pt-20 md:pt-24 pb-24 md:pb-8 md:pl-56 lg:pl-64">
        <div className="px-4 md:px-8 lg:px-10 max-w-[1600px] mx-auto min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
