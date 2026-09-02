import type { Metadata } from "next";

import { CmsPageView, generateCmsMetadata } from "@/components/storefront/cms-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("iletisim", "İletişim");
}

export default function Page() {
  return <CmsPageView slug="iletisim" />;
}
