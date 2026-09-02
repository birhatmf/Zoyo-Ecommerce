import type { Metadata } from "next";

import { CmsPageView, generateCmsMetadata } from "@/components/storefront/cms-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("gizlilik-politikasi", "Gizlilik Politikası");
}

export default function Page() {
  return <CmsPageView slug="gizlilik-politikasi" />;
}
