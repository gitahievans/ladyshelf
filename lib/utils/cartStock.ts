import { allProducts } from "@/lib/mock";
import type { CartItem } from "@/lib/types";

export function getAvailableCartItemStock(item: CartItem): number {
  const product = allProducts.find((entry) => entry.id === item.productId);
  const variant = product?.variants.find((entry) => entry.id === item.variantId);

  return variant?.stock ?? 0;
}

export function clampCartItemQuantity(item: CartItem): CartItem | null {
  const availableStock = getAvailableCartItemStock(item);

  if (availableStock <= 0) {
    return null;
  }

  return {
    ...item,
    quantity: Math.min(item.quantity, availableStock),
  };
}

export function buildCartStockLimitMessage(item: CartItem, availableStock: number): string {
  const pieceLabel = availableStock === 1 ? "piece" : "pieces";

  return `Only ${availableStock} ${pieceLabel} remain for ${item.productName}.`;
}
