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
}: AdminImageGenerationPanelProps): ReactElement {
  const [batches, setBatches] = useState<ImageGenerationBatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadBatches = useCallback(async (): Promise<void> => {
    try {
      const nextBatches = await fetchImageGenerationBatches();
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
  }, [loadBatches]);

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

  return (
    <section className="space-y-4 rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-dm-sans text-caption uppercase tracking-widest text-gold">AI product imagery</p>
          <h3 className="mt-1 font-cormorant text-h3 text-obsidian">Generate review candidates</h3>
          <p className="mt-2 max-w-3xl font-dm-sans text-body-sm text-text-secondary">
            Select up to five products below. Three candidates are generated asynchronously per product, and nothing reaches the storefront until every shot is approved and the complete set is published.
          </p>
        </div>
        {canManage ? (
          <div className="flex items-center gap-3">
            <span className="font-dm-sans text-caption uppercase tracking-widest text-text-muted">{selectedProductIds.length}/5 selected</span>
            <Button disabled={selectedProductIds.length === 0 || selectedProductIds.length > 5 || isCreating} onClick={() => void createBatch()} type="button">
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Images className="mr-2 h-4 w-4" />}
              Generate images for selected
            </Button>
          </div>
        ) : null}
      </div>

      {error ? <p className="rounded-sm border border-error bg-cream p-3 font-dm-sans text-caption text-error">{error}</p> : null}
      {isLoading ? <p className="font-dm-sans text-body-sm text-text-muted">Loading generation queue…</p> : null}
      {!isLoading && batches.length === 0 ? <p className="rounded-sm border border-dashed border-border-warm bg-cream p-4 font-dm-sans text-body-sm text-text-muted">No image-generation batches yet.</p> : null}
      <div className="space-y-4">
        {batches.flatMap((batch) => batch.generations).map((generation) => (
          <AdminImageGenerationReview canManage={canManage} generation={generation} key={generation.id} onChanged={loadBatches} onGalleryChanged={onGalleryChanged} />
        ))}
      </div>
    </section>
  );
}
