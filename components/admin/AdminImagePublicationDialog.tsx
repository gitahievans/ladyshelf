"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import AdminImagePublicationChoice from "@/components/admin/AdminImagePublicationChoice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductImagePublicationMode } from "@/lib/types";

interface AdminImagePublicationDialogProps {
  currentGalleryCount: number;
  error: string | null;
  isPublishing: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (mode: ProductImagePublicationMode) => Promise<void>;
  productName: string;
}

export default function AdminImagePublicationDialog({
  currentGalleryCount,
  error,
  isPublishing,
  onOpenChange,
  onPublish,
  productName,
}: AdminImagePublicationDialogProps): ReactElement {
  const [mode, setMode] = useState<ProductImagePublicationMode | null>(null);
  const appendCount = currentGalleryCount + 3;

  return (
    <Dialog open onOpenChange={(open) => !isPublishing && onOpenChange(open)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border-warm bg-ivory sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-cormorant text-h3 text-obsidian">
            Publish AI images
          </DialogTitle>
          <DialogDescription className="font-dm-sans text-body-sm text-text-secondary">
            Choose how the approved Hero, Alternate, and Detail images should update {productName}.
            Nothing is preselected.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="space-y-3">
          <legend className="sr-only">Publication mode</legend>
          <AdminImagePublicationChoice
            checked={mode === "append"}
            description={`Add 3 AI images after the existing ${currentGalleryCount} ${currentGalleryCount === 1 ? "image" : "images"}; resulting gallery: ${appendCount} images.`}
            label="Add to gallery"
            mode="append"
            onChange={setMode}
          />
          <AdminImagePublicationChoice
            checked={mode === "replace"}
            description={`Replace all ${currentGalleryCount} existing ${currentGalleryCount === 1 ? "image" : "images"}; resulting gallery: 3 images.`}
            label="Replace gallery"
            mode="replace"
            onChange={setMode}
          />
        </fieldset>

        <p className="rounded-sm border border-border-warm bg-cream p-3 font-dm-sans text-caption text-text-secondary">
          Publication is atomic. Existing storage objects are retained for audit and rollback.
        </p>
        {error ? (
          <p className="rounded-sm border border-error bg-cream p-3 font-dm-sans text-caption text-error">
            {error}
          </p>
        ) : null}

        <DialogFooter className="border-border-warm bg-cream">
          <Button
            disabled={isPublishing}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={mode === null || isPublishing}
            onClick={() => mode && void onPublish(mode)}
            type="button"
          >
            {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish approved set
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
