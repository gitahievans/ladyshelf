"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import PriceDisplay from "@/components/shared/PriceDisplay";
import { Button } from "@/components/ui/button";
import { fetchCatalogProductVariantAvailability } from "@/lib/api/catalog";
import { cn } from "@/lib/utils/cn";
import { getAvailableSizes } from "@/lib/utils/format";
import type { CartItem, Product, ProductVariant } from "@/lib/types";
import { useCartStore } from "@/stores/cartStore";

interface ProductListItemProps {
  product: Product;
  className?: string;
}

export default function ProductListItem({
  product,
  className,
}: ProductListItemProps): ReactElement {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false);
  const [stockFeedback, setStockFeedback] = useState<string | null>(null);

  const firstAvailableVariant: ProductVariant | undefined = product.variants.find(
    (variant) => variant.stock > 0,
  );

  function handleNavigate(): void {
    router.push(`/shop/${product.slug}`);
  }

  function handleAddToBag(
    event: React.MouseEvent<HTMLButtonElement>,
  ): void {
    event.stopPropagation();

    if (!firstAvailableVariant) {
      return;
    }

    setIsCheckingAvailability(true);
    setStockFeedback(null);

    void (async (): Promise<void> => {
      const liveAvailability = await fetchCatalogProductVariantAvailability(
        product.slug,
        firstAvailableVariant.id,
      );

      if (!liveAvailability) {
        setStockFeedback("We could not confirm live stock right now.");
        setIsCheckingAvailability(false);
        return;
      }

      if (liveAvailability.variant.stock <= 0) {
        setStockFeedback("This variant is now out of stock.");
        setIsCheckingAvailability(false);
        return;
      }

      const cartItem: CartItem = {
        id: `cart-${liveAvailability.product.id}-${liveAvailability.variant.id}`,
        productId: liveAvailability.product.id,
        variantId: liveAvailability.variant.id,
        quantity: 1,
        productName: liveAvailability.product.name,
        productImage:
          liveAvailability.variant.imageUrl || liveAvailability.product.images[0] || "",
        price: liveAvailability.product.price,
        currency: liveAvailability.product.currency,
        size: liveAvailability.variant.size,
        color: liveAvailability.variant.color,
        colorHex: liveAvailability.variant.colorHex,
        imageUrl: liveAvailability.variant.imageUrl,
      };

      addItem(cartItem);
      setIsCheckingAvailability(false);
    })();
  }

  return (
    <article
      className={cn(
        "grid cursor-pointer gap-5 rounded-lg border border-border-warm bg-cream p-4 shadow-card transition-shadow hover:shadow-card-hover lg:grid-cols-[150px_minmax(0,1fr)_auto]",
        className,
      )}
      onClick={handleNavigate}
    >
      <div className="relative aspect-product overflow-hidden rounded-md">
        <Image
          alt={product.name}
          className="object-cover"
          fill
          sizes="(max-width: 1024px) 100vw, 150px"
          src={product.images[0] ?? ""}
        />
      </div>

      <div className="space-y-3">
        <p className="font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
          {product.categorySlug.replaceAll("-", " ")}
        </p>
        <h3 className="font-dm-sans text-body font-medium text-text-primary">
          {product.name}
        </h3>
        <p className="line-clamp-2 font-dm-sans text-body-sm text-text-secondary">
          {product.description}
        </p>
        <p className="font-dm-sans text-caption text-text-muted">
          Available sizes: {getAvailableSizes(product.variants).join(" • ")}
        </p>
      </div>

      <div className="flex flex-col justify-between gap-4 lg:items-end">
        <PriceDisplay
          originalPrice={product.originalPrice}
          price={product.price}
          size="lg"
        />
        <div className="space-y-2 lg:text-right">
          <Button
            className="h-11 rounded-full bg-gold px-5 font-dm-sans text-label uppercase tracking-[0.18em] text-obsidian hover:bg-sand"
            disabled={!firstAvailableVariant || isCheckingAvailability}
            onClick={handleAddToBag}
            type="button"
          >
            <ShoppingBag className="size-4" />
            {isCheckingAvailability ? "Checking Availability" : "Add to Bag"}
          </Button>
          {stockFeedback ? (
            <p className="font-dm-sans text-caption text-error">
              {stockFeedback}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
