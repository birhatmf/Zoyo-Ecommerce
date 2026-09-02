"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    z
      .string()
      .max(2000)
      .refine(
        (value) =>
          typeof value !== "string" ||
          value.startsWith("/") ||
          /^https?:\/\//i.test(value),
        { message: "Geçerli bir görsel adresi giriniz" },
      )
      .nullable(),
  ),
  active: z.boolean(),
  sortOrder: z.preprocess(
    (value) => Number(value ?? 0),
    z.number().int("Tam sayı giriniz").min(0).max(999),
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

export async function saveCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const parsed = categoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    image: formData.get("image"),
    active: formData.get("active") === "on",
    sortOrder: formData.get("sortOrder"),
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
  };

  const id = formData.get("id");

  try {
    if (typeof id === "string" && id) {
      await prisma.category.update({ where: { id }, data });
    } else {
      await prisma.category.create({ data });
    }
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
  await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  await prisma.category.delete({ where: { id: id.data } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
