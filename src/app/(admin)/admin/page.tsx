import { redirect } from "next/navigation";

async function AdminPage() {
  redirect("/admin/products");
}

export default AdminPage;
