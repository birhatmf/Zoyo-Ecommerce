// ASCII olmayan karakterler için slug normalizasyonu.
// Türkçe harflerin yanı sıra yaygın Latince aksanlı karakterler de dahildir.
// Kapsam bilinçli olarak küçük tutulmuştur; ürün adları çoğunlukla Türkçe
// veya İngilizce, egzotik diller zaten İngilizce çeviri gerektirir.
const TR_MAP: Record<string, string> = {
  // Türkçe
  ç: "c", Ç: "c",
  ğ: "g", Ğ: "g",
  ı: "i", I: "i", İ: "i",
  ö: "o", Ö: "o",
  ş: "s", Ş: "s",
  ü: "u", Ü: "u",
  // Latince aksanlı (örn. marka isimlerinde sık kullanılan)
  à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", ā: "a",
  À: "a", Á: "a", Â: "a", Ã: "a", Ä: "a", Å: "a", Ā: "a",
  è: "e", é: "e", ê: "e", ë: "e", ē: "e",
  È: "e", É: "e", Ê: "e", Ë: "e", Ē: "e",
  ì: "i", í: "i", î: "i", ï: "i", ī: "i",
  Ì: "i", Í: "i", Î: "i", Ï: "i", Ī: "i",
  ò: "o", ó: "o", ô: "o", õ: "o", ø: "o", ō: "o",
  Ò: "o", Ó: "o", Ô: "o", Õ: "o", Ø: "o", Ō: "o",
  ù: "u", ú: "u", û: "u", ū: "u",
  Ù: "u", Ú: "u", Û: "u", Ū: "u",
  ñ: "n", Ñ: "n", ß: "ss",
  ý: "y", ÿ: "y",
  Ý: "y", Ÿ: "y",
};

export function slugify(value: string): string {
  return value
    .split("")
    .map((char) => TR_MAP[char] ?? char)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
