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

  categoryIds: z.array(z.string().uuid("Geçersiz kategori")).default([]),

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
    categoryIds: formData.getAll("categoryIds"),
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
    const categoryLinks = input.categoryIds.map((catId) => ({ id: catId }));
    if (productId) {
      await prisma.product.update({
        where: { id: productId },
        data: { ...data, categories: { set: categoryLinks } },
      });
    } else {
      const created = await prisma.product.create({
        data: { ...data, categories: { connect: categoryLinks } },
      });
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

    // Görseller: silme, sıralama, kapak ve yeni dosya/URL ekleme işlemleri
    // form ile gönderilen plana göre tek seferde uygulanır.
    await applyProductImagePlan(productId, formData);
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

const bulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  action: z.enum(["activate", "deactivate", "set-category", "delete"]),
  categoryId: z.string().uuid().optional(),
});

// Toplu ürün işlemleri: yayınla / pasife al / kategori ata.
export async function bulkProductAction(formData: FormData): Promise<void> {
  const admin = await requireRole("EDITOR");
  if (!admin) return;

  const parsed = bulkSchema.safeParse({
    ids: formData.getAll("ids"),
    action: formData.get("bulkAction"),
    categoryId: formData.get("categoryId") || undefined,
  });
  if (!parsed.success) return;

  const { ids, action, categoryId } = parsed.data;

  if (action === "activate") {
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status: "ACTIVE" },
    });
  } else if (action === "deactivate") {
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status: "INACTIVE" },
    });
  } else if (action === "set-category") {
    if (!categoryId) return;
    await Promise.all(
      ids.map((productId) =>
        prisma.product.update({
          where: { id: productId },
          data: { categories: { set: [{ id: categoryId }] } },
        }),
      ),
    );
  } else if (action === "delete") {
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
  }

  await recordAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Product",
    entityId: null,
    summary: `Toplu işlem: ${action} (${ids.length} ürün)`,
  });
  revalidatePath("/admin/products");
  revalidatePath("/urunler");
}

// ---------- Ürün görselleri ----------

const productImagePlanEntrySchema = z.discriminatedUnion("t", [
  z.object({ t: z.literal("e"), id: z.string().uuid(), alt: z.string().max(255).default("") }),
  z.object({ t: z.literal("n"), alt: z.string().max(255).default("") }),
  z.object({ t: z.literal("u"), url: mediaRefSchema, alt: z.string().max(255).default("") }),
]);

const productImagePlanSchema = z.array(productImagePlanEntrySchema).max(100);

// Formdan gelen gizli görsel meta alanlarını (plan / silinecekler / kapak) çözer.
function parseProductImageMeta(formData: FormData) {
  const planRaw = formData.get("imagePlan");
  let plan: z.infer<typeof productImagePlanEntrySchema>[] = [];
  if (typeof planRaw === "string" && planRaw.trim()) {
    try {
      const parsed = productImagePlanSchema.safeParse(JSON.parse(planRaw));
      if (parsed.success) plan = parsed.data;
    } catch {
      // Geçersiz JSON → plan yok sayılır.
    }
  }

  const removeRaw = formData.get("removeImageIds");
  let removeIds: string[] = [];
  if (typeof removeRaw === "string" && removeRaw.trim()) {
    try {
      const parsed = z
        .array(z.string().uuid())
        .max(100)
        .safeParse(JSON.parse(removeRaw));
      if (parsed.success) removeIds = parsed.data;
    } catch {
      // Geçersiz JSON → yok sayılır.
    }
  }

  const coverRaw = formData.get("coverIndex");
  const parsedCover = typeof coverRaw === "string" ? Number(coverRaw) : -1;

  return {
    plan,
    removeIds,
    coverIndex: Number.isInteger(parsedCover) ? parsedCover : -1,
  };
}

// Görselleri plana göre uygular: silme, sıralama, kapak, yeni dosya ve URL.
// Görsel planı gönderilmezse (JS'siz kullanım) dosyalar sırayla eklenir.
async function applyProductImagePlan(productId: string, formData: FormData) {
  const { plan, removeIds, coverIndex } = parseProductImageMeta(formData);
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (removeIds.length > 0) {
    await prisma.productImage.deleteMany({
      where: { id: { in: removeIds }, productId },
    });
  }

  if (plan.length === 0 && files.length > 0) {
    const existing = await prisma.productImage.count({ where: { productId } });
    for (const [index, file] of files.entries()) {
      const saved = await saveImage(file);
      if (!saved.ok) continue;
      await prisma.productImage.create({
        data: {
          productId,
          url: saved.url,
          sortOrder: existing + index,
          isCover: existing === 0 && index === 0,
        },
      });
    }
    return;
  }

  let fileIndex = 0;
  let position = 0;

  for (const entry of plan) {
    if (entry.t === "e") {
      // IDOR koruması: yalnızca bu ürüne ait görseller güncellenir.
      const result = await prisma.productImage.updateMany({
        where: { id: entry.id, productId },
        data: {
          altText: entry.alt || null,
          sortOrder: position,
          isCover: position === coverIndex,
        },
      });
      if (result.count > 0) position += 1;
      continue;
    }

    if (entry.t === "n") {
      const file = files[fileIndex];
      fileIndex += 1;
      if (!file) continue;
      const saved = await saveImage(file);
      if (!saved.ok) continue;
      await prisma.productImage.create({
        data: {
          productId,
          url: saved.url,
          altText: entry.alt || null,
          sortOrder: position,
          isCover: position === coverIndex,
        },
      });
      position += 1;
      continue;
    }

    await prisma.productImage.create({
      data: {
        productId,
        url: entry.url,
        altText: entry.alt || null,
        sortOrder: position,
        isCover: position === coverIndex,
      },
    });
    position += 1;
  }

  // Kapak garantisi: hiç kapak yoksa ilk görsel kapak yapılır; birden fazla
  // kapak kaldıysa yalnızca en baştaki bırakılır.
  const covers = await prisma.productImage.findMany({
    where: { productId, isCover: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });
  if (covers.length === 0) {
    const first = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    if (first) {
      await prisma.productImage.update({
        where: { id: first.id },
        data: { isCover: true },
      });
    }
  } else if (covers.length > 1) {
    await prisma.productImage.updateMany({
      where: { productId, isCover: true, id: { not: covers[0].id } },
      data: { isCover: false },
    });
  }
}
