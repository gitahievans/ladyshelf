import type { CartItem, Product } from "@/lib/types";

export interface CartStockAdjustment {
  availableStock: number;
  item: CartItem;
  type: "quantity_reduced" | "removed";
}

function getProductVariantStock(item: CartItem, products: Product[]): number {
  const product = products.find((entry) => entry.id === item.productId);
  const variant = product?.variants.find((entry) => entry.id === item.variantId);

  return variant?.stock ?? 0;
}

export function getAvailableCartItemStock(
  item: CartItem,
  products: Product[],
): number {
  return getProductVariantStock(item, products);
}

export function reconcileCartItemsWithProducts(
  items: CartItem[],
  products: Product[],
): {
  adjustments: CartStockAdjustment[];
  items: CartItem[];
} {
  const adjustments: CartStockAdjustment[] = [];
  const nextItems: CartItem[] = [];

  items.forEach((item) => {
    const availableStock = getProductVariantStock(item, products);

    if (availableStock <= 0) {
      adjustments.push({
        availableStock,
        item,
        type: "removed",
      });
      return;
    }

    if (item.quantity > availableStock) {
      adjustments.push({
        availableStock,
        item,
        type: "quantity_reduced",
      });
      nextItems.push({
        ...item,
        quantity: availableStock,
      });
      return;
    }

    nextItems.push(item);
  });

  return {
    adjustments,
    items: nextItems,
  };
}

export function buildCartStockLimitMessage(
  item: CartItem,
  availableStock: number,
): string {
  const pieceLabel = availableStock === 1 ? "piece" : "pieces";

  return `Only ${availableStock} ${pieceLabel} remain for ${item.productName}.`;
}

export function buildCartStockAdjustmentMessage(
  adjustment: CartStockAdjustment,
): string {
  if (adjustment.type === "removed") {
    return `${adjustment.item.productName} (${adjustment.item.color} / ${adjustment.item.size}) is now out of stock and was removed from your bag.`;
  }

  return buildCartStockLimitMessage(adjustment.item, adjustment.availableStock);
}
