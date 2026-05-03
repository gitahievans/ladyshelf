"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/shared/EmptyState";
import { fetchCatalogProducts } from "@/lib/api/catalog";
import {
  buildCartStockAdjustmentMessage,
  getAvailableCartItemStock,
  reconcileCartItemsWithProducts,
} from "@/lib/utils/cartStock";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/stores/cartStore";

export default function CartPage(): ReactElement {
  const items = useCartStore((state) => state.items);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const subtotal = useCartStore((state) => state.subtotal);
  const totalItems = useCartStore((state) => state.totalItems);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockNotice, setStockNotice] = useState<string | null>(null);
  const [isCheckingStock, setIsCheckingStock] = useState<boolean>(false);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      setStockNotice(null);
      return;
    }

    let isMounted = true;

    setIsCheckingStock(true);

    void (async (): Promise<void> => {
      try {
        const liveProducts = await fetchCatalogProducts();

        if (!isMounted) {
          return;
        }

        if (liveProducts.length === 0) {
          setStockNotice("We could not verify live stock right now. Checkout will validate it again before payment.");
          return;
        }

        setProducts(liveProducts);

        const reconciliation = reconcileCartItemsWithProducts(items, liveProducts);
        const hasChanges =
          reconciliation.adjustments.length > 0 ||
          reconciliation.items.length !== items.length;

        if (hasChanges) {
          replaceItems(reconciliation.items);
        }

        if (reconciliation.adjustments.length > 0) {
          setStockNotice(
            reconciliation.adjustments
              .map((adjustment) => buildCartStockAdjustmentMessage(adjustment))
              .join(" "),
          );
          return;
        }

        setStockNotice(null);
      } finally {
        if (isMounted) {
          setIsCheckingStock(false);
        }
      }
    })();

    return (): void => {
      isMounted = false;
    };
  }, [items, replaceItems]);

  const itemStockLookup = useMemo(() => {
    return new Map(
      items.map((item) => [
        item.id,
        products.length > 0 ? getAvailableCartItemStock(item, products) : null,
      ]),
    );
  }, [items, products]);

  const isCheckoutDisabled =
    isCheckingStock ||
    items.length === 0 ||
    items.some((item) => itemStockLookup.get(item.id) === 0);

  return (
    <>
      <section className="bg-ivory px-6 py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-container space-y-8">
          <div className="space-y-3">
            <h1 className="font-cormorant text-h1 text-obsidian lg:text-display-lg">
              Your Bag ({totalItems} {totalItems === 1 ? "item" : "items"})
            </h1>
            <p className="max-w-2xl font-dm-sans text-body text-text-secondary">
              Take one more look before you move to checkout.
            </p>
          </div>

          {stockNotice ? (
            <div className="rounded-2xl border border-gold/30 bg-cream p-4">
              <p className="font-dm-sans text-body-sm text-text-secondary">
                {stockNotice}
              </p>
            </div>
          ) : null}

          {items.length === 0 ? (
            <EmptyState
              ctaHref="/shop"
              ctaLabel="Shop the Collection"
              description="Your next signature piece is waiting."
              title="Your cart is ready for something great."
            />
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)] lg:gap-10">
              <div className="space-y-4">
                {isCheckingStock ? (
                  <div className="flex items-center gap-3 rounded-lg border border-border-warm bg-cream p-4 font-dm-sans text-body-sm text-text-secondary shadow-card">
                    <Loader2 className="size-4 animate-spin text-gold" />
                    Checking live stock before checkout.
                  </div>
                ) : null}
                {items.map((item) => (
                  <CartItem
                    availableStock={itemStockLookup.get(item.id) ?? null}
                    item={item}
                    key={item.id}
                  />
                ))}
              </div>

              <CartSummary
                checkoutDisabled={isCheckoutDisabled}
                helperMessage={
                  isCheckingStock
                    ? "We are confirming live stock before you continue."
                    : stockNotice
                      ? "Your bag was updated to match current stock."
                      : null
                }
                itemCount={totalItems}
                subtotal={subtotal}
              />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
