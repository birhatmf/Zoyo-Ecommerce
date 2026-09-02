"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { saveImage } from "@/lib/storage";
import { mediaRefSchema, safeUrlSchema } from "@/lib/validation/media-url";

// Ana sayfa görselleri: yükleme anında kaydedilir
const HOMEPAGE_IMAGE_FIELDS = ["heroImageDesktop", "heroImageMobile", "storyImage"] as const;

export async function saveHomepageImageAction(formData: FormData): Promise<void> {
  const _actor = await requireRole("EDITOR");
  if (!_actor) return;

  const field = z.string().safeParse(formData.get("field"));
  if (
    !field.success ||
    !HOMEPAGE_IMAGE_FIELDS.includes(field.data as (typeof HOMEPAGE_IMAGE_FIELDS)[number])
  ) {
    return;
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const result = await saveImage(file);
  if (!result.ok) return;

  const current =
    (await prisma.homepageContent.findUnique({ where: { id: "homepage" } })) ?? null;
  const data = {
    heroImageDesktop:
      field.data === "heroImageDesktop"
        ? result.url
        : current?.heroImageDesktop ?? null,
    heroImageMobile:
      field.data === "heroImageMobile"
        ? result.url
        : current?.heroImageMobile ?? null,
    storyImage: field.data === "storyImage" ? result.url : current?.storyImage ?? null,
  };

  await prisma.homepageContent.upsert({
    where: { id: "homepage" },
    update: data,
    create: { id: "homepage", ...data },
  });
  revalidatePath("/admin/content/home");
  revalidatePath("/");
}

export type CmsActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

// ---------- Ana sayfa içeriği ----------

const homepageSchema = z.object({
  heroTitle: optionalText(255),
  heroSubtitle: optionalText(255),
  heroDescription: optionalText(1000),
  heroImageDesktop: z.preprocess(
    (value) => (value === "" ? null : value),
    mediaRefSchema.nullable(),
  ),
  heroImageMobile: z.preprocess(
    (value) => (value === "" ? null : value),
    mediaRefSchema.nullable(),
  ),
  heroCtaLabel: optionalText(100),
  heroCtaUrl: safeUrlSchema.optional().or(z.literal("")),
  heroCtaSecondaryLabel: optionalText(100),
  heroCtaSecondaryUrl: safeUrlSchema.optional().or(z.literal("")),
  heroAlignment: z.enum(["left", "center"]),
  heroActive: z.boolean(),

  storyTitle: optionalText(255),
  storyDescription: optionalText(2000),
  storyImage: z.preprocess(
    (value) => (value === "" ? null : value),
    mediaRefSchema.nullable(),
  ),

  customProductionTitle: optionalText(255),
  customProductionDescription: optionalText(1000),
  customProductionButtonLabel: optionalText(100),
});

export async function saveHomepageAction(
  _previousState: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  const admin = await requireRole("EDITOR");
  if (!admin) return { error: "Bu işlem için yetkiniz yok." };

  const parsed = homepageSchema.safeParse({
    heroTitle: formData.get("heroTitle") ?? "",
    heroSubtitle: formData.get("heroSubtitle") ?? "",
    heroDescription: formData.get("heroDescription") ?? "",
    heroImageDesktop: formData.get("heroImageDesktop"),
    heroImageMobile: formData.get("heroImageMobile"),
    heroCtaLabel: formData.get("heroCtaLabel") ?? "",
    heroCtaUrl: formData.get("heroCtaUrl") ?? "",
    heroCtaSecondaryLabel: formData.get("heroCtaSecondaryLabel") ?? "",
    heroCtaSecondaryUrl: formData.get("heroCtaSecondaryUrl") ?? "",
    heroAlignment: formData.get("heroAlignment") || "left",
    heroActive: formData.get("heroActive") === "on",
    storyTitle: formData.get("storyTitle") ?? "",
    storyDescription: formData.get("storyDescription") ?? "",
    storyImage: formData.get("storyImage"),
    customProductionTitle: formData.get("customProductionTitle") ?? "",
    customProductionDescription: formData.get("customProductionDescription") ?? "",
    customProductionButtonLabel: formData.get("customProductionButtonLabel") ?? "",
  });
  if (!parsed.success) {
    return { error: "Lütfen form alanlarını kontrol edin.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  await prisma.homepageContent.upsert({
    where: { id: "homepage" },
    update: parsed.data,
    create: { id: "homepage", ...parsed.data },
  });

  revalidatePath("/");
  return {};
}

// ---------- Hero slider slaytları ----------

const heroSlideSchema = z.object({
  id: z.uuid().optional().or(z.literal("")),
  title: z.string().trim().min(2, "Başlık zorunludur").max(255),
  subtitle: optionalText(255),
  description: optionalText(500),
  imageUrl: mediaRefSchema, // "Görsel zorunludur" + whitelist kontrolü
  ctaLabel: optionalText(100),
  ctaUrl: safeUrlSchema.optional().or(z.literal("")),
  sortOrder: z.preprocess(
    (value) => Number(value ?? 0),
    z.number().int().min(0).max(999),
  ),
  active: z.boolean(),
});

export async function saveHeroSlideAction(formData: FormData): Promise<void> {
  const _actor = await requireRole("EDITOR");
  if (!_actor) return;

  // Görsel adresi boşsa doğrudan yüklenen dosyayı kullan
  let imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (!imageUrl) {
    const file = formData.get("imageFile");
    if (!(file instanceof File) || file.size === 0) return;
    const result = await saveImage(file);
    if (!result.ok) return;
    imageUrl = result.url;
    formData.set("imageUrl", imageUrl);
  }

  const parsed = heroSlideSchema.safeParse({
    id: formData.get("id") ?? "",
    title: formData.get("title"),
    subtitle: formData.get("subtitle") ?? "",
    description: formData.get("description") ?? "",
    imageUrl: formData.get("imageUrl"),
    ctaLabel: formData.get("ctaLabel") ?? "",
    ctaUrl: formData.get("ctaUrl") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return;

  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.heroSlide.update({ where: { id }, data });
  } else {
    await prisma.heroSlide.create({ data });
  }

  revalidatePath("/admin/content/home");
  revalidatePath("/");
}

export async function deleteHeroSlideAction(formData: FormData): Promise<void> {
  const _actor = await requireRole("EDITOR");
  if (!_actor) return;
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  await prisma.heroSlide.delete({ where: { id: id.data } });
  revalidatePath("/admin/content/home");
  revalidatePath("/");
}

export async function toggleHeroSlideActiveAction(
  formData: FormData,
): Promise<void> {
  const _actor = await requireRole("EDITOR");
  if (!_actor) return;
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  const slide = await prisma.heroSlide.findUnique({
    where: { id: id.data },
    select: { active: true },
  });
  if (!slide) return;

  await prisma.heroSlide.update({
    where: { id: id.data },
    data: { active: !slide.active },
  });
  revalidatePath("/admin/content/home");
  revalidatePath("/");
}

// ---------- Navbar (üst menü) linkleri ----------

const headerLinkSchema = z.object({
  id: z.uuid().optional().or(z.literal("")),
  label: z.string().trim().min(1, "Etiket zorunludur").max(100),
  href: safeUrlSchema.refine((value) => value.length > 0, {
    message: "Hedef zorunludur",
  }),
  sortOrder: z.preprocess(
    (value) => Number(value ?? 0),
    z.number().int().min(0).max(999),
  ),
});

export async function saveHeaderLinkAction(formData: FormData): Promise<void> {
  const _actor = await requireRole("EDITOR");
  if (!_actor) return;

  const parsed = headerLinkSchema.safeParse({
    id: formData.get("id") ?? "",
    label: formData.get("label"),
    href: formData.get("href"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return;

  const { id, ...data } = parsed.data;
  if (id) {
    await prisma.headerLink.update({ where: { id }, data });
  } else {
    await prisma.headerLink.create({ data });
  }

  revalidatePath("/admin/content/navbar");
  revalidatePath("/", "layout");
}

export async function deleteHeaderLinkAction(formData: FormData): Promise<void> {
  const _actor = await requireRole("EDITOR");
  if (!_actor) return;
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  await prisma.headerLink.delete({ where: { id: id.data } });
  revalidatePath("/admin/content/navbar");
  revalidatePath("/", "layout");
}

// ---------- Footer ----------

export async function saveFooterCopyrightAction(formData: FormData): Promise<void> {
  const _actor = await requireRole("EDITOR");
  if (!_actor) return;
  const copyright = z
    .string()
    .trim()
    .max(500)
    .safeParse(formData.get("footerCopyright"));
  if (!copyright.success) return;

  await prisma.siteSetting.upsert({
    where: { key: "footerCopyright" },
    update: { value: copyright.data },
    create: { key: "footerCopyright", value: copyright.data },
  });
  revalidatePath("/");
}

const groupSchema = z.object({
  id: z.uuid().optional().or(z.literal("")),
  title: z.string().trim().min(1, "Grup adı zorunludur").max(100),
  sortOrder: z.preprocess(
    (value) => Number(value ?? 0),
    z.number().int().min(0).max(999),
  ),
});

export async function saveFooterGroupAction(formData: FormData): Promise<void> {
  const _actor = await requireRole("EDITOR");
  if (!_actor) return;

  const parsed = groupSchema.safeParse({
    id: formData.get("id") ?? "",
    title: formData.get("title"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) return;

  const { id, title, sortOrder } = parsed.data;
  if (id) {
    await prisma.footerLinkGroup.update({ where: { id }, data: { title, sortOrder } });
  } else {
    await prisma.footerLinkGroup.create({ data: { title, sortOrder } });
  }
  revalidatePath("/admin/content/footer");
  revalidatePath("/");
}

export async function deleteFooterGroupAction(formData: FormData): Promise<void> {
  const _actor = await requireRole("EDITOR");
  if (!_actor) return;
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  await prisma.footerLinkGroup.delete({ where: { id: id.data } });
  revalidatePath("/admin/content/footer");
  revalidatePath("/");
}

const linkSchema = z.object({
  groupId: z.uuid(),
  label: z.string().trim().min(1, "Etiket zorunludur").max(255),
  url: safeUrlSchema.refine((value) => value.length > 0, {
    message: "URL zorunludur",
  }),
  sortOrder: z.preprocess(
    (value) => Number(value ?? 0),
    z.number().int().min(0).max(999),
  ),
});

export async function saveFooterLinkAction(formData: FormData): Promise<void> {
  const _actor = await requireRole("EDITOR");
  if (!_actor) return;

  const linkIdRaw = formData.get("linkId");
  const parsed = linkSchema.safeParse({
    groupId: formData.get("groupId"),
    label: formData.get("label"),
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) return;

  if (typeof linkIdRaw === "string" && linkIdRaw && z.uuid().safeParse(linkIdRaw).success) {
    await prisma.footerLink.update({
      where: { id: linkIdRaw },
      data: {
        label: parsed.data.label,
        url: parsed.data.url,
        sortOrder: parsed.data.sortOrder,
      },
    });
  } else {
    await prisma.footerLink.create({ data: { ...parsed.data } });
  }
  revalidatePath("/admin/content/footer");
  revalidatePath("/");
}

export async function deleteFooterLinkAction(formData: FormData): Promise<void> {
  const _actor = await requireRole("EDITOR");
  if (!_actor) return;
  const id = z.uuid().safeParse(formData.get("linkId"));
  if (!id.success) return;

  await prisma.footerLink.delete({ where: { id: id.data } });
  revalidatePath("/admin/content/footer");
  revalidatePath("/");
}

// ---------- CMS sayfaları ----------

const cmsPageSchema = z.object({
  title: z.string().trim().min(2, "Başlık en az 2 karakter olmalıdır").max(255),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug formatı geçersiz"),
  type: z.enum(["LEGAL", "CORPORATE", "CUSTOM"]),
  content: z.string().max(100_000).optional().or(z.literal("")),
  active: z.boolean(),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function saveCmsPageAction(
  _previousState: CmsActionState,
  formData: FormData,
): Promise<CmsActionState> {
  const admin = await requireRole("EDITOR");
  if (!admin) return { error: "Bu işlem için yetkiniz yok." };

  const parsed = cmsPageSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    type: formData.get("type") || "CUSTOM",
    content: formData.get("content") ?? "",
    active: formData.get("active") === "on",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
  if (!parsed.success) {
    return { error: "Lütfen form alanlarını kontrol edin.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const id = formData.get("id");
  const data = {
    title: parsed.data.title,
    slug: parsed.data.slug,
    type: parsed.data.type,
    content: parsed.data.content || "",
    active: parsed.data.active,
    seoTitle: parsed.data.seoTitle || null,
    seoDescription: parsed.data.seoDescription || null,
  };

  const isNew = !(typeof id === "string" && id);
  try {
    let pageId: string;
    if (!isNew) {
      pageId = id as string;
      await prisma.cmsPage.update({ where: { id: pageId }, data });
    } else {
      const created = await prisma.cmsPage.create({ data });
      pageId = created.id;
    }
    await recordAudit({
      actor: admin,
      action: isNew ? "CREATE" : "UPDATE",
      entityType: "CmsPage",
      entityId: pageId,
      summary: isNew ? `${parsed.data.title} sayfası oluşturuldu` : `${parsed.data.title} sayfası güncellendi`,
    });
    revalidatePath("/");
    redirect(`/admin/content/pages/${pageId}`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("cms_pages_slug_key")
    ) {
      return {
        error: "Bu slug zaten kullanılıyor.",
        fieldErrors: { slug: "Bu slug zaten kullanılıyor" },
      };
    }
    throw error;
  }
}

export async function deleteCmsPageAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  const existing = await prisma.cmsPage.findUnique({
    where: { id: id.data },
    select: { title: true },
  });
  if (!existing) return;

  await prisma.cmsPage.delete({ where: { id: id.data } });
  await recordAudit({
    actor: admin,
    action: "DELETE",
    entityType: "CmsPage",
    entityId: id.data,
    summary: `${existing.title} sayfası silindi`,
  });
  revalidatePath("/admin/content/pages");
  redirect("/admin/content/pages");
}
