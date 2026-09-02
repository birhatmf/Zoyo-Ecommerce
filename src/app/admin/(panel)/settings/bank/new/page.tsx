import type { Metadata } from "next";
import Link from "next/link";

import { BankAccountForm } from "@/components/admin/bank-account-form";

export const metadata: Metadata = { title: "Yeni Banka Hesabı" };

export default function NewBankAccountPage() {
  return (
    <div>
      <Link
        href="/admin/settings/bank"
        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Banka Hesapları
      </Link>
      <h1 className="mt-1 font-heading text-xl font-medium">Yeni Banka Hesabı</h1>
      <div className="mt-6">
        <BankAccountForm />
      </div>
    </div>
  );
}
