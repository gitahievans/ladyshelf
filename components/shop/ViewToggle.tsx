"use client";

import type { ReactElement } from "react";
import { Grid2X2, Rows3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/uiStore";

interface ViewToggleProps {
  className?: string;
}

export default function ViewToggle({
  className,
}: ViewToggleProps): ReactElement {
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  return (
    <div
      className={cn(
        "inline-flex h-12 items-center rounded-full border border-border-warm bg-ivory p-1",
        className,
      )}
    >
      <Button
        aria-label="Grid view"
        className={cn(
          "h-10 min-w-10 rounded-full px-3 text-obsidian",
          viewMode === "grid"
            ? "bg-obsidian text-ivory hover:bg-obsidian"
            : "bg-transparent hover:bg-cream",
        )}
        onClick={(): void => setViewMode("grid")}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Grid2X2 className="size-4" />
      </Button>
      <Button
        aria-label="List view"
        className={cn(
          "h-10 min-w-10 rounded-full px-3 text-obsidian",
          viewMode === "list"
            ? "bg-obsidian text-ivory hover:bg-obsidian"
            : "bg-transparent hover:bg-cream",
        )}
        onClick={(): void => setViewMode("list")}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Rows3 className="size-4" />
      </Button>
    </div>
  );
}
