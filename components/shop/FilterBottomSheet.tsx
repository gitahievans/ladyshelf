"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/lib/types";
import FilterSidebar from "@/components/shop/FilterSidebar";

interface FilterBottomSheetProps {
  activeFilterCount: number;
  categories: Category[];
  colors: { hex: string; name: string }[];
  priceBounds: [number, number];
  className?: string;
}

export default function FilterBottomSheet({
  activeFilterCount,
  categories,
  colors,
  priceBounds,
  className,
}: FilterBottomSheetProps): ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className={cn("lg:hidden", className)}>
      <Button
        className="h-11 rounded-full border border-border-warm bg-ivory px-4 font-dm-sans text-label uppercase tracking-[0.16em] text-obsidian hover:bg-cream"
        onClick={(): void => setIsOpen(true)}
        type="button"
        variant="outline"
      >
        <SlidersHorizontal className="size-4" />
        Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
      </Button>

      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <SheetContent
          className="max-h-screen overflow-y-auto rounded-t-lg border-border-warm bg-ivory p-0 shadow-bottom-sheet"
          side="bottom"
          showCloseButton
        >
          <SheetHeader className="border-b border-border-warm px-5 py-4 text-left">
            <SheetTitle className="font-cormorant text-h3 text-obsidian">
              Filter the Collection
            </SheetTitle>
          </SheetHeader>
          <div className="p-5">
            <FilterSidebar
              categories={categories}
              className="block border-0 bg-transparent p-0 shadow-none"
              colors={colors}
              priceBounds={priceBounds}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
