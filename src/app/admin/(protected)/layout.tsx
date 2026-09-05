import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";
import AdminNav from "./AdminNav";
import { EloceLogo } from "@/components/EloceLogo";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (session) {
    const user = await prisma.adminUser.findUnique({ where: { id: session.sub } });
    if (user?.mustChangePassword) {
      redirect("/admin/trocar-senha");
    }
    if (user && !user.isActive) {
      redirect("/admin/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-eloca-bg">
      <aside className="w-64 flex-shrink-0 bg-eloca-navy px-4 py-6 text-white">
        <div className="mb-8 px-2">
          <EloceLogo variant="light" className="h-9 w-auto" />
        </div>
        <AdminNav />
        <div className="mt-8 px-2">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
