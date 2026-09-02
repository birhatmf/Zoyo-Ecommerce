import type { Metadata } from "next";

import { CmsPageView, generateCmsMetadata } from "@/components/storefront/cms-page-view";

export async function generateMetadata(): Promise<Metadata> {
  return generateCmsMetadata("teslimat-ve-iade", "Teslimat ve İade");
}

export default function Page() {
  return <CmsPageView slug="teslimat-ve-iade" />;
}
