"use client";

import type { ReactElement } from "react";
import { Grid2X2, Rows3 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type CollectionViewMode = "grid" | "list";

interface CollectionViewToggleProps {
  viewMode: CollectionViewMode;
  onViewModeChange: (viewMode: CollectionViewMode) => void;
}

export default function CollectionViewToggle({
  viewMode,
  onViewModeChange,
}: CollectionViewToggleProps): ReactElement {
  return (
    <div
      aria-label="Collection layout"
      className="inline-flex items-center rounded-full border border-border-warm bg-ivory p-1"
      role="group"
    >
      <button
        aria-label="Show collections in a grid"
        aria-pressed={viewMode === "grid"}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-full",
          viewMode === "grid"
            ? "bg-obsidian text-ivory"
            : "text-text-secondary hover:bg-cream hover:text-obsidian",
        )}
        onClick={(): void => onViewModeChange("grid")}
        type="button"
      >
        <Grid2X2 aria-hidden="true" className="size-4" />
      </button>
      <button
        aria-label="Show collections in a list"
        aria-pressed={viewMode === "list"}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-full",
          viewMode === "list"
            ? "bg-obsidian text-ivory"
            : "text-text-secondary hover:bg-cream hover:text-obsidian",
        )}
        onClick={(): void => onViewModeChange("list")}
        type="button"
      >
        <Rows3 aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
