"use client";

import { type ReactElement, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Heart, Plus, ShoppingBag } from "lucide-react";

import Badge from "@/components/shared/Badge";
import PriceDisplay from "@/components/shared/PriceDisplay";
import { fetchCatalogProductVariantAvailability } from "@/lib/api/catalog";
import { fadeUpVariant, scaleInVariant } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/cn";
import { getAvailableSizes, isInStock } from "@/lib/utils/format";
import type { CartItem, Product } from "@/lib/types";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  className?: string;
}

export default function ProductCard({
  product,
  viewMode = "grid",
  className,
}: ProductCardProps): ReactElement {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) =>
    state.productIds.includes(product.id),
  );
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false);
  const [quickAddFeedback, setQuickAddFeedback] = useState<string | null>(null);
  const isGridView = viewMode === "grid";

  const inStock = isInStock(product.variants);
  const colorOptions = useMemo(
    () =>
      Array.from(
        new Set(
          product.variants
            .filter((variant) => variant.stock > 0)
            .map((variant) => variant.color),
        ),
      ),
    [product.variants],
  );
  const sizeOptions = useMemo(
    () =>
      selectedColor
        ? Array.from(
            new Set(
              product.variants
                .filter(
                  (variant) =>
                    variant.color === selectedColor && variant.stock > 0,
                )
                .map((variant) => variant.size),
            ),
          )
        : getAvailableSizes(product.variants),
    [product.variants, selectedColor],
  );
  const selectedVariant =
    product.variants.find(
      (variant) =>
        variant.color === selectedColor &&
        variant.size === selectedSize &&
        variant.stock > 0,
    ) ?? null;

  useEffect((): (() => void) | void => {
    if (!isAdded) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsAdded(false);
      setIsQuickAddOpen(false);
    }, 1600);

    return (): void => {
      window.clearTimeout(timeoutId);
    };
  }, [isAdded]);

  useEffect((): void => {
    setQuickAddFeedback(null);
  }, [selectedColor, selectedSize]);

  function handleCardClick(): void {
    router.push(`/shop/${product.slug}`);
  }

  function handleWishlistToggle(
    event: React.MouseEvent<HTMLButtonElement>,
  ): void {
    event.stopPropagation();
    void toggleWishlist(product.id);
  }

  function handleQuickAddToggle(
    event: React.MouseEvent<HTMLButtonElement>,
  ): void {
    event.stopPropagation();
    setIsQuickAddOpen((current) => !current);

    if (!selectedColor && colorOptions.length > 0) {
      setSelectedColor(colorOptions[0] ?? "");
    }

    if (!selectedSize && sizeOptions.length > 0) {
      setSelectedSize(String(sizeOptions[0] ?? ""));
    }
  }

  async function handleAddToBag(
    event: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> {
    event.stopPropagation();

    if (!selectedVariant) {
      return;
    }

    setIsCheckingAvailability(true);
    setQuickAddFeedback(null);

    const liveAvailability = await fetchCatalogProductVariantAvailability(
      product.slug,
      selectedVariant.id,
    );

    if (!liveAvailability) {
      setQuickAddFeedback("We could not confirm live stock right now.");
      setIsCheckingAvailability(false);
      return;
    }

    if (liveAvailability.variant.stock <= 0) {
      setQuickAddFeedback("This variant is now out of stock.");
      setIsCheckingAvailability(false);
      return;
    }

    const cartItem: CartItem = {
      id: `cart-${liveAvailability.product.id}-${liveAvailability.variant.id}`,
      productId: liveAvailability.product.id,
      variantId: liveAvailability.variant.id,
      quantity: 1,
      productName: liveAvailability.product.name,
      productImage: liveAvailability.product.images[0] ?? "",
      price: liveAvailability.product.price,
      currency: liveAvailability.product.currency,
      size: liveAvailability.variant.size,
      color: liveAvailability.variant.color,
      colorHex: liveAvailability.variant.colorHex,
    };

    addItem(cartItem);
    setIsAdded(true);
    setIsCheckingAvailability(false);
  }

  function selectColor(
    event: React.MouseEvent<HTMLButtonElement>,
    color: string,
  ): void {
    event.stopPropagation();
    setSelectedColor(color);
    const nextVariant = product.variants.find(
      (variant) => variant.color === color && variant.stock > 0,
    );
    setSelectedSize(nextVariant?.size ?? "");
  }

  function selectSize(
    event: React.MouseEvent<HTMLButtonElement>,
    size: string,
  ): void {
    event.stopPropagation();
    setSelectedSize(size);
  }

  return (
    <motion.article
      className={cn(
        "group relative overflow-hidden rounded-md border border-border-warm bg-cream shadow-card transition-shadow hover:shadow-card-hover",
        viewMode === "list"
          ? "flex flex-col sm:flex-row"
          : "flex h-full flex-col",
        className,
      )}
      onClick={handleCardClick}
      variants={fadeUpVariant}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          viewMode === "list" ? "w-full shrink-0 sm:w-[120px]" : "w-full",
        )}
      >
        <div
          className={cn(
            "relative",
            viewMode === "list" ? "aspect-product h-full" : "aspect-product",
          )}
        >
          <Image
            alt={product.name}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            fill
            sizes={
              viewMode === "list"
                ? "(max-width: 640px) 100vw, 120px"
                : "(max-width: 768px) 50vw, 25vw"
            }
            src={product.images[0] ?? ""}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/30 via-transparent to-transparent" />
          {product.badge ? (
            <Badge
              className={cn(
                "absolute z-10",
                isGridView ? "top-3 left-3" : "top-4 left-4",
              )}
              type={product.badge}
            />
          ) : null}
          <button
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Save to wishlist"
            }
            className={cn(
              "absolute z-10 inline-flex items-center justify-center rounded-full border backdrop-blur-sm transition-colors",
              isGridView ? "top-3 right-3 size-7" : "top-4 right-4 size-8",
              isWishlisted
                ? "border-gold bg-gold text-obsidian"
                : "border-ivory/40 bg-obsidian/40 text-ivory hover:border-gold hover:text-gold",
            )}
            onClick={handleWishlistToggle}
            type="button"
          >
            <Heart
              className={cn(
                isGridView ? "size-3.5" : "size-4",
                isWishlisted ? "fill-current" : "",
              )}
            />
          </button>
        </div>

        {inStock ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0",
              isGridView ? "px-3 pb-3" : "p-4",
            )}
          >
            <button
              className={cn(
                "pointer-events-auto flex items-center justify-center gap-2 bg-ivory/92 font-dm-sans uppercase text-obsidian transition hover:bg-gold hover:text-obsidian",
                isGridView
                  ? "mx-auto h-10 w-full max-w-full rounded-2xl px-3 text-caption tracking-[0.14em]"
                  : "h-11 w-full rounded-sm text-label tracking-[0.18em]",
              )}
              onClick={handleQuickAddToggle}
              type="button"
            >
              <ShoppingBag className={cn(isGridView ? "size-3.5" : "size-4")} />
              Quick Add
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <p className="font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
            {product.categorySlug.replaceAll("-", " ")}
          </p>
          <h3
            className={cn(
              "font-dm-sans font-medium text-text-primary",
              viewMode === "list" ? "text-body" : "line-clamp-2 text-body-sm",
            )}
          >
            {product.name}
          </h3>
          {viewMode === "list" ? (
            <>
              <p className="line-clamp-2 font-dm-sans text-body-sm text-text-secondary">
                {product.description}
              </p>
              <p className="font-dm-sans text-caption text-text-muted">
                Sizes: {getAvailableSizes(product.variants).join(" • ")}
              </p>
            </>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <PriceDisplay
            originalPrice={product.originalPrice}
            price={product.price}
            size={viewMode === "list" ? "lg" : "md"}
          />
          {!inStock ? (
            <span className="font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
              Sold out
            </span>
          ) : null}
        </div>

        <AnimatePresence>
          {isQuickAddOpen && inStock ? (
            <motion.div
              animate="visible"
              className={cn(
                "border-t border-border-warm",
                isGridView ? "space-y-3 pt-3" : "space-y-4 pt-4",
              )}
              exit="hidden"
              initial="hidden"
              onClick={(event): void => event.stopPropagation()}
              variants={
                reducedMotion
                  ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
                  : scaleInVariant
              }
            >
              <div className={cn(isGridView ? "space-y-1.5" : "space-y-2")}>
                <p
                  className={cn(
                    "font-dm-sans uppercase text-text-muted",
                    isGridView
                      ? "text-caption tracking-[0.12em]"
                      : "text-caption tracking-[0.16em]",
                  )}
                >
                  Choose Color
                </p>
                <div
                  className={cn(
                    "flex flex-wrap",
                    isGridView ? "gap-1.5" : "gap-2",
                  )}
                >
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "rounded-full border font-dm-sans uppercase",
                        isGridView
                          ? "w-full px-3 py-2 text-caption leading-tight tracking-[0.08em]"
                          : "px-3 py-2 text-caption tracking-[0.12em]",
                        selectedColor === color
                          ? "border-gold bg-gold text-obsidian"
                          : "border-border-warm text-text-secondary hover:border-gold",
                      )}
                      onClick={(event): void => selectColor(event, color)}
                      type="button"
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className={cn(isGridView ? "space-y-1.5" : "space-y-2")}>
                <p
                  className={cn(
                    "font-dm-sans uppercase text-text-muted",
                    isGridView
                      ? "text-caption tracking-[0.12em]"
                      : "text-caption tracking-[0.16em]",
                  )}
                >
                  Choose Size
                </p>
                <div
                  className={cn(
                    "flex flex-wrap",
                    isGridView ? "gap-1.5" : "gap-2",
                  )}
                >
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      className={cn(
                        "rounded-full border font-dm-sans uppercase",
                        isGridView
                          ? "min-h-0 min-w-0 px-3 py-2 text-caption tracking-[0.08em]"
                          : "min-h-11 px-4 py-2 text-caption tracking-[0.12em]",
                        selectedSize === size
                          ? "border-obsidian bg-obsidian text-ivory"
                          : "border-border-warm text-text-secondary hover:border-gold",
                      )}
                      onClick={(event): void => selectSize(event, String(size))}
                      type="button"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className={cn(
                  "flex w-full items-center justify-center gap-2 font-dm-sans uppercase",
                  isGridView
                    ? "min-h-10 rounded-sm px-3 py-2 text-caption tracking-[0.12em]"
                    : "min-h-11 rounded-sm px-4 py-3 text-label tracking-[0.18em]",
                  isAdded
                    ? "bg-obsidian text-ivory"
                    : "bg-gold text-obsidian hover:bg-bark hover:text-ivory",
                )}
                disabled={!selectedVariant || isCheckingAvailability}
                onClick={(event): void => {
                  void handleAddToBag(event);
                }}
                type="button"
              >
                {isAdded ? (
                  <Check className={cn(isGridView ? "size-3.5" : "size-4")} />
                ) : (
                  <Plus className={cn(isGridView ? "size-3.5" : "size-4")} />
                )}
                {isCheckingAvailability
                  ? "Checking Availability"
                  : isAdded
                    ? "Added To Bag"
                    : "Add To Bag"}
              </button>

              {quickAddFeedback ? (
                <p className="font-dm-sans text-caption text-error">
                  {quickAddFeedback}
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
