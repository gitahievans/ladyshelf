"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
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
        className="h-12 w-full whitespace-nowrap rounded-full border border-border-warm bg-ivory px-5 font-dm-sans text-label uppercase tracking-[0.16em] text-obsidian hover:bg-cream"
        onClick={(): void => setIsOpen(true)}
        type="button"
        variant="outline"
      >
        <SlidersHorizontal className="size-4" />
        Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
      </Button>

      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <SheetContent
          className="h-[92vh] max-h-[92vh] gap-0 overflow-hidden rounded-t-lg border-border-warm bg-ivory p-0 shadow-bottom-sheet"
          side="bottom"
          showCloseButton={false}
        >
          <SheetHeader className="sticky top-0 z-20 flex-row items-center justify-between border-b border-border-warm bg-ivory px-5 py-4 text-left">
            <SheetTitle className="font-cormorant text-h3 text-obsidian">
              Filter the Collection
            </SheetTitle>
            <SheetClose asChild>
              <Button
                aria-label="Close filters"
                className="size-11 rounded-full border border-border-warm bg-cream text-obsidian hover:border-gold hover:bg-ivory"
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="size-5" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-28">
            <FilterSidebar
              categories={categories}
              className="block border-0 bg-transparent p-0 shadow-none"
              colors={colors}
              priceBounds={priceBounds}
            />
          </div>
          <div className="sticky bottom-0 z-20 border-t border-border-warm bg-ivory px-5 py-4">
            <SheetClose asChild>
              <Button
                className="min-h-12 w-full rounded-full bg-gold px-6 py-3 font-dm-sans text-body-sm font-medium leading-none text-obsidian hover:bg-sand"
                type="button"
              >
                Show Results
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
