"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";
import type { ProductVariant, Size } from "@/lib/types";

interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedColor: string;
  selectedSize: string;
  onSizeChange: (size: string) => void;
}

const sizeOrder: Size[] = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

export default function SizeSelector({
  variants,
  selectedColor,
  selectedSize,
  onSizeChange,
}: SizeSelectorProps): ReactElement {
  const sizes = useMemo((): Size[] => {
    const sizeSet = new Set<Size>(
      variants
        .filter((variant) => !selectedColor || variant.color === selectedColor)
        .map((variant) => variant.size),
    );

    return sizeOrder.filter((size) => sizeSet.has(size));
  }, [selectedColor, variants]);

  function isSizeAvailable(size: string): boolean {
    if (!selectedColor) {
      return false;
    }

    return variants.some(
      (variant) =>
        variant.color === selectedColor &&
        variant.size === size &&
        variant.stock > 0,
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-text-muted">
          Size
        </p>
        <p className="font-dm-sans text-body-sm text-text-secondary">
          {selectedSize || "Choose your fit"}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => {
          const available = isSizeAvailable(size);
          const isSelected = size === selectedSize;

          return (
            <button
              className={cn(
                "min-h-11 min-w-11 rounded-full border px-4 py-2 font-dm-sans text-body-sm transition-colors",
                isSelected
                  ? "border-obsidian bg-obsidian text-ivory"
                  : "border-border-warm bg-cream text-text-secondary",
                available && !isSelected && "hover:border-gold",
                !available &&
                  "cursor-not-allowed border-border-warm bg-ivory text-text-muted line-through",
              )}
              disabled={!available}
              key={size}
              onClick={(): void => onSizeChange(size)}
              type="button"
            >
              {size}
            </button>
          );
        })}
      </div>

      <button
        className="font-dm-sans text-body-sm text-gold transition-colors hover:text-bark"
        type="button"
      >
        Size Guide
      </button>
    </div>
  );
}
