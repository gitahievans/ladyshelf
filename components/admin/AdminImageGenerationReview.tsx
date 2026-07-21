"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import Image from "next/image";
import { Loader2, RefreshCw, RotateCcw, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  approveImageCandidate,
  publishImageGeneration,
  regenerateImageCandidate,
  rejectImageCandidate,
  restorePreviousProductGallery,
} from "@/lib/api/admin";
import type {
  ProductImageCandidate,
  ProductImageGeneration,
  ProductImageShotType,
} from "@/lib/types";

interface AdminImageGenerationReviewProps {
  canManage: boolean;
  generation: ProductImageGeneration;
  onChanged: () => Promise<void>;
  onGalleryChanged: () => Promise<void>;
}

const shotOrder: ProductImageShotType[] = ["hero", "alternate", "detail"];

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
  const candidates = [...generation.candidates].sort(
    (left, right) => shotOrder.indexOf(left.shotType) - shotOrder.indexOf(right.shotType),
  );

  async function runCandidateAction(
    candidate: ProductImageCandidate,
    action: "approve" | "reject" | "regenerate",
  ): Promise<void> {
    setPendingAction(`${candidate.id}-${action}`);
    setError(null);
    try {
      if (action === "approve") await approveImageCandidate(candidate.id);
      if (action === "reject") await rejectImageCandidate(candidate.id);
      if (action === "regenerate") await regenerateImageCandidate(candidate.id);
      await onChanged();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update this candidate.");
    } finally {
      setPendingAction(null);
    }
  }

  async function publish(): Promise<void> {
    if (!window.confirm("Replace the live gallery with this complete approved image set?")) return;
    setPendingAction("publish");
    setError(null);
    try {
      await publishImageGeneration(generation.id);
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
          <Button disabled={!canManage || !generation.canPublish || pendingAction !== null} onClick={() => void publish()} type="button">
            <Send className="mr-2 h-4 w-4" /> Publish approved set
          </Button>
          {generation.canRestore ? (
            <Button disabled={!canManage || pendingAction !== null} onClick={() => void restore()} type="button" variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" /> Restore previous gallery
            </Button>
          ) : null}
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
                  <Button disabled={candidate.status === "generating" || candidate.status === "queued" || pendingAction !== null} onClick={() => void runCandidateAction(candidate, "regenerate")} size="icon-sm" title="Regenerate" type="button" variant="outline">
                    {pendingAction === `${candidate.id}-regenerate` ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
