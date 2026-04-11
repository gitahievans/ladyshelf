"use client";

import type { ReactElement } from "react";
import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";
import type { ProductVariant } from "@/lib/types";

interface ColorSelectorProps {
  variants: ProductVariant[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

interface ColorOption {
  name: string;
  isAvailable: boolean;
  swatchClassName: string;
}

function getSwatchClassName(colorName: string): string {
  const normalized = colorName.toLowerCase();

  if (normalized.includes("ivory") || normalized.includes("cream") || normalized.includes("white") || normalized.includes("pearl")) {
    return "bg-ivory border border-border-warm";
  }

  if (normalized.includes("gold") || normalized.includes("champagne") || normalized.includes("sunrise")) {
    return "bg-gold";
  }

  if (normalized.includes("sand") || normalized.includes("raffia") || normalized.includes("natural")) {
    return "bg-sand";
  }

  if (normalized.includes("green")) {
    return "bg-success";
  }

  if (normalized.includes("terracotta") || normalized.includes("rust") || normalized.includes("red")) {
    return "bg-warning";
  }

  if (normalized.includes("blue") || normalized.includes("navy")) {
    return "bg-gradient-to-br from-obsidian to-success";
  }

  if (normalized.includes("purple") || normalized.includes("rose")) {
    return "bg-gradient-to-br from-bark to-gold";
  }

  if (normalized.includes("mahogany") || normalized.includes("brown") || normalized.includes("bark")) {
    return "bg-bark";
  }

  return "bg-obsidian";
}

export default function ColorSelector({
  variants,
  selectedColor,
  onColorChange,
}: ColorSelectorProps): ReactElement {
  const colorOptions = useMemo((): ColorOption[] => {
    const colorMap = new Map<string, ColorOption>();

    variants.forEach((variant) => {
      const current = colorMap.get(variant.color);
      const isAvailable = variant.stock > 0;

      colorMap.set(variant.color, {
        name: variant.color,
        isAvailable: current?.isAvailable ? true : isAvailable,
        swatchClassName: getSwatchClassName(variant.color),
      });
    });

    return [...colorMap.values()];
  }, [variants]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-text-muted">
          Colour
        </p>
        <p className="font-dm-sans text-body-sm text-text-secondary">
          {selectedColor || "Choose a colour"}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {colorOptions.map((option) => {
          const isSelected = option.name === selectedColor;

          return (
            <button
              aria-label={option.name}
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-transparent transition-transform hover:scale-105",
                !option.isAvailable && "cursor-not-allowed opacity-60",
              )}
              disabled={!option.isAvailable}
              key={option.name}
              onClick={(): void => onColorChange(option.name)}
              title={option.name}
              type="button"
            >
              <span
                className={cn(
                  "relative block size-8 rounded-full",
                  option.swatchClassName,
                  isSelected && "ring-2 ring-gold ring-offset-2 ring-offset-ivory",
                )}
              >
                {!option.isAvailable ? (
                  <span className="absolute inset-x-0 top-1/2 h-px -rotate-45 bg-obsidian" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
