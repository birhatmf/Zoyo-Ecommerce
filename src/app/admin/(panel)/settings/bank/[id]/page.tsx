import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BankAccountForm } from "@/components/admin/bank-account-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Banka Hesabını Düzenle" };

type EditBankAccountPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBankAccountPage({ params }: EditBankAccountPageProps) {
  const { id } = await params;
  const account = await prisma.bankAccount.findUnique({ where: { id } });
  if (!account) notFound();

  return (
    <div>
      <Link
        href="/admin/settings/bank"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Banka Hesapları
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">{account.bankName}</h1>
      <div className="mt-6">
        <BankAccountForm
          defaults={{
            id: account.id,
            bankName: account.bankName,
            accountHolder: account.accountHolder,
            iban: account.iban,
            description: account.description ?? "",
            active: account.active,
            sortOrder: account.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
