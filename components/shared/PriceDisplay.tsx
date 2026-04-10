import type { ReactElement } from "react";

import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<PriceDisplayProps["size"]>, string> = {
  lg: "text-h4",
  md: "text-price",
  sm: "text-body-sm",
};

export default function PriceDisplay({
  price,
  originalPrice,
  currency = "KES",
  size = "md",
}: PriceDisplayProps): ReactElement {
  const currentPriceClasses = cn(
    "font-dm-sans font-semibold",
    originalPrice ? "text-gold" : "text-obsidian",
    sizeClasses[size],
  );
  const originalPriceClasses = cn(
    "font-dm-sans text-text-muted line-through",
    size === "lg" ? "text-body" : "text-caption",
  );

  return (
    <div className="flex items-center gap-2">
      {originalPrice ? (
        <span className={originalPriceClasses}>
          {formatPrice(originalPrice, currency)}
        </span>
      ) : null}
      <span className={currentPriceClasses}>{formatPrice(price, currency)}</span>
    </div>
  );
}
