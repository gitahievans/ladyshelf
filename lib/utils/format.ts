import type { ColorName, ProductVariant, Size } from "@/lib/types";

interface AvailableColor {
  name: ColorName;
  hex: string;
}

export function formatPrice(amount: number, currency: string = "KES"): string {
  return `${currency} ${amount.toLocaleString("en-KE")}`;
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function discountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

export function isInStock(variants: ProductVariant[]): boolean {
  return variants.some((variant) => variant.stock > 0);
}

export function getAvailableSizes(variants: ProductVariant[]): Size[] {
  return [...new Set(variants.filter((variant) => variant.stock > 0).map((variant) => variant.size))];
}

export function getAvailableColors(
  variants: ProductVariant[],
): AvailableColor[] {
  const seen = new Set<string>();

  return variants
    .filter((variant) => variant.stock > 0)
    .filter((variant) => {
      if (seen.has(variant.color)) {
        return false;
      }

      seen.add(variant.color);
      return true;
    })
    .map((variant) => ({ name: variant.color, hex: variant.colorHex }));
}
