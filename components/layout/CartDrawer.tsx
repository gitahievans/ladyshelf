"use client";

import { type ReactElement, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";

import CartQuantityControl from "@/components/cart/CartQuantityControl";
import EmptyState from "@/components/shared/EmptyState";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { slideInRight, slideUpVariant } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import { useCartStore } from "@/stores/cartStore";

function useIsMobileDrawer(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect((): (() => void) => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    function updateMatch(event: MediaQueryList | MediaQueryListEvent): void {
      setIsMobile(event.matches);
    }

    updateMatch(mediaQuery);
    mediaQuery.addEventListener("change", updateMatch);

    return (): void => {
      mediaQuery.removeEventListener("change", updateMatch);
    };
  }, []);

  return isMobile;
}

export default function CartDrawer(): ReactElement {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const subtotal = useCartStore((state) => state.subtotal);
  const totalItems = useCartStore((state) => state.totalItems);
  const removeItem = useCartStore((state) => state.removeItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isMobile = useIsMobileDrawer();
  const reducedMotion = useReducedMotion();
  const overlayVariants: Variants = reducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      };
  const drawerVariants: Variants | undefined = reducedMotion
    ? undefined
    : isMobile
      ? (slideUpVariant as Variants)
      : (slideInRight as Variants);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(nextOpen): void => {
        if (nextOpen !== isOpen) {
          toggleCart();
        }
      }}
    >
      <AnimatePresence>
        {isOpen ? (
          <SheetPrimitive.Portal forceMount>
            <SheetPrimitive.Overlay asChild forceMount>
              <motion.div
                animate="visible"
                className="fixed inset-0 z-50 bg-obsidian/60"
                exit="hidden"
                initial="hidden"
                onClick={toggleCart}
                variants={overlayVariants}
              />
            </SheetPrimitive.Overlay>
            <SheetPrimitive.Content
              asChild
              forceMount
            >
              <motion.aside
                animate="visible"
                className={cn(
                  "fixed z-[60] flex flex-col overflow-hidden border border-bark/20 bg-ivory text-obsidian",
                  isMobile
                    ? "right-0 bottom-0 left-0 max-h-[85vh] rounded-t-3xl shadow-bottom-sheet"
                    : "top-0 right-0 h-full w-full max-w-sm shadow-drawer",
                )}
                exit="exit"
                initial="hidden"
                variants={drawerVariants}
              >
                <SheetHeader className="border-b border-border-warm px-5 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <SheetTitle className="font-cormorant text-h3 text-obsidian">
                        Your Bag ({totalItems} items)
                      </SheetTitle>
                      <p className="font-dm-sans text-body-sm text-text-secondary">
                        Pieces chosen with intention.
                      </p>
                    </div>
                    <button
                      aria-label="Close bag"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-warm text-obsidian transition-colors hover:border-gold hover:text-gold"
                      onClick={toggleCart}
                      type="button"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-5 py-5">
                  {items.length === 0 ? (
                    <div className="py-16">
                      <EmptyState
                        className="border-none bg-transparent px-0 py-0 shadow-none"
                        description="Your next signature piece is waiting."
                        title="Your cart is ready for something great."
                      />
                      <div className="mt-6 flex justify-center">
                        <Button
                          asChild
                          className="h-11 rounded-full bg-gold px-6 font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
                        >
                          <Link href="/shop" onClick={toggleCart}>
                            Shop the Collection
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 rounded-lg border border-border-warm bg-cream p-3"
                        >
                          <div className="relative h-20 w-[60px] shrink-0 overflow-hidden rounded-sm bg-ivory">
                            <Image
                              alt={item.productName}
                              className="object-cover"
                              fill
                              sizes="60px"
                              src={item.productImage}
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 space-y-1">
                                <p className="line-clamp-2 font-dm-sans text-body-sm font-medium text-text-primary">
                                  {item.productName}
                                </p>
                                <p className="font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
                                  {item.size} / {item.color}
                                </p>
                              </div>
                              <button
                                aria-label={`Remove ${item.productName}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:text-error"
                                onClick={(): void => removeItem(item.id)}
                                type="button"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>

                            <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                              <CartQuantityControl compact item={item} />

                              <PriceDisplay
                                currency={item.currency}
                                price={item.price * item.quantity}
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {items.length > 0 ? (
                  <SheetFooter className="border-t border-border-warm bg-ivory px-5 py-5">
                    <div className="flex items-center justify-between">
                      <p className="font-dm-sans text-body-sm uppercase tracking-[0.14em] text-text-muted">
                        Subtotal
                      </p>
                      <p className="font-dm-sans text-price font-semibold text-obsidian">
                        {formatPrice(subtotal)}
                      </p>
                    </div>
                    <Button
                      asChild
                      className="h-12 w-full rounded-full border border-bark/20 bg-transparent font-dm-sans text-body-sm font-medium text-obsidian hover:border-gold hover:bg-cream"
                      variant="ghost"
                    >
                      <Link href="/cart" onClick={toggleCart}>
                        View Bag
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="h-12 w-full rounded-full bg-gold font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
                    >
                      <Link href="/checkout" onClick={toggleCart}>
                        Checkout
                      </Link>
                    </Button>
                  </SheetFooter>
                ) : null}

                {items.length === 0 ? (
                  <div className="pointer-events-none absolute top-6 left-5 hidden text-gold/15 md:block">
                    <ShoppingBag className="size-20" />
                  </div>
                ) : null}
              </motion.aside>
            </SheetPrimitive.Content>
          </SheetPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </Sheet>
  );
}
