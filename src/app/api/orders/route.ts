import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getSiteSettings } from "@/lib/settings";
import { checkoutSchemaWithInvoice } from "@/validations/order";

function effectiveUnitPrice(product: {
  price: PrismaDecimal;
  discountPrice: PrismaDecimal | null;
}): number {
  const discount = product.discountPrice
    ? Number(product.discountPrice)
    : null;
  const base = Number(product.price);
  return discount !== null && discount > 0 && discount < base ? discount : base;
}

type PrismaDecimal = { toString(): string };

export async function POST(request: NextRequest) {
  // Sipariş spam'ine karşı sıkı limit: IP başına 10 dakikada 5 talep
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`order-create:${ip}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Çok fazla sipariş talebi gönderildi. Lütfen bir süre sonra tekrar deneyin." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = checkoutSchemaWithInvoice.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { error: "Lütfen form alanlarını kontrol edin.", fieldErrors },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // Aynı üründen birden fazla satır birleştirilir
  const quantities = new Map<string, number>();
  for (const item of input.items) {
    quantities.set(
      item.productId,
      Math.min(99, (quantities.get(item.productId) ?? 0) + item.quantity),
    );
  }

  const settings = await getSiteSettings();
  const prefix = settings.orderPrefix || "ZY";
  const year = new Date().getFullYear();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...quantities.keys()] }, status: "ACTIVE" },
      });

      if (products.length !== quantities.size) {
        return NextResponse.json(
          {
            error:
              "Sepetinizdeki bazı ürünler artık mevcut değil. Lütfen sepetinizi güncelleyin.",
          },
          { status: 409 },
        );
      }

      let subtotal = 0;
      for (const product of products) {
        subtotal += effectiveUnitPrice(product) * quantities.get(product.id)!;
      }
      subtotal = Number(subtotal.toFixed(2));

      // Atomik sipariş numarası üretimi
      const sequence = await tx.orderSequence.upsert({
        where: { year },
        update: { lastNo: { increment: 1 } },
        create: { year, lastNo: 1 },
      });
      const orderNumber = `${prefix}-${year}-${String(sequence.lastNo).padStart(6, "0")}`;

      await tx.order.create({
        data: {
          orderNumber,
          customerFirstName: input.customerFirstName,
          customerLastName: input.customerLastName,
          phone: input.phone,
          phoneNormalized: input.phone,
          email: input.email || null,
          city: input.city,
          district: input.district,
          address: input.address,
          postalCode: input.postalCode || null,
          invoiceType: input.invoiceType,
          tcNumber:
            input.invoiceType === "INDIVIDUAL" && input.tcNumber
              ? input.tcNumber
              : null,
          companyName:
            input.invoiceType === "CORPORATE" ? (input.companyName || null) : null,
          taxOffice:
            input.invoiceType === "CORPORATE" ? (input.taxOffice || null) : null,
          taxNumber:
            input.invoiceType === "CORPORATE" ? (input.taxNumber || null) : null,
          invoiceAddress: input.invoiceAddress || null,
          subtotal: subtotal.toFixed(2),
          total: subtotal.toFixed(2),
          status: "PENDING",
          customerNote: input.note || null,
          acceptedTerms: {
            kvkk: true,
            privacy: true,
            distanceSales: true,
            acceptedAt: new Date().toISOString(),
          },
          items: {
            create: products.map((product) => {
              const quantity = quantities.get(product.id)!;
              const unitPrice = effectiveUnitPrice(product);
              return {
                productId: product.id,
                productName: product.name,
                productCode: product.productCode,
                quantity,
                unitPrice: unitPrice.toFixed(2),
                totalPrice: (unitPrice * quantity).toFixed(2),
              };
            }),
          },
        },
      });

      return NextResponse.json({ orderNumber }, { status: 201 });
    });

    return result;
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: "Sipariş oluşturulamadı. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
