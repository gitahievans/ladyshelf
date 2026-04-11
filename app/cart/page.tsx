"use client";

import type { ReactElement } from "react";

import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/shared/EmptyState";
import { useCartStore } from "@/stores/cartStore";

export default function CartPage(): ReactElement {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const totalItems = useCartStore((state) => state.totalItems);

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
                {items.map((item) => (
                  <CartItem item={item} key={item.id} />
                ))}
              </div>

              <CartSummary itemCount={totalItems} subtotal={subtotal} />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
