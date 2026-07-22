"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import Image from "next/image";
import { RefreshCw, RotateCcw, Send, Trash2 } from "lucide-react";

import AdminImageRegenerationDialog from "@/components/admin/AdminImageRegenerationDialog";
import AdminImagePublicationDialog from "@/components/admin/AdminImagePublicationDialog";
import { Button } from "@/components/ui/button";
import {
  approveImageCandidate,
  cancelImageGeneration,
  publishImageGeneration,
  rejectImageCandidate,
  restorePreviousProductGallery,
} from "@/lib/api/admin";
import type {
  ProductImageCandidate,
  ProductImageGeneration,
  ProductImagePublicationMode,
  ProductImageShotType,
} from "@/lib/types";

interface AdminImageGenerationReviewProps {
  canManage: boolean;
  generation: ProductImageGeneration;
  onChanged: () => Promise<void>;
  onGalleryChanged: () => Promise<void>;
}

const shotOrder: ProductImageShotType[] = ["hero", "alternate", "detail"];
const cancellableGenerationStatuses = new Set<ProductImageGeneration["status"]>([
  "queued",
  "ready_for_review",
  "needs_regeneration",
  "approved",
  "failed",
]);

function shotLabel(shotType: ProductImageShotType): string {
  return shotType.charAt(0).toUpperCase() + shotType.slice(1);
}

export default function AdminImageGenerationReview({
  canManage,
  generation,
  onChanged,
  onGalleryChanged,
}: AdminImageGenerationReviewProps): ReactElement {
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regenerationCandidate, setRegenerationCandidate] = useState<ProductImageCandidate | null>(null);
  const [isPublicationDialogOpen, setIsPublicationDialogOpen] = useState(false);
  const candidates = [...generation.candidates].sort(
    (left, right) => shotOrder.indexOf(left.shotType) - shotOrder.indexOf(right.shotType),
  );

  async function runCandidateAction(
    candidate: ProductImageCandidate,
    action: "approve" | "reject",
  ): Promise<void> {
    setPendingAction(`${candidate.id}-${action}`);
    setError(null);
    try {
      if (action === "approve") await approveImageCandidate(candidate.id);
      if (action === "reject") await rejectImageCandidate(candidate.id);
      await onChanged();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update this candidate.");
    } finally {
      setPendingAction(null);
    }
  }

  async function publish(publicationMode: ProductImagePublicationMode): Promise<void> {
    setPendingAction("publish");
    setError(null);
    try {
      await publishImageGeneration(generation.id, publicationMode);
      setIsPublicationDialogOpen(false);
      await Promise.all([onChanged(), onGalleryChanged()]);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to publish this image set.");
    } finally {
      setPendingAction(null);
    }
  }

  async function restore(): Promise<void> {
    if (!window.confirm("Restore the product gallery that was live before AI publication?")) return;
    setPendingAction("restore");
    setError(null);
    try {
      await restorePreviousProductGallery(generation.id);
      await Promise.all([onChanged(), onGalleryChanged()]);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to restore the previous gallery.");
    } finally {
      setPendingAction(null);
    }
  }

  async function cancel(): Promise<void> {
    if (!window.confirm(`Remove AI image-generation work for ${generation.productName}?`)) return;
    setPendingAction("cancel");
    setError(null);
    try {
      await cancelImageGeneration(generation.id);
      await onChanged();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to remove this image-generation work.");
    } finally {
      setPendingAction(null);
    }
  }

  const canCancelGeneration = cancellableGenerationStatuses.has(generation.status);

  return (
    <article className="space-y-4 rounded-sm border border-border-warm bg-cream p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="font-cormorant text-h4 text-obsidian">{generation.productName}</h4>
          <p className="font-dm-sans text-caption uppercase tracking-widest text-text-muted">
            {generation.status.replaceAll("_", " ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!canManage || !generation.canPublish || pendingAction !== null}
            onClick={() => {
              setError(null);
              setIsPublicationDialogOpen(true);
            }}
            type="button"
          >
            <Send className="mr-2 h-4 w-4" /> Publish approved set
          </Button>
          {generation.canRestore ? (
            <Button disabled={!canManage || pendingAction !== null} onClick={() => void restore()} type="button" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" /> Restore previous gallery
            </Button>
          ) : null}
          <Button
            disabled={!canManage || !canCancelGeneration || pendingAction !== null}
            onClick={() => void cancel()}
            type="button"
            variant="outline"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Remove from workspace
          </Button>
        </div>
      </div>

      {error || generation.errorMessage ? (
        <p className="rounded-sm border border-error bg-ivory p-3 font-dm-sans text-caption text-error">
          {error ?? generation.errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {candidates.map((candidate) => (
          <div className="overflow-hidden rounded-sm border border-border-warm bg-ivory" key={candidate.id}>
            <div className="relative aspect-[3/4] bg-cream">
              {candidate.publicUrl ? (
                <Image alt={`${generation.productName} ${shotLabel(candidate.shotType)} candidate`} className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" src={candidate.publicUrl} />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center font-dm-sans text-body-sm text-text-muted">
                  {candidate.status.replaceAll("_", " ")}
                </div>
              )}
            </div>
            <div className="space-y-3 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-dm-sans text-caption uppercase tracking-widest text-obsidian">{shotLabel(candidate.shotType)}</p>
                <span className="font-dm-sans text-caption text-text-muted">{candidate.status}</span>
              </div>
              {candidate.errorMessage ? <p className="font-dm-sans text-caption text-error">{candidate.errorMessage}</p> : null}
              {canManage ? (
                <div className="grid grid-cols-3 gap-2">
                  <Button disabled={candidate.status !== "ready" || pendingAction !== null} onClick={() => void runCandidateAction(candidate, "approve")} size="sm" type="button">Approve</Button>
                  <Button disabled={!candidate.publicUrl || pendingAction !== null} onClick={() => void runCandidateAction(candidate, "reject")} size="sm" type="button" variant="outline">Reject</Button>
                  <Button aria-label={`Regenerate ${shotLabel(candidate.shotType)}`} disabled={generation.status === "published" || generation.status === "cancelled" || candidate.status === "generating" || candidate.status === "queued" || pendingAction !== null} onClick={() => setRegenerationCandidate(candidate)} size="icon-sm" title="Regenerate" type="button" variant="outline">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {regenerationCandidate ? (
        <AdminImageRegenerationDialog
          candidate={regenerationCandidate}
          generation={generation}
          key={`${regenerationCandidate.id}-${regenerationCandidate.regenerationRevision}`}
          onOpenChange={(open) => {
            if (!open) setRegenerationCandidate(null);
          }}
          onRegenerated={onChanged}
        />
      ) : null}
      {isPublicationDialogOpen ? (
        <AdminImagePublicationDialog
          currentGalleryCount={generation.currentGalleryCount}
          error={error}
          isPublishing={pendingAction === "publish"}
          onOpenChange={setIsPublicationDialogOpen}
          onPublish={publish}
          productName={generation.productName}
        />
      ) : null}
    </article>
  );
}
