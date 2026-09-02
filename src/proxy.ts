import { NextResponse, type NextRequest } from "next/server";

import { getClientIp, rateLimit, UNKNOWN_IP_LIMITS } from "@/lib/rate-limit";

// İstek başına nonce üretip Content-Security-Policy uygular.
// Next.js, bu başlıktaki nonce'u kendi inline betiklerine otomatik ekler.
export function proxy(request: NextRequest) {
  // API uçlarında genel flood koruması (iş mantığına özel limitler
  // ilgili route içinde ayrı anahtarla uygulanır)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = getClientIp(request.headers);
    const limit = ip === "unknown" ? UNKNOWN_IP_LIMITS.apiPerMinute : 120;
    const general = rateLimit(`api:${ip}`, limit, 60_000);
    if (!general.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Çok fazla istek gönderildi." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(general.retryAfterSeconds),
          },
        },
      );
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval' 'unsafe-inline'" : ""}`,
    // style-src: satır içi style="" öznitelikleri (grafik çubuk yükseklikleri vb.) için
    // 'unsafe-inline' gerekli — stil enjeksiyonu riski betiğe göre düşüktür.
    "style-src 'self' 'unsafe-inline'",
    // Yönetim panelinde harici https görselleri düz <img> ile gösterilebiliyor
    "img-src 'self' https: data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  // Statik varlıkları ve medya dosyalarını atla
  matcher: [
    {
      source: "/((?!_next/static|_next/image|api/media|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
