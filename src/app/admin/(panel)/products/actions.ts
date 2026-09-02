"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { saveImage } from "@/lib/storage";
import { mediaRefSchema } from "@/lib/validation/media-url";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const nullableNumber = (max?: number) =>
  z.preprocess(
    (value) => (value === "" || value === null ? null : Number(value)),
    z
      .number({ message: "Geçerli bir sayı giriniz" })
      .positive("0'dan büyük olmalıdır")
      .max(max ?? Number.MAX_SAFE_INTEGER)
      .nullable(),
  );

const productFormSchema = z.object({
  name: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalıdır").max(255),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug formatı geçersiz"),
  productCode: z.string().trim().min(1, "Ürün kodu zorunludur").max(50),

  shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),

  price: nullableNumber(1_000_000_000),
  discountPrice: nullableNumber(1_000_000_000),

  categoryId: z
    .preprocess(
      (value) => (value === "" || value === null ? null : value),
      z.string().uuid("Geçersiz kategori").nullable(),
    ),

  material: z.string().trim().max(255).optional().or(z.literal("")),
  dimensions: z.string().trim().max(255).optional().or(z.literal("")),
  productionTime: z.string().trim().max(255).optional().or(z.literal("")),
  deliveryInformation: z.string().trim().max(1000).optional().or(z.literal("")),

  seoTitle: z.string().trim().max(70).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(200).optional().or(z.literal("")),

  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  featured: z.boolean(),
});

function parseProductForm(formData: FormData) {
  return productFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    productCode: formData.get("productCode"),
    shortDescription: formData.get("shortDescription") ?? "",
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    discountPrice: formData.get("discountPrice"),
    categoryId: formData.get("categoryId"),
    material: formData.get("material") ?? "",
    dimensions: formData.get("dimensions") ?? "",
    productionTime: formData.get("productionTime") ?? "",
    deliveryInformation: formData.get("deliveryInformation") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    status: formData.get("status") ?? "DRAFT",
    featured: formData.get("featured") === "on",
  });
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function saveProductAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("EDITOR");
  if (!admin) return { error: "Bu işlem için yetkiniz yok." };

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: "Lütfen form alanlarını kontrol edin.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const input = parsed.data;

  if (
    input.discountPrice !== null &&
    input.price !== null &&
    input.discountPrice >= input.price
  ) {
    return {
      error: "Lütfen form alanlarını kontrol edin.",
      fieldErrors: { discountPrice: "İndirimli fiyat, normal fiyattan küçük olmalıdır" },
    };
  }

  const id = formData.get("id");
  const data = {
    name: input.name,
    slug: input.slug,
    productCode: input.productCode,
    shortDescription: input.shortDescription || null,
    description: input.description || null,
    price: input.price!.toFixed(2),
    discountPrice:
      input.discountPrice !== null ? input.discountPrice.toFixed(2) : null,
    categoryId: input.categoryId,
    material: input.material || null,
    dimensions: input.dimensions || null,
    productionTime: input.productionTime || null,
    deliveryInformation: input.deliveryInformation || null,
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    status: input.status,
    featured: input.featured,
  };

  try {
    let productId = typeof id === "string" && id ? id : null;
    const isNew = !productId;
    if (productId) {
      await prisma.product.update({ where: { id: productId }, data });
    } else {
      const created = await prisma.product.create({ data });
      productId = created.id;
    }
    await recordAudit({
      actor: admin,
      action: isNew ? "CREATE" : "UPDATE",
      entityType: "Product",
      entityId: productId,
      summary: isNew ? `${input.name} ürünü oluşturuldu` : `${input.name} ürünü güncellendi`,
      metadata: { status: input.status },
    });

    // Form ile seçilen görseller (yeni üründe de yüklenebilsin)
    const files = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    if (files.length > 0) {
      const existing = await prisma.productImage.count({ where: { productId } });
      for (const [index, file] of files.entries()) {
        const result = await saveImage(file);
        if (!result.ok) continue;
        await prisma.productImage.create({
          data: {
            productId,
            url: result.url,
            sortOrder: existing + index,
            isCover: existing === 0 && index === 0,
          },
        });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("products_slug_key")) {
      return { error: "Bu slug zaten kullanılıyor.", fieldErrors: { slug: "Bu slug zaten kullanılıyor" } };
    }
    if (message.includes("products_product_code_key")) {
      return { error: "Bu ürün kodu zaten kullanılıyor.", fieldErrors: { productCode: "Bu ürün kodu zaten kullanılıyor" } };
    }
    console.error("Product save failed:", error);
    return { error: "Ürün kaydedilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/urunler");
  redirect("/admin/products");
}

const deleteSchema = z.object({ id: z.string().uuid() });

export async function deleteProductAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;
  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return;

  const existing = await prisma.product.findUnique({
    where: { id: parsed.data.id },
    select: { name: true },
  });
  if (!existing) return;

  await prisma.product.delete({ where: { id: parsed.data.id } });
  await recordAudit({
    actor: admin,
    action: "DELETE",
    entityType: "Product",
    entityId: parsed.data.id,
    summary: `${existing.name} ürünü silindi`,
  });
  revalidatePath("/admin/products");
  revalidatePath("/urunler");
}

