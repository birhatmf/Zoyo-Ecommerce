import { z } from "zod";

const TR_PHONE_REGEX = /^(?:\+90|0)?5\d{9}$/;

export const trPhoneSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/[\s()-]/g, ""))
  .refine((val) => TR_PHONE_REGEX.test(val), {
    message: "Geçerli bir telefon numarası giriniz (05xx xxx xx xx)",
  })
  .transform((val) => {
    if (val.startsWith("+90")) return val;
    if (val.startsWith("0")) return `+90${val.slice(1)}`;
    return `+90${val}`;
  });

export const checkoutSchema = z.object({
  customerFirstName: z.string().trim().min(2, "Ad en az 2 karakter olmalıdır").max(100),
  customerLastName: z.string().trim().min(2, "Soyad en az 2 karakter olmalıdır").max(100),
  phone: trPhoneSchema,
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta giriniz")
    .optional()
    .or(z.literal("")),

  city: z.string().trim().min(2, "İl giriniz").max(100),
  district: z.string().trim().min(2, "İlçe giriniz").max(100),
  address: z.string().trim().min(10, "Adres en az 10 karakter olmalıdır").max(1000),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Posta kodu 5 haneli olmalıdır")
    .optional()
    .or(z.literal("")),

  invoiceType: z.enum(["INDIVIDUAL", "CORPORATE"]).default("INDIVIDUAL"),
  tcNumber: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "T.C. Kimlik Numarası 11 haneli olmalıdır")
    .optional()
    .or(z.literal("")),
  companyName: z.string().trim().max(200).optional().or(z.literal("")),
  taxOffice: z.string().trim().max(100).optional().or(z.literal("")),
  taxNumber: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "Vergi numarası 10 veya 11 haneli olmalıdır")
    .optional()
    .or(z.literal("")),
  invoiceAddress: z.string().trim().max(1000).optional().or(z.literal("")),

  note: z.string().trim().max(2000).optional().or(z.literal("")),

  acceptDistanceSales: z.literal(true, {
    message: "Mesafeli satış sözleşmesini kabul etmelisiniz",
  }),
  acceptKvkk: z.literal(true, {
    message: "KVKK aydınlatma metnini kabul etmelisiniz",
  }),
  acceptPrivacy: z.literal(true, {
    message: "Gizlilik politikasını kabul etmelisiniz",
  }),

  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Sepetiniz boş"),
});

export const checkoutSchemaWithInvoice = checkoutSchema.superRefine((data, ctx) => {
  if (data.invoiceType === "CORPORATE") {
    if (!data.companyName || data.companyName.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["companyName"],
        message: "Şirket ünvanı giriniz",
      });
    }
    if (!data.taxOffice) {
      ctx.addIssue({
        code: "custom",
        path: ["taxOffice"],
        message: "Vergi dairesi giriniz",
      });
    }
    if (!data.taxNumber) {
      ctx.addIssue({
        code: "custom",
        path: ["taxNumber"],
        message: "Vergi numarası giriniz",
      });
    }
  }
});

export type CheckoutInput = z.infer<typeof checkoutSchemaWithInvoice>;

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "APPROVED",
    "PAYMENT_PENDING",
    "PAID",
    "IN_PRODUCTION",
    "READY",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
