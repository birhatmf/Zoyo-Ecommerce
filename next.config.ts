import type { NextConfig } from "next";

// Next/Image'in uzaktan çekebileceği hostname'ler.
// Virgülle ayrılmış env değişkeninden okunur, aksi halde yalnızca aynı origin
// kabul edilir (remote pattern boş). Yanlışlıkla "**" gibi joker değerler
// kabul edilmez.
const allowedImageHosts = (process.env.NEXT_IMAGE_REMOTE_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter((host) => host.length > 0 && host !== "*" && host !== "**");

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
    remotePatterns: allowedImageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
};

export default nextConfig;