// ---------- Ürün görselleri ----------

const imageActionSchema = z.object({
  productId: z.string().uuid(),
  imageId: z.string().uuid(),
});

// Göreli yol (/api/media/x.png) veya allowlist'teki bir tam http(s) adresi
const mediaRef = mediaRefSchema;

// Dosyaları yükler ve ürüne ekler; çoklu seçim destekler
export async function uploadProductImageAction(formData: FormData): Promise<void> {
  const _imgAdmin = await requireRole("EDITOR");
  if (!_imgAdmin) return;

  const productId = z.string().uuid().safeParse(formData.get("productId"));
  const files = [
    ...formData.getAll("files"),
    ...formData.getAll("file"),
  ].filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (!productId.success || files.length === 0) {
    return;
  }

  let existing = await prisma.productImage.count({
    where: { productId: productId.data },
  });

  for (const file of files) {
    const result = await saveImage(file);
    if (!result.ok) continue;
    await prisma.productImage.create({
      data: {
        productId: productId.data,
        url: result.url,
        sortOrder: existing,
        isCover: existing === 0,
      },
    });
    existing += 1;
  }

  revalidatePath(`/admin/products/${productId.data}`);
}

export async function setCoverImageAction(formData: FormData): Promise<void> {
  const _imgAdmin = await requireRole("EDITOR");
  if (!_imgAdmin) return;
  const parsed = imageActionSchema.safeParse({
    productId: formData.get("productId"),
    imageId: formData.get("imageId"),
  });
  if (!parsed.success) return;

  const { productId, imageId } = parsed.data;

  // IDOR koruması: görsel gerçekten bu ürüne ait olmalı.
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    select: { productId: true },
  });
  if (!image || image.productId !== productId) return;

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId },
      data: { isCover: false },
    }),
    prisma.productImage.update({
      where: { id: imageId },
      data: { isCover: true },
    }),
  ]);

  revalidatePath(`/admin/products/${productId}`);
}

export async function updateImageMetaAction(formData: FormData): Promise<void> {
  const _imgAdmin = await requireRole("EDITOR");
  if (!_imgAdmin) return;

  const productId = z.string().uuid().safeParse(formData.get("productId"));
  if (!productId.success) return;

  const updates = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("order-")) continue;
    const imageId = key.replace("order-", "");
    const sortOrder = Number(value);
    if (
      !z.string().uuid().safeParse(imageId).success ||
      !Number.isInteger(sortOrder) ||
      sortOrder < 0 ||
      sortOrder > 999
    ) {
      continue;
    }
    const altValue = formData.get(`alt-${imageId}`);
    const altText =
      typeof altValue === "string" && altValue.trim() ? altValue.trim() : null;

    updates.push(
      prisma.productImage.updateMany({
        where: { id: imageId, productId: productId.data },
        data: { sortOrder, altText },
      }),
    );
  }

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
  revalidatePath(`/admin/products/${productId.data}`);
}

export async function addImageUrlAction(formData: FormData): Promise<void> {
  const _imgAdmin = await requireRole("EDITOR");
  if (!_imgAdmin) return;
  const schema = z.object({
    productId: z.string().uuid(),
    url: mediaRef,
    altText: z.string().trim().max(255).optional().or(z.literal("")),
  });
  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    url: formData.get("url"),
    altText: formData.get("altText") ?? "",
  });
  if (!parsed.success) return;

  const existing = await prisma.productImage.count({ where: { productId: parsed.data.productId } });
  const isOnlyImage = existing === 0;

  await prisma.productImage.create({
    data: {
      productId: parsed.data.productId,
      url: parsed.data.url,
      altText: parsed.data.altText || null,
      sortOrder: existing,
      isCover: isOnlyImage,
    },
  });

  revalidatePath(`/admin/products/${parsed.data.productId}`);
}

export async function deleteImageAction(formData: FormData): Promise<void> {
  const _imgAdmin = await requireRole("EDITOR");
  if (!_imgAdmin) return;
  const parsed = imageActionSchema.safeParse({
    productId: formData.get("productId"),
    imageId: formData.get("imageId"),
  });
  if (!parsed.success) return;

  const image = await prisma.productImage.findUnique({ where: { id: parsed.data.imageId } });
  if (!image || image.productId !== parsed.data.productId) return;

  await prisma.productImage.delete({ where: { id: image.id } });

  if (image.isCover) {
    const next = await prisma.productImage.findFirst({
      where: { productId: parsed.data.productId },
      orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
    });
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isCover: true } });
    }
  }

  revalidatePath(`/admin/products/${parsed.data.productId}`);
}
