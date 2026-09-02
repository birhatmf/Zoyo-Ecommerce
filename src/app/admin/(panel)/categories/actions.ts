"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { mediaRefSchema } from "@/lib/validation/media-url";

export type CategoryActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Kategori adı en az 2 karakter olmalıdır").max(255),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug formatı geçersiz"),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  image: z.preprocess(
    (value) => (value === "" || value === null ? null : value),
    mediaRefSchema.nullable(),
  ),
  active: z.boolean(),
  sortOrder: z.preprocess(
    (value) => Number(value ?? 0),
    z.number().int("Tam sayı giriniz").min(0).max(999),
  ),
  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(200).optional().or(z.literal("")),
});

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function saveCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const admin = await requireRole("EDITOR");
  if (!admin) return { error: "Bu işlem için yetkiniz yok." };

  const parsed = categoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    image: formData.get("image"),
    active: formData.get("active") === "on",
    sortOrder: formData.get("sortOrder"),
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });
  if (!parsed.success) {
    return { error: "Lütfen form alanlarını kontrol edin.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const input = parsed.data;

  const data = {
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    image: input.image,
    active: input.active,
    sortOrder: input.sortOrder,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
  };

  const id = formData.get("id");

  const isNew = !(typeof id === "string" && id);
  let categoryId = typeof id === "string" && id ? id : "";
  try {
    if (!isNew) {
      await prisma.category.update({ where: { id: categoryId }, data });
    } else {
      const created = await prisma.category.create({ data });
      categoryId = created.id;
    }
    await recordAudit({
      actor: admin,
      action: isNew ? "CREATE" : "UPDATE",
      entityType: "Category",
      entityId: categoryId,
      summary: isNew ? `${input.name} kategorisi oluşturuldu` : `${input.name} kategorisi güncellendi`,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("categories_slug_key")) {
      return {
        error: "Bu slug zaten kullanılıyor.",
        fieldErrors: { slug: "Bu slug zaten kullanılıyor" },
      };
    }
    console.error("Category save failed:", error);
    return { error: "Kategori kaydedilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  const existing = await prisma.category.findUnique({
    where: { id: id.data },
    select: { name: true },
  });
  if (!existing) return;

  await prisma.category.delete({ where: { id: id.data } });
  await recordAudit({
    actor: admin,
    action: "DELETE",
    entityType: "Category",
    entityId: id.data,
    summary: `${existing.name} kategorisi silindi`,
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
