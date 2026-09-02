import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta giriniz"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1, "Adet en az 1 olmalıdır").max(99),
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema).max(50),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;
export type CartInput = z.infer<typeof cartSchema>;
