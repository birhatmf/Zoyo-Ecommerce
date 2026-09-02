import "server-only";

// Basit in-memory sabit pencere (fixed-window) rate limiter.
// Tek instance için yeterlidir; çoklu instance'da Redis gibi
// paylaşımlı bir store'a taşınmalıdır.
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 20_000;
const SWEEP_INTERVAL_MS = 60_000;
let lastSweepAt = Date.now();

function sweep(now: number): void {
  if (buckets.size < MAX_BUCKETS && now - lastSweepAt < SWEEP_INTERVAL_MS) {
    return;
  }
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
  lastSweepAt = now;
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** Saniye cinsinden tekrar denenebilecek süre (sadece ok=false ise anlamlı) */
  retryAfterSeconds: number;
};

/** Sabit pencere limiti; her çağrı sayacı artırır. */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return {
    ok: true,
    remaining: limit - bucket.count,
    retryAfterSeconds: 0,
  };
}

// ---------- Giriş denemeleri (yalnızca başarısız denemeler sayılır) ----------

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

type Attempt = { count: number; resetAt: number };
const loginAttempts = new Map<string, Attempt>();

export function isRateLimited(key: string): boolean {
  const attempt = loginAttempts.get(key);
  if (!attempt) return false;
  if (Date.now() > attempt.resetAt) {
    loginAttempts.delete(key);
    return false;
  }
  return attempt.count >= LOGIN_MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  attempt.count += 1;
}

export function clearAttempts(key: string): void {
  loginAttempts.delete(key);
}

/**
 * İstemci IP'sini belirler.
 *
 * X-Forwarded-For biçimi: "istemci, proxy1, proxy2, ..."
 * En soldaki değer gerçek istemci IP'sidir ve doğrudan bağlandığımız proxy
 * tarafından eklenir; aradaki değerler istemci tarafından sahtelenebilir.
 * Bu yüzden ilk değer kullanılır.
 *
 * `TRUSTED_PROXY_COUNT` env değişkeniyle kaç sondaki proxy'ye güvenildiği
 * belirtilebilir (örn. Cloudflare + Nginx zinciri için 2). Bu durumda en
 * soldan o kadar geriye gidilir; kalan kısım istemci tarafından kontrol
 * edilebilir olduğundan YOK sayılır.
 *
 * Hiçbir IP kaynağı yoksa "unknown" döner; çağıran rate-limit fonksiyonları
 * bu durumda daha gevşek limit uygulamalı çünkü tüm meçhul IP'ler aynı
 * bucket'a düşmemelidir.
 */
function trustedProxyCount(): number {
  const raw = process.env.TRUSTED_PROXY_COUNT;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : 0;
}

export function getClientIp(headers: {
  get(name: string): string | null | undefined;
}): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      const trusted = trustedProxyCount();
      const clientIndex = Math.max(0, parts.length - 1 - trusted);
      const ip = parts[clientIndex];
      if (ip) return ip;
    }
  }
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

/**
 * IP bilinmediğinde (proxy'siz lokal geliştirme vb.) rate-limit
 * fonksiyonlarının "unknown" bucket'ını paylaşmaması için kullanılacak
 * gevşek limitler.
 *
 * Saldırganlar aynı "unknown" bucket'ı doldurup tüm meçhul IP'leri
 * bloklayabilir; bu yüzden unknown durumunda limitler oldukça yüksek
 * tutulur ve ayrı bir "anonymous" zone'unda sayılır.
 */
export const UNKNOWN_IP_LIMITS = {
  // Genel API flood koruması: dakikada 30 istek (normal 120 yerine)
  apiPerMinute: 30,
  // Sipariş: 10 dakikada 2 (normal 5 yerine)
  orderPer10Min: 2,
  // Login: 15 dakikada 2 (normal 5 yerine)
  loginPer15Min: 2,
} as const;
