import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { cartItemsSchema } from "@/validations/cart";

// Sepette görünen ürünler her istekte database'den doğrulanır:
// pasif/draft ürünler sepette kalsa bile döndürülmez (CART-004).
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const parsed = cartItemsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz sepet verisi" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: parsed.data.productIds },
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      discountPrice: true,
      images: {
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
    },
  });

  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: String(product.price),
      discountPrice:
        product.discountPrice !== null ? String(product.discountPrice) : null,
      imageUrl: product.images[0]?.url ?? null,
    })),
  });
}
