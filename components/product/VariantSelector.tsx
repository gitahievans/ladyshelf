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
  const availableColors = useMemo((): string[] => {
    const colors = new Set<string>();

    variants.forEach((variant) => {
      if (variant.stock > 0) {
        colors.add(variant.color);
      }
    });

    return [...colors];
  }, [variants]);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect((): void => {
    if (!selectedColor && availableColors.length > 0) {
      setSelectedColor(availableColors[0] ?? "");
    }
  }, [availableColors, selectedColor]);

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

      return currentSizeStillAvailable ? currentSize : "";
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
