import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SecurityPanel } from "@/components/admin/security-panel";

export const metadata: Metadata = {
  title: "Güvenlik",
};

export default async function SecuritySettingsPage() {
  const admin = await requireAdmin();
  const record = await prisma.adminUser.findUnique({
    where: { id: admin.id },
    select: { totpEnabled: true },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-xl font-medium">Güvenlik</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Hesabınız için şifre ve iki faktörlü kimlik doğrulama (2FA) ayarları.
      </p>

      <SecurityPanel initialTotpEnabled={record?.totpEnabled ?? false} />
    </div>
  );
}
