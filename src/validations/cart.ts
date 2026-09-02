import { z } from "zod";

export const cartItemsSchema = z.object({
  productIds: z
    .array(z.string().uuid())
    .min(1)
    .max(99),
});

export type CartItemsInput = z.infer<typeof cartItemsSchema>;
