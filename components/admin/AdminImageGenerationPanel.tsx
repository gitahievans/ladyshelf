"use client";

import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { Images, Loader2 } from "lucide-react";

import AdminImageGenerationReview from "@/components/admin/AdminImageGenerationReview";
import { Button } from "@/components/ui/button";
import { createImageGenerationBatch, fetchImageGenerationBatches } from "@/lib/api/admin";
import type { ImageGenerationBatch } from "@/lib/types";

interface AdminImageGenerationPanelProps {
  canManage: boolean;
  onActiveProductIdsChange: (productIds: string[]) => void;
  onGalleryChanged: () => Promise<void>;
  onSelectionCleared: () => void;
  selectedProductIds: string[];
  refreshRevision: number;
}

const activeGenerationStatuses = new Set([
  "queued",
  "generating",
  "ready_for_review",
  "needs_regeneration",
  "approved",
]);

export default function AdminImageGenerationPanel({
  canManage,
  onActiveProductIdsChange,
  onGalleryChanged,
  onSelectionCleared,
  selectedProductIds,
  refreshRevision,
}: AdminImageGenerationPanelProps): ReactElement {
  const [batches, setBatches] = useState<ImageGenerationBatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadBatches = useCallback(async (): Promise<void> => {
    try {
      const nextBatches = await fetchImageGenerationBatches("active");
      setBatches(nextBatches);
      const activeIds = nextBatches.flatMap((batch) =>
        batch.generations
          .filter((generation) => activeGenerationStatuses.has(generation.status))
          .map((generation) => generation.productId),
      );
      onActiveProductIdsChange([...new Set(activeIds)]);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load image-generation work.");
    } finally {
      setIsLoading(false);
    }
  }, [onActiveProductIdsChange]);

  useEffect((): void => {
    void loadBatches();
  }, [loadBatches, refreshRevision]);

  useEffect((): (() => void) | undefined => {
    const hasProcessingWork = batches.some((batch) =>
      batch.status === "queued" || batch.status === "processing",
    );
    if (!hasProcessingWork) return undefined;
    const intervalId = window.setInterval(() => void loadBatches(), 6000);
    return (): void => window.clearInterval(intervalId);
  }, [batches, loadBatches]);

  async function createBatch(): Promise<void> {
    if (selectedProductIds.length === 0 || selectedProductIds.length > 5) return;
    setIsCreating(true);
    setError(null);
    try {
      await createImageGenerationBatch(selectedProductIds);
      onSelectionCleared();
      await loadBatches();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to queue product images.");
    } finally {
      setIsCreating(false);
    }
  }

  const visibleGenerations = batches
    .flatMap((batch) => batch.generations)
    .filter((generation) => generation.status !== "published" && generation.status !== "cancelled");
  const isExpanded = selectedProductIds.length > 0 || visibleGenerations.length > 0 || error !== null;

  return (
    <section className="space-y-4 rounded-lg border border-border-warm bg-ivory p-4 shadow-card md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-dm-sans text-caption uppercase tracking-widest text-gold">AI product imagery</p>
          <h3 className="mt-1 font-cormorant text-h4 text-obsidian">
            {isExpanded ? "Generate review candidates" : "AI image workspace"}
          </h3>
          {isExpanded ? (
            <p className="mt-2 max-w-3xl font-dm-sans text-body-sm text-text-secondary">
              Select up to five products below. Every product receives Hero, Alternate, and Detail candidates, and nothing reaches the storefront without review and explicit publication.
            </p>
          ) : (
            <p className="mt-1 font-dm-sans text-caption text-text-muted">
              Select eligible products below or use Generate with AI beside their gallery controls.
            </p>
          )}
        </div>
        {canManage && isExpanded ? (
          <div className="flex items-center gap-3">
            <span className="font-dm-sans text-caption uppercase tracking-widest text-text-muted">{selectedProductIds.length}/5 selected</span>
            <Button disabled={selectedProductIds.length === 0 || selectedProductIds.length > 5 || isCreating} onClick={() => void createBatch()} type="button">
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Images className="mr-2 h-4 w-4" />}
              Generate images for selected
            </Button>
          </div>
        ) : null}
      </div>

      {isExpanded && error ? <p className="rounded-sm border border-error bg-cream p-3 font-dm-sans text-caption text-error">{error}</p> : null}
      {isExpanded && isLoading ? <p className="font-dm-sans text-body-sm text-text-muted">Loading generation queue…</p> : null}
      {isExpanded && !isLoading && visibleGenerations.length === 0 ? <p className="rounded-sm border border-dashed border-border-warm bg-cream p-4 font-dm-sans text-body-sm text-text-muted">No active generation work. Queue the selected products when ready.</p> : null}
      <div className={isExpanded ? "space-y-4" : "hidden"}>
        {visibleGenerations.map((generation) => (
          <AdminImageGenerationReview canManage={canManage} generation={generation} key={generation.id} onChanged={loadBatches} onGalleryChanged={onGalleryChanged} />
        ))}
      </div>
    </section>
  );
}
