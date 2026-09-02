import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  createAdminUserAction,
  toggleAdminUserAction,
  updateAdminUserRoleAction,
} from "@/app/admin/(panel)/users/actions";
import { AdminUsersForm } from "@/components/admin/admin-users-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Yöneticiler" };

export default async function AdminUsersPage() {
  const admin = await requireRole("ADMIN");
  if (!admin) redirect("/admin");

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      totpEnabled: true,
      createdAt: true,
    },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="font-heading text-xl font-medium">Yöneticiler</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Admin hesaplarını yönetin. EDITOR yalnızca katalog ve içerik düzenleyebilir;
        ayarlar, kullanıcılar ve güvenlik alanlarına erişemez.
      </p>

      <section className="mt-6 rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-medium">Yeni Yönetici</h2>
        <div className="mt-4">
          <AdminUsersForm action={createAdminUserAction} />
        </div>
      </section>

      <section className="mt-8 rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Rol</th>
              <th className="px-4 py-3 font-medium">2FA</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 text-right font-medium">Rol Değiştir</th>
              <th className="px-4 py-3 text-right font-medium">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Henüz kullanıcı yok.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${
                      user.role === "ADMIN"
                        ? "border-transparent bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.totpEnabled ? (
                    <span className="text-xs text-emerald-600">Açık</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Kapalı</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.active ? (
                    <span className="inline-block rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-block rounded-full border border-destructive/20 bg-destructive/5 px-2.5 py-0.5 text-xs text-destructive">
                      Devre dışı
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {user.id === admin.id ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : (
                    <form action={updateAdminUserRoleAction} className="inline-flex gap-1">
                      <input type="hidden" name="id" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="h-7 rounded-md border border-input bg-background px-1.5 text-xs outline-none focus:border-ring"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="EDITOR">EDITOR</option>
                      </select>
                      <button
                        type="submit"
                        className="h-7 rounded-md border border-border px-2 text-xs transition-colors hover:bg-muted"
                      >
                        Uygula
                      </button>
                    </form>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {user.id === admin.id ? (
                    <span className="text-xs text-muted-foreground">Siz</span>
                  ) : (
                    <form action={toggleAdminUserAction}>
                      <input type="hidden" name="id" value={user.id} />
                      <button
                        type="submit"
                        className="text-xs underline-offset-4 hover:underline"
                      >
                        {user.active ? "Devre Dışı Bırak" : "Etkinleştir"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
