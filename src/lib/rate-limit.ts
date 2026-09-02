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
 * Soldaki değerler istemci tarafından sahtelenebilir; yalnızca EN SAĞDAKİ
 * değer doğrudan bağlandığımız (güvendiğimiz) proxy tarafından eklenir.
 * Bu yüzden ilk değil son değer kullanılır.
 */
export function getClientIp(headers: {
  get(name: string): string | null | undefined;
}): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "unknown"
  );
}
