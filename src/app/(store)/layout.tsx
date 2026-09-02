import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";
import { getActiveHeroSlides } from "@/services/content.service";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
