"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import {
  buildCartStockLimitMessage,
  getAvailableCartItemStock,
} from "@/lib/utils/cartStock";
import type { CartItem } from "@/lib/types";
import { useCartStore } from "@/stores/cartStore";

interface CartQuantityControlProps {
  item: CartItem;
  compact?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function CartQuantityControl({
  item,
  compact = false,
  disabled = false,
  className,
}: CartQuantityControlProps): ReactElement {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const [stockMessage, setStockMessage] = useState<string>("");
  const availableStock = getAvailableCartItemStock(item);

  useEffect((): (() => void) | void => {
    if (!stockMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStockMessage("");
    }, 2800);

    return (): void => {
      window.clearTimeout(timeoutId);
    };
  }, [stockMessage]);

  function handleDecrease(): void {
    if (disabled || item.quantity <= 1) {
      return;
    }

    setStockMessage("");
    updateQuantity(item.id, item.quantity - 1);
  }

  function handleIncrease(): void {
    if (disabled) {
      return;
    }

    if (availableStock <= item.quantity) {
      setStockMessage(buildCartStockLimitMessage(item, availableStock));
      return;
    }

    setStockMessage("");
    updateQuantity(item.id, item.quantity + 1);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "inline-flex w-fit items-center rounded-full border border-border-warm bg-ivory",
          compact ? "self-start" : "",
        )}
      >
        <button
          aria-label={`Decrease quantity for ${item.productName}`}
          className={cn(
            "inline-flex items-center justify-center text-obsidian transition-colors hover:text-gold disabled:cursor-not-allowed disabled:text-text-muted",
            compact ? "h-10 w-10" : "h-11 w-11",
          )}
          disabled={disabled}
          onClick={handleDecrease}
          type="button"
        >
          <Minus className="size-4" />
        </button>
        <span
          className={cn(
            "text-center font-dm-sans text-body-sm font-medium text-obsidian",
            compact ? "min-w-8" : "min-w-10",
          )}
        >
          {item.quantity}
        </span>
        <button
          aria-label={`Increase quantity for ${item.productName}`}
          className={cn(
            "inline-flex items-center justify-center text-obsidian transition-colors hover:text-gold disabled:cursor-not-allowed disabled:text-text-muted",
            compact ? "h-10 w-10" : "h-11 w-11",
          )}
          disabled={disabled}
          onClick={handleIncrease}
          type="button"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {stockMessage ? (
        <p className="max-w-xs font-dm-sans text-caption text-gold">
          {stockMessage}
        </p>
      ) : null}
    </div>
  );
}
