import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Zoyo Mobilya";
  let description =
    "El işçiliği, doğal malzemeler ve zamansız tasarımlarla butik ahşap mobilya üretimi.";
  let faviconUrl: string | undefined;

  try {
    const settings = await getSiteSettings();
    if (settings.siteName) siteName = settings.siteName;
    if (settings.siteDescription) description = settings.siteDescription;
    if (settings.faviconUrl) faviconUrl = settings.faviconUrl;
  } catch {
    // DB erişilemezse varsayılan metadata kullanılır
  }

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    ...(faviconUrl ? { icons: { icon: faviconUrl } } : {}),
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
