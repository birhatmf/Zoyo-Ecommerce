import type { Metadata } from "next";
import Link from "next/link";

import { deleteBankAccountAction } from "@/app/admin/(panel)/settings/actions";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Banka Hesapları" };

function maskIban(iban: string): string {
  return `${iban.slice(0, 8)}…${iban.slice(-4)}`;
}

export default async function AdminBankAccountsPage() {
  const accounts = await prisma.bankAccount.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-xl font-medium">Banka Hesapları</h1>
        <Link
          href="/admin/settings/bank/new"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Yeni Hesap
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3 font-medium">Banka</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Hesap Sahibi</th>
              <th className="px-4 py-3 font-medium">IBAN</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Henüz banka hesabı yok.
                </td>
              </tr>
            )}
            {accounts.map((account) => (
              <tr key={account.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/settings/bank/${account.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {account.bankName}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{account.accountHolder}</td>
                <td className="px-4 py-3 font-mono text-xs">{maskIban(account.iban)}</td>
                <td className="px-4 py-3">
                  {account.active ? (
                    <span className="inline-block rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs text-primary">Aktif</span>
                  ) : (
                    <span className="inline-block rounded-full border border-destructive/20 bg-destructive/5 px-2.5 py-0.5 text-xs text-destructive">Pasif</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <ConfirmDeleteButton
                    action={deleteBankAccountAction}
                    hiddenFields={{ id: account.id }}
                    entityName={account.bankName}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
