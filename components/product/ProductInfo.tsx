"use client";

import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Heart, ShoppingBag } from "lucide-react";

import VariantSelector from "@/components/product/VariantSelector";
import Badge from "@/components/shared/Badge";
import PriceDisplay from "@/components/shared/PriceDisplay";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { categories } from "@/lib/mock";
import { fadeUpVariant } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/cn";
import type { CartItem, Product, ProductVariant } from "@/lib/types";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

interface ProductInfoProps {
  product: Product;
}

function getStockMessage(selectedVariant: ProductVariant | null): string {
  if (!selectedVariant) {
    return "Choose your size to see availability.";
  }

  if (selectedVariant.stock === 0) {
    return "Sold Out";
  }

  if (selectedVariant.stock <= 3) {
    return `Only ${selectedVariant.stock} left`;
  }

  return "In Stock";
}

export default function ProductInfo({
  product,
}: ProductInfoProps): ReactElement {
  const reducedMotion = useReducedMotion();
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isCartOpen = useCartStore((state) => state.isOpen);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) =>
    state.productIds.includes(product.id),
  );
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  useEffect((): (() => void) | void => {
    if (!isAdded) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsAdded(false);
    }, 1600);

    return (): void => {
      window.clearTimeout(timeoutId);
    };
  }, [isAdded]);

  const categoryName = useMemo(
    () =>
      categories.find((category) => category.slug === product.categorySlug)?.name ??
      "Collection",
    [product.categorySlug],
  );
  const stockMessage = getStockMessage(selectedVariant);
  const isUnavailable = !selectedVariant || selectedVariant.stock === 0;

  function handleAddToBag(): void {
    if (!selectedVariant || selectedVariant.stock === 0) {
      return;
    }

    const cartItem: CartItem = {
      id: `cart-${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      quantity: 1,
      productName: product.name,
      productImage: product.images[0] ?? "",
      price: product.price,
      currency: product.currency,
      size: selectedVariant.size,
      color: selectedVariant.color,
      colorHex: selectedVariant.colorHex,
    };

    addItem(cartItem);

    if (!isCartOpen) {
      toggleCart();
    }

    setIsAdded(true);
  }

  return (
    <motion.div
      animate="visible"
      className="space-y-6 lg:sticky lg:top-[calc(var(--navbar-height)+2rem)]"
      initial="hidden"
      variants={fadeUpVariant}
    >
      <div className="space-y-4">
        <nav className="flex flex-wrap items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
          <Link className="transition-colors hover:text-obsidian" href="/">
            Home
          </Link>
          <span>/</span>
          <Link className="transition-colors hover:text-obsidian" href="/shop">
            Shop
          </Link>
          <span>/</span>
          <span>{categoryName}</span>
          <span>/</span>
          <span className="text-obsidian">{product.name}</span>
        </nav>

        {product.badge ? <Badge type={product.badge} /> : null}

        <div className="space-y-3">
          <h1 className="font-cormorant text-h1 text-obsidian lg:text-display-lg">
            {product.name}
          </h1>
          <PriceDisplay
            originalPrice={product.originalPrice}
            price={product.price}
            size="lg"
          />
        </div>

        <p className="font-dm-sans text-body text-text-secondary">
          {product.description}
        </p>
      </div>

      <VariantSelector
        onVariantChange={setSelectedVariant}
        variants={product.variants}
      />

      <div className="rounded-md border border-border-warm bg-cream p-4">
        <p
          className={cn(
            "font-dm-sans text-body-sm",
            selectedVariant?.stock === 0
              ? "text-error"
              : selectedVariant && selectedVariant.stock <= 3
                ? "text-gold"
                : selectedVariant
                  ? "text-success"
                  : "text-text-secondary",
          )}
        >
          {stockMessage}
        </p>
      </div>

      <motion.button
        className={cn(
          "flex min-h-11 w-full items-center justify-center gap-2 rounded-sm px-6 py-4 font-dm-sans text-label uppercase tracking-[0.18em]",
          isUnavailable
            ? "cursor-not-allowed bg-border-warm text-text-muted"
            : isAdded
              ? "bg-obsidian text-ivory"
              : "bg-gold text-obsidian hover:bg-bark hover:text-ivory",
        )}
        disabled={isUnavailable}
        onClick={handleAddToBag}
        type="button"
        whileTap={reducedMotion || isUnavailable ? undefined : { scale: 0.98 }}
      >
        {isAdded ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
        {isAdded ? "Added To Bag" : "Add to Bag"}
      </motion.button>

      <button
        className={cn(
          "flex min-h-11 w-full items-center justify-center gap-2 rounded-sm border px-6 py-4 font-dm-sans text-label uppercase tracking-[0.18em] transition-colors",
          isWishlisted
            ? "border-gold bg-gold text-obsidian"
            : "border-border-warm bg-ivory text-text-secondary hover:border-gold hover:text-obsidian",
        )}
        onClick={(): void => toggleWishlist(product.id)}
        type="button"
      >
        <Heart className={cn("size-4", isWishlisted ? "fill-current" : "")} />
        {isWishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
      </button>

      <Accordion className="w-full" collapsible type="single">
        <AccordionItem value="material">
          <AccordionTrigger>Material</AccordionTrigger>
          <AccordionContent>{product.material}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="care">
          <AccordionTrigger>Care</AccordionTrigger>
          <AccordionContent>{product.careInstructions}</AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="rounded-md border border-gold/30 bg-ivory p-4">
        <p className="font-dm-sans text-body-sm text-text-secondary">
          Free delivery on orders over KES 5,000. Delivery within Nairobi 2-3
          days.
        </p>
      </div>
    </motion.div>
  );
}
