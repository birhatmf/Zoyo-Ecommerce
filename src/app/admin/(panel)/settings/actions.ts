"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { ORDER_NOTE_TEMPLATES_KEY } from "@/lib/order";
import { prisma } from "@/lib/prisma";
import { saveImage } from "@/lib/storage";
import { STOREFRONT_TEXT_DEFS, type StorefrontTextKey } from "@/lib/storefront-text";

export type SettingsActionState = {
  error?: string;
  saved?: boolean;
  fieldErrors?: Record<string, string>;
};

// Yalnızca beyaz listedeki anahtarlar güncellenir.
const SETTING_KEYS = [
  "siteName",
  "siteShortName",
  "siteDescription",
  "logoUrl",
  "mobileLogoUrl",
  "faviconUrl",
  "footerLogoUrl",
  "address",
  "phone",
  "whatsapp",
  "email",
  "instagram",
  "facebook",
  "youtube",
  "workingHours",
  "orderPrefix",
  "seoTitle",
  "seoTitleTemplate",
  "seoDescription",
  "seoOgImage",
] as const;

export async function saveSettingsAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const admin = await requireRole("ADMIN");
  if (!admin) return { error: "Bu işlem için yetkiniz yok." };

  const updates: { key: string; value: string }[] = [];
  for (const key of SETTING_KEYS) {
    if (!formData.has(key)) continue;
    const value = formData.get(key);
    if (typeof value !== "string") continue;
    if (value.length > 2000) {
      return { error: `"${key}" alanı çok uzun.` };
    }
    updates.push({ key, value: value.trim() });
  }

  for (const { key, value } of updates) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/settings", "layout");
  return { saved: true };
}

// ---------- Görsel yükleme (anında kaydeder) ----------

export async function uploadSettingImageAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  if (!admin) return;

  const key = z.string().safeParse(formData.get("key"));
  const file = formData.get("file");
  if (!key.success || !SETTING_KEYS.includes(key.data as (typeof SETTING_KEYS)[number])) {
    return;
  }
  if (!(file instanceof File) || file.size === 0) return;

  const result = await saveImage(file);
  if (!result.ok) return;

  await prisma.siteSetting.upsert({
    where: { key: key.data },
    update: { value: result.url },
    create: { key: key.data, value: result.url },
  });
  revalidatePath("/admin/settings", "layout");
  revalidatePath("/");
}

// ---------- Banka hesapları ----------

const bankSchema = z.object({
  bankName: z.string().trim().min(2, "Banka adı zorunludur").max(255),
  accountHolder: z.string().trim().min(2, "Hesap sahibi zorunludur").max(255),
  iban: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, "").toUpperCase())
    .refine((value) => /^TR\d{24}$/.test(value), {
      message: "Geçerli bir IBAN giriniz (TR + 24 rakam)",
    }),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  active: z.boolean(),
  sortOrder: z.preprocess(
    (value) => Number(value ?? 0),
    z.number().int().min(0).max(999),
  ),
});

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function saveBankAccountAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const admin = await requireRole("ADMIN");
  if (!admin) return { error: "Bu işlem için yetkiniz yok." };

  const parsed = bankSchema.safeParse({
    bankName: formData.get("bankName"),
    accountHolder: formData.get("accountHolder"),
    iban: formData.get("iban"),
    description: formData.get("description") ?? "",
    active: formData.get("active") === "on",
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) {
    return { error: "Lütfen form alanlarını kontrol edin.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const id = formData.get("id");
  const data = {
    bankName: parsed.data.bankName,
    accountHolder: parsed.data.accountHolder,
    iban: parsed.data.iban,
    description: parsed.data.description || null,
    active: parsed.data.active,
    sortOrder: parsed.data.sortOrder,
  };

  try {
    if (typeof id === "string" && id) {
      await prisma.bankAccount.update({ where: { id }, data });
    } else {
      await prisma.bankAccount.create({ data });
    }
  } catch (error) {
    console.error("Bank account save failed:", error);
    return { error: "Kayıt başarısız. Lütfen tekrar deneyin." };
  }

  revalidatePath("/admin/settings/bank");
  revalidatePath("/siparis/basarili");
  return { saved: true };
}

export async function deleteBankAccountAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  if (!admin) return;
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  await prisma.bankAccount.delete({ where: { id: id.data } });
  revalidatePath("/admin/settings/bank");
}

// ---------- Sipariş madde şablonları ----------

type OrderNoteTemplate = { id: string; content: string };

const templateSchema = z.object({
  templateId: z.string().uuid().optional().or(z.literal("")),
  content: z.string().trim().min(1, "Madde metni boş olamaz").max(500),
});

async function readTemplates(): Promise<OrderNoteTemplate[]> {
  const { getSetting } = await import("@/lib/settings");
  const raw = await getSetting(ORDER_NOTE_TEMPLATES_KEY, "[]");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is OrderNoteTemplate =>
        typeof t === "object" &&
        t !== null &&
        typeof (t as OrderNoteTemplate).id === "string" &&
        typeof (t as OrderNoteTemplate).content === "string",
    );
  } catch {
    return [];
  }
}

