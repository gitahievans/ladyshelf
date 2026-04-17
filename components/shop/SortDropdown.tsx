"use client";

import type { ReactElement } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/uiStore";

interface SortOption {
  label: string;
  value: "newest" | "price-asc" | "price-desc" | "bestseller";
}

interface SortDropdownProps {
  className?: string;
}

const sortOptions: SortOption[] = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Bestsellers", value: "bestseller" },
];

export default function SortDropdown({
  className,
}: SortDropdownProps): ReactElement {
  const sortBy = useUIStore((state) => state.sortBy);
  const setSortBy = useUIStore((state) => state.setSortBy);

  return (
    <Select onValueChange={setSortBy} value={sortBy}>
      <SelectTrigger
        className={cn(
          "h-11 w-full rounded-full border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian lg:min-w-[220px]",
          className,
        )}
      >
        <SelectValue placeholder="Sort products" />
      </SelectTrigger>
      <SelectContent className="border border-border-warm bg-ivory text-obsidian">
        {sortOptions.map((option) => (
          <SelectItem
            className="font-dm-sans text-body-sm focus:bg-cream focus:text-obsidian"
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
