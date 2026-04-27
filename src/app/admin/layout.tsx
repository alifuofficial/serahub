import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <AdminLayoutClient user={session}>
      {children}
    </AdminLayoutClient>
  );
}