"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Minus, Plus, Trash2 } from "lucide-react";

import { formatPrice } from "@/lib/utils/format";
import type { CartItem as CartItemType } from "@/lib/types";
import { useCartStore } from "@/stores/cartStore";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps): ReactElement {
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const reducedMotion = useReducedMotion();
  const [isPendingRemoval, setIsPendingRemoval] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect((): (() => void) | void => {
    if (!isPendingRemoval) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
    }, 140);

    return (): void => {
      window.clearTimeout(timeoutId);
    };
  }, [isPendingRemoval]);

  function handleDecrease(): void {
    if (item.quantity <= 1 || isPendingRemoval) {
      return;
    }

    updateQuantity(item.id, item.quantity - 1);
  }

  function handleIncrease(): void {
    if (isPendingRemoval) {
      return;
    }

    updateQuantity(item.id, item.quantity + 1);
  }

  function handleRemove(): void {
    if (isPendingRemoval) {
      return;
    }

    setIsPendingRemoval(true);
  }

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={(): void => {
        if (isPendingRemoval) {
          removeItem(item.id);
        }
      }}
    >
      {isVisible ? (
        <motion.article
          animate={{ opacity: 1, x: 0 }}
          className="grid gap-4 rounded-lg border border-border-warm bg-cream p-4 shadow-card sm:grid-cols-[80px_minmax(0,1fr)] lg:grid-cols-[80px_minmax(0,1fr)_auto]"
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
          initial={{ opacity: 0, x: reducedMotion ? 0 : 24 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <div className="relative aspect-[3/4] w-20 overflow-hidden rounded-sm bg-ivory">
            <Image
              alt={item.productName}
              className="object-cover"
              fill
              sizes="80px"
              src={item.productImage}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <h2 className="line-clamp-2 font-dm-sans text-body-sm font-medium text-text-primary">
                  {item.productName}
                </h2>
                <p className="font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
                  {item.size} / {item.color}
                </p>
                <p className="font-dm-sans text-body-sm text-text-secondary">
                  {formatPrice(item.price, item.currency)} each
                </p>
              </div>

              <button
                aria-label={`Remove ${item.productName}`}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-transparent text-text-muted transition-colors hover:text-error disabled:cursor-not-allowed disabled:text-success"
                disabled={isPendingRemoval}
                onClick={handleRemove}
                type="button"
              >
                {isPendingRemoval ? (
                  <Check className="size-4" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="inline-flex w-fit items-center rounded-full border border-border-warm bg-ivory">
                <button
                  aria-label={`Decrease quantity for ${item.productName}`}
                  className="inline-flex h-11 w-11 items-center justify-center text-obsidian transition-colors hover:text-gold disabled:cursor-not-allowed disabled:text-text-muted"
                  disabled={isPendingRemoval}
                  onClick={handleDecrease}
                  type="button"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-10 text-center font-dm-sans text-body-sm font-medium text-obsidian">
                  {item.quantity}
                </span>
                <button
                  aria-label={`Increase quantity for ${item.productName}`}
                  className="inline-flex h-11 w-11 items-center justify-center text-obsidian transition-colors hover:text-gold disabled:cursor-not-allowed disabled:text-text-muted"
                  disabled={isPendingRemoval}
                  onClick={handleIncrease}
                  type="button"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <div className="space-y-1 text-left sm:text-right">
                <p className="font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
                  {isPendingRemoval ? "Removing" : "Line total"}
                </p>
                <p className="font-dm-sans text-price font-semibold text-obsidian">
                  {formatPrice(item.price * item.quantity, item.currency)}
                </p>
              </div>
            </div>
          </div>
        </motion.article>
      ) : null}
    </AnimatePresence>
  );
}
