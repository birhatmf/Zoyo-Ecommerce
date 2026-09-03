import { getSiteSettings } from "@/lib/settings";

export const ORDER_NOTE_TEMPLATES_KEY = "orderNoteTemplates";

export async function getOrderNoteTemplates(): Promise<string[]> {
  const settings = await getSiteSettings();
  const raw = settings[ORDER_NOTE_TEMPLATES_KEY];
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) =>
        typeof item === "string"
          ? item
          : item && typeof item === "object" && typeof (item as { content?: unknown }).content === "string"
            ? ((item as { content: string }).content)
            : null,
      )
      .filter((item): item is string => item !== null && item.trim().length > 0);
  } catch {
    return [];
  }
}

export type OrderNoteTemplateItem = { id: string; content: string };

export async function getOrderNoteTemplatesWithIds(): Promise<OrderNoteTemplateItem[]> {
  const settings = await getSiteSettings();
  const raw = settings[ORDER_NOTE_TEMPLATES_KEY];
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is OrderNoteTemplateItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as OrderNoteTemplateItem).id === "string" &&
        typeof (item as OrderNoteTemplateItem).content === "string",
    );
  } catch {
    return [];
  }
}
