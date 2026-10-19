import { getSessionAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";
import { MaintenanceScreen } from "@/components/storefront/maintenance";
import { getActiveHeroSlides } from "@/services/content.service";

export const dynamic = "force-dynamic";

// Geçerli bir yönetici oturumu varsa bakım modunda siteyi görmeye devam eder.
async function isAdminPreview(): Promise<boolean> {
  const adminId = await getSessionAdminId();
  if (!adminId) return false;
  const admin = await prisma.adminUser.findFirst({
    where: { id: adminId, active: true },
    select: { id: true },
  });
  return Boolean(admin);
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  if (settings.maintenanceMode === "true" && !(await isAdminPreview())) {
    return <MaintenanceScreen settings={settings} />;
  }

  // Slider varsa navbar şeffaf başlar (overlay modu)
  const slides = await getActiveHeroSlides();

  return (
    <div className="flex min-h-svh flex-col">
      <Header overlay={slides.length > 0} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
