import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Ürün adı en az 2 karakter olmalıdır").max(255),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug formatı geçersiz (örn: lina-bahce-takimi)"),
  productCode: z.string().trim().min(1, "Ürün kodu zorunludur").max(50),

  shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),

  price: z.number({ message: "Geçerli bir fiyat giriniz" }).positive("Fiyat 0'dan büyük olmalıdır"),
  discountPrice: z.number().positive().nullable().optional(),

  categoryId: z.string().uuid().nullable().optional(),

  material: z.string().trim().max(255).optional().or(z.literal("")),
  dimensions: z.string().trim().max(255).optional().or(z.literal("")),
  productionTime: z.string().trim().max(255).optional().or(z.literal("")),
  deliveryInformation: z.string().trim().max(1000).optional().or(z.literal("")),

  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).default("DRAFT"),
  featured: z.boolean().default(false),
}).refine(
  (data) => data.discountPrice == null || data.discountPrice < data.price,
  { message: "İndirimli fiyat, normal fiyattan küçük olmalıdır", path: ["discountPrice"] },
);

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Kategori adı en az 2 karakter olmalıdır").max(255),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug formatı geçersiz"),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const bankAccountSchema = z.object({
  bankName: z.string().trim().min(2, "Banka adı zorunludur").max(255),
  accountHolder: z.string().trim().min(2, "Hesap sahibi zorunludur").max(255),
  iban: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s/g, "").toUpperCase())
    .refine((v) => /^TR\d{24}$/.test(v), {
      message: "Geçerli bir IBAN giriniz (TR ile başlayan 26 karakter)",
    }),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BankAccountInput = z.infer<typeof bankAccountSchema>;
