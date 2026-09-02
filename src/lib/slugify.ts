const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c",
  ğ: "g", Ğ: "g",
  ı: "i", I: "i", İ: "i",
  ö: "o", Ö: "o",
  ş: "s", Ş: "s",
  ü: "u", Ü: "u",
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
