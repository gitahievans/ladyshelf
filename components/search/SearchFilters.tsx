import type { ReactElement } from "react";

import { categories, getAllColors } from "@/lib/mock";
import { cn } from "@/lib/utils/cn";
import type { BadgeType, SearchFiltersState, Size, UIStore } from "@/lib/types";

interface SearchFiltersProps {
  filters: SearchFiltersState;
  sortBy: UIStore["sortBy"];
  onFiltersChange: (filters: SearchFiltersState) => void;
  onSortChange: (sortBy: UIStore["sortBy"]) => void;
  onReset: () => void;
}

const sizeOptions: Size[] = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const badgeOptions: BadgeType[] = ["new", "sale", "bestseller", "limited"];
const sortOptions: Array<{ label: string; value: UIStore["sortBy"] }> = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Bestsellers", value: "bestseller" },
];
const colors = getAllColors();

function toggleStringValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

export default function SearchFilters({
  filters,
  sortBy,
  onFiltersChange,
  onSortChange,
  onReset,
}: SearchFiltersProps): ReactElement {
  return (
    <aside className="space-y-6 rounded-lg border border-border-warm bg-cream p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-gold">
            Refine
          </p>
          <h2 className="font-cormorant text-h3 text-obsidian">Search Filters</h2>
        </div>
        <button
          className="font-dm-sans text-caption uppercase tracking-[0.16em] text-text-secondary transition-colors hover:text-obsidian"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>

      <section className="space-y-3">
        <h3 className="font-dm-sans text-label uppercase tracking-[0.16em] text-obsidian">
          Sort By
        </h3>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em]",
                sortBy === option.value
                  ? "border-obsidian bg-obsidian text-ivory"
                  : "border-border-warm bg-ivory text-text-secondary hover:border-gold hover:text-obsidian",
              )}
              key={option.value}
              onClick={(): void => onSortChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-dm-sans text-label uppercase tracking-[0.16em] text-obsidian">
          Collection
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={cn(
              "min-h-11 rounded-full border px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em]",
              filters.category === "all"
                ? "border-obsidian bg-obsidian text-ivory"
                : "border-border-warm bg-ivory text-text-secondary hover:border-gold hover:text-obsidian",
            )}
            onClick={(): void => onFiltersChange({ ...filters, category: "all" })}
            type="button"
          >
            All
          </button>
          {categories.map((category) => (
            <button
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em]",
                filters.category === category.slug
                  ? "border-obsidian bg-obsidian text-ivory"
                  : "border-border-warm bg-ivory text-text-secondary hover:border-gold hover:text-obsidian",
              )}
              key={category.id}
              onClick={(): void =>
                onFiltersChange({ ...filters, category: category.slug })
              }
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
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
              onClick={(): void =>
                onFiltersChange({
                  ...filters,
                  sizes: toggleStringValue(filters.sizes, size) as Size[],
                })
              }
              type="button"
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-dm-sans text-label uppercase tracking-[0.16em] text-obsidian">
          Colours
        </h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em]",
                filters.colors.includes(color.name)
                  ? "border-gold bg-gold text-obsidian"
                  : "border-border-warm bg-ivory text-text-secondary hover:border-gold hover:text-obsidian",
              )}
              key={color.name}
              onClick={(): void =>
                onFiltersChange({
                  ...filters,
                  colors: toggleStringValue(filters.colors, color.name),
                })
              }
              type="button"
            >
              {color.name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-dm-sans text-label uppercase tracking-[0.16em] text-obsidian">
          Badge
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
              onClick={(): void =>
                onFiltersChange({
                  ...filters,
                  badges: toggleStringValue(filters.badges, badge) as BadgeType[],
                })
              }
              type="button"
            >
              {badge}
            </button>
          ))}
        </div>
      </section>

      <button
        className={cn(
          "flex min-h-11 w-full items-center justify-center rounded-full border px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em]",
          filters.inStockOnly
            ? "border-obsidian bg-obsidian text-ivory"
            : "border-border-warm bg-ivory text-text-secondary hover:border-gold hover:text-obsidian",
        )}
        onClick={(): void =>
          onFiltersChange({ ...filters, inStockOnly: !filters.inStockOnly })
        }
        type="button"
      >
        In Stock Only
      </button>
    </aside>
  );
}
