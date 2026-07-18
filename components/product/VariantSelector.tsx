"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";

import ColorSelector from "@/components/product/ColorSelector";
import SizeSelector from "@/components/product/SizeSelector";
import type { ProductVariant } from "@/lib/types";

interface VariantSelectorProps {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant | null) => void;
}

export default function VariantSelector({
  variants,
  onVariantChange,
}: VariantSelectorProps): ReactElement {
  const firstAvailableVariant = variants.find((variant) => variant.stock > 0);
  const [selectedColor, setSelectedColor] = useState<string>(
    firstAvailableVariant?.color ?? "",
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    firstAvailableVariant?.size ?? "",
  );

  const selectedVariant = useMemo((): ProductVariant | null => {
    if (!selectedColor || !selectedSize) {
      return null;
    }

    return (
      variants.find(
        (variant) =>
          variant.color === selectedColor && variant.size === selectedSize,
      ) ?? null
    );
  }, [selectedColor, selectedSize, variants]);

  useEffect((): void => {
    onVariantChange(selectedVariant);
  }, [onVariantChange, selectedVariant]);

  function handleColorChange(color: string): void {
    setSelectedColor(color);
    setSelectedSize((currentSize) => {
      const currentSizeStillAvailable = variants.some(
        (variant) =>
          variant.color === color &&
          variant.size === currentSize &&
          variant.stock > 0,
      );

      if (currentSizeStillAvailable) {
        return currentSize;
      }

      return (
        variants.find((variant) => variant.color === color && variant.stock > 0)
          ?.size ?? ""
      );
    });
  }

  return (
    <div className="space-y-6">
      <ColorSelector
        onColorChange={handleColorChange}
        selectedColor={selectedColor}
        variants={variants}
      />
      <SizeSelector
        onSizeChange={setSelectedSize}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        variants={variants}
      />
    </div>
  );
}
