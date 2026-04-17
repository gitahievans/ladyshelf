"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import type { BadgeType, Category, Size } from "@/lib/types";
import { useUIStore } from "@/stores/uiStore";

interface FilterSidebarProps {
  categories: Category[];
  colors: { hex: string; name: string }[];
  className?: string;
}

const sizeOptions: Size[] = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const badgeOptions: BadgeType[] = ["new", "sale", "bestseller", "limited"];
const defaultPriceRange: [number, number] = [1800, 12500];

export default function FilterSidebar({
  categories,
  colors,
  className,
}: FilterSidebarProps): ReactElement {
  const [isColorsExpanded, setIsColorsExpanded] = useState<boolean>(false);
  const selectedCategory = useUIStore((state) => state.selectedCategory);
  const filters = useUIStore((state) => state.filters);
  const setCategory = useUIStore((state) => state.setCategory);
  const setFilters = useUIStore((state) => state.setFilters);
  const resetFilters = useUIStore((state) => state.resetFilters);

  const hasActiveFilters =
    selectedCategory !== "all" ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.badges.length > 0 ||
    filters.inStockOnly ||
    filters.priceRange[0] !== defaultPriceRange[0] ||
    filters.priceRange[1] !== defaultPriceRange[1];

  function toggleSize(size: Size): void {
    const nextSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((value) => value !== size)
      : [...filters.sizes, size];

    setFilters({ sizes: nextSizes });
  }

  function toggleColor(color: string): void {
    const nextColors = filters.colors.includes(color)
      ? filters.colors.filter((value) => value !== color)
      : [...filters.colors, color];

    setFilters({ colors: nextColors });
  }

  function toggleBadge(badge: BadgeType): void {
    const nextBadges = filters.badges.includes(badge)
      ? filters.badges.filter((value) => value !== badge)
      : [...filters.badges, badge];

    setFilters({ badges: nextBadges });
  }

  return (
    <aside
      className={cn(
        "hidden h-fit space-y-8 rounded-lg border border-border-warm bg-cream p-6 lg:block",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
            Refine
          </p>
          <h2 className="font-cormorant text-h3 text-obsidian">Filters</h2>
        </div>
        {hasActiveFilters ? (
          <button
            className="font-dm-sans text-caption uppercase tracking-[0.16em] text-text-secondary transition-colors hover:text-obsidian"
            onClick={resetFilters}
            type="button"
          >
            Reset All Filters
          </button>
        ) : null}
      </div>

      <section className="space-y-4">
        <h3 className="font-dm-sans text-label uppercase tracking-[0.16em] text-obsidian">
          Category
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={cn(
              "min-h-11 rounded-full border px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em]",
              selectedCategory === "all"
                ? "border-obsidian bg-obsidian text-ivory"
                : "border-border-warm bg-ivory text-text-secondary hover:border-gold hover:text-obsidian",
            )}
            onClick={(): void => setCategory("all")}
            type="button"
          >
            All
          </button>
          {categories.map((category) => (
            <button
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em]",
                selectedCategory === category.slug
                  ? "border-obsidian bg-obsidian text-ivory"
                  : "border-border-warm bg-ivory text-text-secondary hover:border-gold hover:text-obsidian",
              )}
              key={category.id}
              onClick={(): void => setCategory(category.slug)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-dm-sans text-label uppercase tracking-[0.16em] text-obsidian">
            Price Range
          </h3>
          <span className="font-dm-sans text-caption text-text-secondary">
            {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
          </span>
        </div>
        <Slider
          className="py-2"
          max={defaultPriceRange[1]}
          min={defaultPriceRange[0]}
          onValueChange={(value): void =>
            setFilters({ priceRange: [value[0] ?? defaultPriceRange[0], value[1] ?? defaultPriceRange[1]] })
          }
          step={100}
          value={filters.priceRange}
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-dm-sans text-label uppercase tracking-[0.16em] text-obsidian">
          Sizes
        </h3>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => (
            <button
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em]",
                filters.sizes.includes(size)
                  ? "border-gold bg-gold text-obsidian"
                  : "border-border-warm bg-ivory text-text-secondary hover:border-gold hover:text-obsidian",
              )}
              key={size}
              onClick={(): void => toggleSize(size)}
              type="button"
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <button
          aria-expanded={isColorsExpanded}
          className="flex w-full items-center justify-between gap-3 text-left"
          onClick={(): void => setIsColorsExpanded((current) => !current)}
          type="button"
        >
          <span className="font-dm-sans text-label uppercase tracking-[0.16em] text-obsidian">
            Colors
          </span>
          <span className="flex items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.14em] text-text-secondary">
            {filters.colors.length > 0 ? `${filters.colors.length} selected` : "Expand"}
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                isColorsExpanded ? "rotate-180" : "",
              )}
            />
          </span>
        </button>
        {isColorsExpanded ? (
          <div className="grid grid-cols-2 gap-3">
            {colors.map((color) => (
              <button
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-full border px-3 py-2 text-left",
                  filters.colors.includes(color.name)
                    ? "border-gold bg-ivory"
                    : "border-border-warm bg-ivory hover:border-gold",
                )}
                key={color.name}
                onClick={(): void => toggleColor(color.name)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border border-border-warm"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="font-dm-sans text-body-sm text-text-secondary">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <h3 className="font-dm-sans text-label uppercase tracking-[0.16em] text-obsidian">
          Badges
        </h3>
        <div className="flex flex-wrap gap-2">
          {badgeOptions.map((badge) => (
            <button
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em]",
                filters.badges.includes(badge)
                  ? "border-gold bg-gold text-obsidian"
                  : "border-border-warm bg-ivory text-text-secondary hover:border-gold hover:text-obsidian",
              )}
              key={badge}
              onClick={(): void => toggleBadge(badge)}
              type="button"
            >
              {badge}
            </button>
          ))}
        </div>
      </section>

      <label className="flex cursor-pointer items-center gap-3 rounded-full border border-border-warm bg-ivory px-4 py-3">
        <Checkbox
          checked={filters.inStockOnly}
          className="border-bark data-checked:border-gold data-checked:bg-gold data-checked:text-obsidian"
          onCheckedChange={(checked): void =>
            setFilters({ inStockOnly: checked === true })
          }
        />
        <span className="font-dm-sans text-body-sm text-text-secondary">
          In stock only
        </span>
      </label>
    </aside>
  );
}
