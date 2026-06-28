import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/auth/session";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminShell sessionLabel={session.email}>{children}</AdminShell>;
}
