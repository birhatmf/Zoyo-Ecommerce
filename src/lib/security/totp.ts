import { createHmac, randomBytes } from "node:crypto";

// RFC 6238 (TOTP) ve RFC 4226 (HOTP) implementasyonu.
// Yeni bir bağımlılık eklememek için node:crypto ile yazıldı.

const DIGITS = 6;
const PERIOD = 30;
const ALGO = "sha1";
const WINDOW = 1; // ±1 adım tolerans (saat sürüklenmesi için)

// Base32 (RFC 4648) decoder — secret'lar standart olarak base32 kodlanır.
function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = input.replace(/=+$/g, "").toUpperCase().replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of cleaned) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) throw new Error("Geçersiz base32");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >> bits) & 0xff);
    }
  }
  return Buffer.from(out);
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  // Big-endian 64-bit counter
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter & 0xffffffff, 4);
  const hmac = createHmac(ALGO, secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const truncated = code % 10 ** DIGITS;
  return truncated.toString().padStart(DIGITS, "0");
}

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(): string {
  // 20 byte = 160 bit, standart TOTP anahtar uzunluğu
  const buf = randomBytes(20);
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += BASE32_ALPHABET[(value >> bits) & 0x1f];
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }
  return out;
}

export function buildOtpAuthUrl(opts: {
  secret: string;
  accountName: string;
  issuer: string;
}): string {
  // Standart otpauth:// URI (Google Authenticator vb. ile uyumlu)
  const label = encodeURIComponent(`${opts.issuer}:${opts.accountName}`);
  const issuerParam = encodeURIComponent(opts.issuer);
  return `otpauth://totp/${label}?secret=${opts.secret}&issuer=${issuerParam}&algorithm=SHA1&digits=${DIGITS}&period=${PERIOD}`;
}

export function verifyTotp(token: string, secret: string): boolean {
  if (!/^\d{6}$/.test(token)) return false;
  let decoded: Buffer;
  try {
    decoded = base32Decode(secret);
  } catch {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / PERIOD);
  for (let i = -WINDOW; i <= WINDOW; i++) {
    const expected = hotp(decoded, counter + i);
    // Sabit süreli karşılaştırma — timing attack hafifletmesi
    if (
      expected.length === token.length &&
      timingSafeEqualHex(expected, token)
    ) {
      return true;
    }
  }
  return false;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
