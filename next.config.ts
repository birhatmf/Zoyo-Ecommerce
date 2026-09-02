import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Güvenlik başlıkları: tüm yanıtlar için statik değerler.
  // CSP, istek başına nonce gerektirdiğinden src/proxy.ts'te ayarlanır.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      // saveImage en fazla 5MB kabul ediyor; multipart overhead'i için pay bırak
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
