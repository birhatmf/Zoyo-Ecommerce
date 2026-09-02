// Hafif password gücü tahmini — zxcvbn gibi büyük bir bağımlılık eklememek için
// entropi ve çeşitlilik üzerinden basit bir kontrol yapılır.
// Politika: minimum 12 karakter, dört sınıftan en az 3'ü kullanılmış olmalı.

const CLASSES = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  digit: /\d/,
  symbol: /[^A-Za-z0-9]/,
} as const;

export type PasswordPolicyResult =
  | { ok: true }
  | { ok: false; reason: string };

export function validatePasswordPolicy(value: string): PasswordPolicyResult {
  if (typeof value !== "string" || value.length < 12) {
    return { ok: false, reason: "Şifre en az 12 karakter olmalıdır" };
  }
  if (value.length > 256) {
    return { ok: false, reason: "Şifre 256 karakterden uzun olamaz" };
  }
  const classesUsed = Object.values(CLASSES).filter((re) => re.test(value)).length;
  if (classesUsed < 3) {
    return {
      ok: false,
      reason:
        "Şifre en az 3 farklı karakter sınıfı içermelidir (küçük, büyük, rakam, simge)",
    };
  }
  // Çok yaygın zayıf şifreler
  const banned = new Set([
    "password1234",
    "admin123456",
    "qwerty123456",
    "123456789012",
    "zoyo12345678",
  ]);
  if (banned.has(value.toLowerCase())) {
    return { ok: false, reason: "Bu şifre çok yaygın, başka bir şifre seçin" };
  }
  return { ok: true };
}

// Shannon entropi tahmini (bit cinsinden)
export function estimateEntropy(value: string): number {
  if (value.length === 0) return 0;
  const charsetSize =
    (CLASSES.lower.test(value) ? 26 : 0) +
    (CLASSES.upper.test(value) ? 26 : 0) +
    (CLASSES.digit.test(value) ? 10 : 0) +
    (CLASSES.symbol.test(value) ? 32 : 0);
  if (charsetSize === 0) return 0;
  return value.length * Math.log2(charsetSize);
}
