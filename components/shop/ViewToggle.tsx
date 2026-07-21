"use client";

import type { ReactElement } from "react";
import { Grid2X2, Rows3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type ShopViewMode = "grid" | "list";

interface ViewToggleProps {
  className?: string;
  viewMode: ShopViewMode;
  onViewModeChange: (viewMode: ShopViewMode) => void;
}

export default function ViewToggle({
  className,
  viewMode,
  onViewModeChange,
}: ViewToggleProps): ReactElement {
  return (
    <div
      aria-label="Product layout"
      className={cn(
        "inline-flex h-12 items-center rounded-full border border-border-warm bg-ivory p-1",
        className,
      )}
      role="group"
    >
      <Button
        aria-label="Grid view"
        aria-pressed={viewMode === "grid"}
        className={cn(
          "h-10 min-w-10 rounded-full px-3 text-obsidian",
          viewMode === "grid"
            ? "bg-obsidian text-ivory hover:bg-obsidian"
            : "bg-transparent hover:bg-cream",
        )}
        onClick={(): void => onViewModeChange("grid")}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Grid2X2 className="size-4" />
      </Button>
      <Button
        aria-label="List view"
        aria-pressed={viewMode === "list"}
        className={cn(
          "h-10 min-w-10 rounded-full px-3 text-obsidian",
          viewMode === "list"
            ? "bg-obsidian text-ivory hover:bg-obsidian"
            : "bg-transparent hover:bg-cream",
        )}
        onClick={(): void => onViewModeChange("list")}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Rows3 className="size-4" />
      </Button>
    </div>
  );
}