async function writeTemplates(templates: OrderNoteTemplate[]): Promise<void> {
  const value = JSON.stringify(templates);
  await prisma.siteSetting.upsert({
    where: { key: ORDER_NOTE_TEMPLATES_KEY },
    update: { value },
    create: { key: ORDER_NOTE_TEMPLATES_KEY, value },
  });
  revalidatePath("/admin/settings/order-notes");
  revalidatePath("/siparis");
}

export async function saveOrderNoteTemplateAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const admin = await requireRole("ADMIN");
  if (!admin) return { error: "Bu işlem için yetkiniz yok." };

  const parsed = templateSchema.safeParse({
    templateId: formData.get("templateId") ?? "",
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return {
      error: "Lütfen form alanlarını kontrol edin.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    const templates = await readTemplates();

    if (parsed.data.templateId) {
      const index = templates.findIndex((t) => t.id === parsed.data.templateId);
      if (index === -1) return { error: "Şablon bulunamadı." };
      templates[index] = { ...templates[index], content: parsed.data.content };
    } else {
      if (
        templates.some(
          (t) => t.content.toLowerCase() === parsed.data.content.toLowerCase(),
        )
      ) {
        return { error: "Bu madde zaten mevcut." };
      }
      templates.push({ id: crypto.randomUUID(), content: parsed.data.content });
    }

    await writeTemplates(templates);
    return { saved: true };
  } catch (error) {
    console.error("Order note template save failed:", error);
    return { error: "Kayıt başarısız. Lütfen tekrar deneyin." };
  }
}

export async function deleteOrderNoteTemplateAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  if (!admin) return;

  const templateId = z.string().uuid().safeParse(formData.get("templateId"));
  if (!templateId.success) return;

  const templates = await readTemplates();
  await writeTemplates(templates.filter((t) => t.id !== templateId.data));
}

// ---------- Storefront metinleri ----------

const storefrontTextSchema = z.object({
  key: z.string(),
  value: z.string().max(5000),
});

export async function saveStorefrontTextAction(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const admin = await requireRole("ADMIN");
  if (!admin) return { error: "Bu işlem için yetkiniz yok." };

  const parsed = storefrontTextSchema.safeParse({
    key: formData.get("key"),
    value: formData.get("value") ?? "",
  });
  if (!parsed.success) {
    return { error: "Geçersiz metin. Maksimum 5000 karakter." };
  }

  // Yalnızca bilinen anahtarlara izin ver (key-value mass-assignment koruması).
  const def = STOREFRONT_TEXT_DEFS.find((d) => d.key === parsed.data.key);
  if (!def) return { error: "Bilinmeyen metin anahtarı." };

  await prisma.storefrontText.upsert({
    where: { key: parsed.data.key as StorefrontTextKey },
    update: { value: parsed.data.value },
    create: { key: parsed.data.key as StorefrontTextKey, value: parsed.data.value },
  });

  await recordAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "StorefrontText",
    entityId: parsed.data.key,
    summary: `Storefront metni güncellendi: ${def.label}`,
  });

  revalidatePath("/");
  return { saved: true };
}

// Footer canlı düzenleyici için tek-key storefront text kaydı (plain action).
export async function saveStorefrontTextInlineAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  if (!admin) return;

  const parsed = storefrontTextSchema.safeParse({
    key: formData.get("key"),
    value: formData.get("value") ?? "",
  });
  if (!parsed.success) return;

  const def = STOREFRONT_TEXT_DEFS.find((d) => d.key === parsed.data.key);
  if (!def) return;

  await prisma.storefrontText.upsert({
    where: { key: parsed.data.key as StorefrontTextKey },
    update: { value: parsed.data.value },
    create: { key: parsed.data.key as StorefrontTextKey, value: parsed.data.value },
  });

  await recordAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "StorefrontText",
    entityId: parsed.data.key,
    summary: `Storefront metni güncellendi: ${def.label}`,
  });

  revalidatePath("/");
}

// Footer canlı düzenleyici için tek-key site setting kaydı (plain action).
export async function saveSettingInlineAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");
  if (!admin) return;

  const key = z.string().safeParse(formData.get("key"));
  const value = z.string().max(2000).safeParse(formData.get("value") ?? "");
  if (!key.success || !value.success) return;
  if (!SETTING_KEYS.includes(key.data as (typeof SETTING_KEYS)[number])) return;

  await prisma.siteSetting.upsert({
    where: { key: key.data },
    update: { value: value.data },
    create: { key: key.data, value: value.data },
  });

  await recordAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "SiteSetting",
    entityId: key.data,
    summary: `Site ayarı güncellendi: ${key.data}`,
  });

  revalidatePath("/");
}
