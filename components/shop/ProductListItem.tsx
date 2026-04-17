"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import PriceDisplay from "@/components/shared/PriceDisplay";
import { Button } from "@/components/ui/button";
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

    const cartItem: CartItem = {
      id: `cart-${product.id}-${firstAvailableVariant.id}`,
      productId: product.id,
      variantId: firstAvailableVariant.id,
      quantity: 1,
      productName: product.name,
      productImage: product.images[0] ?? "",
      price: product.price,
      currency: product.currency,
      size: firstAvailableVariant.size,
      color: firstAvailableVariant.color,
      colorHex: firstAvailableVariant.colorHex,
    };

    addItem(cartItem);
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
        <Button
          className="h-11 rounded-full bg-gold px-5 font-dm-sans text-label uppercase tracking-[0.18em] text-obsidian hover:bg-sand"
          disabled={!firstAvailableVariant}
          onClick={handleAddToBag}
          type="button"
        >
          <ShoppingBag className="size-4" />
          Add to Bag
        </Button>
      </div>
    </article>
  );
}
