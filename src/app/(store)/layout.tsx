import { cookies } from "next/headers";

import { getSessionAdminId } from "@/lib/auth";
import { PREVIEW_COOKIE } from "@/lib/maintenance";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";
import { MaintenanceScreen } from "@/components/storefront/maintenance";
import { PreviewBanner } from "@/components/storefront/preview-banner";
import { WhatsappFloat } from "@/components/storefront/whatsapp-float";
import { getActiveHeroSlides } from "@/services/content.service";

export const dynamic = "force-dynamic";

async function getActiveAdmin() {
  const adminId = await getSessionAdminId();
  if (!adminId) return null;
  return prisma.adminUser.findFirst({
    where: { id: adminId, active: true },
    select: { id: true },
  });
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const maintenance = settings.maintenanceMode === "true";

  // Bakım modu herkese uygulanır; yönetici "önizleme" ile siteyi görebilir.
  if (maintenance) {
    const admin = await getActiveAdmin();
    const previewing =
      Boolean(admin) && (await cookies()).get(PREVIEW_COOKIE)?.value === "1";

    if (!previewing) {
      return <MaintenanceScreen settings={settings} canPreview={Boolean(admin)} />;
    }
  }

  // Slider varsa navbar şeffaf başlar (overlay modu)
  const slides = await getActiveHeroSlides();

  return (
    <div className="flex min-h-svh flex-col">
      {maintenance && <PreviewBanner />}
      <Header overlay={slides.length > 0} />
      <main className="flex-1">{children}</main>
      <Footer />
      {settings.whatsapp && (
        <WhatsappFloat
          phone={settings.whatsapp}
          siteName={settings.siteName || "Pink Home"}
        />
      )}
    </div>
  );
}
