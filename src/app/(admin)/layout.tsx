import { getCurrentUser, isAdmin } from "@/features/users/actions";
import Navbar from "@/components/layouts/MainNavbar";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

type Props = { children: ReactNode };

async function AdminLayout({ children }: Props) {
  const currentUser = await getCurrentUser();

  if (!isAdmin(currentUser))
    redirect(`/sign-in?error=Only authenticated users can access`);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar adminLayout={true} />
      {children}
    </main>
  );
}

export default AdminLayout;
