import type { Metadata } from "next";
import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Yönetim Paneli", template: "%s | Yönetim Paneli" },
  robots: { index: false },
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Link href="/admin" className="px-3 font-heading text-base font-medium tracking-[0.18em] uppercase">
          Panel
        </Link>
        <div className="mt-8 flex flex-1 flex-col">
          <AdminNav />
          <div className="mt-auto border-t border-border pt-4">
            <p className="px-3 text-xs text-muted-foreground">{admin.email}</p>
            <div className="mt-2 px-3">
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <Link href="/admin" className="font-heading text-sm font-medium tracking-[0.18em] uppercase">
            Panel
          </Link>
          <LogoutButton compact />
        </header>
        <div className="border-b border-border bg-card lg:hidden">
          <div className="overflow-x-auto px-4 py-2">
            <AdminNavMobileWrapper />
          </div>
        </div>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

function AdminNavMobileWrapper() {
  // Mobilde yatay kaydırılabilir menü
  return (
    <div className="flex min-w-max gap-1 [&_nav]:flex [&_nav]:flex-row [&_nav]:gap-1">
      <AdminNav />
    </div>
  );
}
