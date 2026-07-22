"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import AdminImageRegenerationShotFields from "@/components/admin/AdminImageRegenerationShotFields";
import type { RegenerationShotDraft } from "@/components/admin/AdminImageRegenerationShotFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { regenerateImageCandidate } from "@/lib/api/admin";
import type {
  ProductImageCandidate,
  ProductImageDetailRegenerationSettings,
  ProductImageGeneration,
  ProductImageModelRegenerationSettings,
  ProductImageRegenerationRequest,
  ProductImageShotType,
  ProductImageSkinTone,
} from "@/lib/types";

interface AdminImageRegenerationDialogProps {
  candidate: ProductImageCandidate;
  generation: ProductImageGeneration;
  onOpenChange: (open: boolean) => void;
  onRegenerated: () => Promise<void>;
}

type ShotDrafts = Partial<Record<ProductImageShotType, RegenerationShotDraft>>;
const shotOrder: ProductImageShotType[] = ["hero", "alternate", "detail"];
const selectableSkinTones = new Set<ProductImageSkinTone>([
  "automatic",
  "light_brown",
  "medium_brown",
  "deep_brown",
]);

function isSelectableSkinTone(value: string): value is ProductImageSkinTone {
  return selectableSkinTones.has(value as ProductImageSkinTone);
}

function initialDraft(candidate: ProductImageCandidate): RegenerationShotDraft {
  const requested = candidate.manualOverrides.requested ?? {};
  const resolved = candidate.manualOverrides.resolved ?? {};
  if (candidate.shotType === "detail") {
    return {
      color: requested.color ?? resolved.color ?? null,
      detailFocus: requested.detailFocus ?? resolved.detailFocus ?? "automatic",
      instruction: requested.instruction ?? "",
    };
  }
  const resolvedSkinTone = resolved.skinTone ?? "automatic";
  return {
    color: requested.color ?? resolved.color ?? null,
    bodyProfile: requested.bodyProfile ?? resolved.bodyProfile ?? "automatic",
    skinTone: isSelectableSkinTone(resolvedSkinTone) ? resolvedSkinTone : "automatic",
    composition: requested.composition ?? resolved.composition ?? "automatic",
    instruction: requested.instruction ?? "",
  };
}

function isModelDraft(draft: RegenerationShotDraft): draft is ProductImageModelRegenerationSettings {
  return "bodyProfile" in draft;
}

export default function AdminImageRegenerationDialog({
  candidate,
  generation,
  onOpenChange,
  onRegenerated,
}: AdminImageRegenerationDialogProps): ReactElement {
  const candidates = [...generation.candidates].sort(
    (left, right) => shotOrder.indexOf(left.shotType) - shotOrder.indexOf(right.shotType),
  );
  const editedCandidates = candidate.shotType === "hero"
    ? candidates
    : candidates.filter((item) => item.id === candidate.id);
  const [drafts, setDrafts] = useState<ShotDrafts>(() =>
    Object.fromEntries(editedCandidates.map((item) => [item.shotType, initialDraft(item)])),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateDraft(shotType: ProductImageShotType, draft: RegenerationShotDraft): void {
    setDrafts((current) => ({ ...current, [shotType]: draft }));
  }

  function disabledColors(shotType: ProductImageShotType): string[] {
    if (generation.catalogColors.length < 3) return [];
    return Object.entries(drafts)
      .flatMap(([otherShot, draft]) =>
        otherShot !== shotType && draft?.color ? [draft.color] : [],
      );
  }

  function buildRequest(): ProductImageRegenerationRequest | null {
    if (candidate.shotType === "hero") {
      const hero = drafts.hero;
      const alternate = drafts.alternate;
      const detail = drafts.detail;
      if (!hero || !alternate || !detail || !isModelDraft(hero) || !isModelDraft(alternate) || isModelDraft(detail)) return null;
      return { scope: "set", shots: { hero, alternate, detail } };
    }
    const draft = drafts[candidate.shotType];
    if (!draft) return null;
    if (candidate.shotType === "alternate" && isModelDraft(draft)) {
      return { scope: "shot", shots: { alternate: draft } };
    }
    if (candidate.shotType === "detail" && !isModelDraft(draft)) {
      return { scope: "shot", shots: { detail: draft as ProductImageDetailRegenerationSettings } };
    }
    return null;
  }

  async function submit(): Promise<void> {
    const request = buildRequest();
    if (!request) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await regenerateImageCandidate(candidate.id, request);
      await onRegenerated();
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to regenerate these images.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="max-h-screen min-w-0 w-11/12 overflow-x-hidden overflow-y-auto sm:w-full sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-cormorant text-h3 text-obsidian">
            {candidate.shotType === "hero" ? "Regenerate complete image set" : `Regenerate ${candidate.shotType}`}
          </DialogTitle>
          <DialogDescription className="font-dm-sans text-body-sm text-text-secondary">
            {candidate.shotType === "hero"
              ? "Hero is the reference for Alternate and Detail, so all three drafts will be replaced."
              : "Only this draft image will be replaced. The other candidates remain unchanged."}
          </DialogDescription>
        </DialogHeader>

        {generation.catalogColors.length < 3 ? (
          <p className="rounded-sm border border-border-warm bg-cream p-3 font-dm-sans text-caption text-text-secondary">
            This product has {generation.catalogColors.length || "no"} frozen catalog color{generation.catalogColors.length === 1 ? "" : "s"}; a repeated color may be unavoidable.
          </p>
        ) : null}
        {error ? (
          <p aria-live="polite" className="rounded-sm border border-error bg-cream p-3 font-dm-sans text-caption text-error">
            {error}
          </p>
        ) : null}

        <div className="space-y-4">
          {editedCandidates.map((item) => {
            const draft = drafts[item.shotType];
            if (!draft) return null;
            return (
              <AdminImageRegenerationShotFields
                catalogColors={generation.catalogColors}
                disabledColors={disabledColors(item.shotType)}
                draft={draft}
                key={item.id}
                onChange={(nextDraft) => updateDraft(item.shotType, nextDraft)}
                shotType={item.shotType}
              />
            );
          })}
        </div>

        <p className="font-dm-sans text-caption text-text-muted">
          Instructions cannot override catalog colors, adult Black-woman representation, product fidelity, or safety rules. Regeneration uses a new revision and seed; nothing is published automatically.
        </p>
        <DialogFooter>
          <Button disabled={isSubmitting} onClick={() => onOpenChange(false)} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={() => void submit()} type="button">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {candidate.shotType === "hero" ? "Regenerate all three" : "Regenerate image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
