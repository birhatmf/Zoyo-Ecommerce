import type { Metadata } from "next";

import { CmsPageView, generateCmsMetadata } from "@/components/storefront/cms-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("mesafeli-satis-sozlesmesi", "Mesafeli Satış Sözleşmesi");
}

export default function Page() {
  return <CmsPageView slug="mesafeli-satis-sozlesmesi" />;
}
