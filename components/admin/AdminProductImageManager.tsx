"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Trash2, Upload } from "lucide-react";

import { deleteAdminProductImages, uploadAdminProductImages } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { AdminUploadedProductImage } from "@/lib/types";

interface ProductImageAsset extends AdminUploadedProductImage {
  isNewUpload: boolean;
}

interface AdminProductImageManagerProps {
  canManage: boolean;
  images: string[];
  onChange: (images: string[]) => Promise<void> | void;
  productLabel: string;
  productSlug?: string;
  successMessage?: string;
}

const PRODUCT_IMAGES_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/`;

function buildAssetFromUrl(url: string): ProductImageAsset {
  const path = url.startsWith(PRODUCT_IMAGES_PREFIX)
    ? decodeURIComponent(url.slice(PRODUCT_IMAGES_PREFIX.length))
    : "";
  const fallbackName = path ? path.split("/").at(-1) ?? "Product image" : "Product image";

  return {
    name: fallbackName,
    path,
    url,
    isNewUpload: false,
  };
}

function fileOrderLabel(index: number): string {
  return `Image ${index + 1}`;
}

export default function AdminProductImageManager({
  canManage,
  images,
  onChange,
  productLabel,
  productSlug,
  successMessage,
}: AdminProductImageManagerProps) {
  const inputId = useId();
  const [assets, setAssets] = useState<ProductImageAsset[]>(images.map(buildAssetFromUrl));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setAssets(images.map(buildAssetFromUrl));
  }, [images]);

  async function syncAssets({
    nextAssets,
    previousAssets,
    successText,
  }: {
    nextAssets: ProductImageAsset[];
    previousAssets?: ProductImageAsset[];
    successText?: string;
  }): Promise<void> {
    setAssets(nextAssets);

    try {
      await onChange(nextAssets.map((asset) => asset.url));
      if (successText) {
        setMessage(successText);
      }
    } catch (changeError) {
      if (previousAssets) {
        setAssets(previousAssets);
      }
      setError(
        changeError instanceof Error
          ? changeError.message
          : "We could not save those product image changes.",
      );
    }
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setError(null);
    setMessage(null);
    setIsUploading(true);

    try {
      const uploaded = await uploadAdminProductImages({
        files,
        productSlug,
      });
      const nextAssets = [
        ...assets,
        ...uploaded.map((asset) => ({ ...asset, isNewUpload: true })),
      ];
      await syncAssets({
        nextAssets,
        previousAssets: assets,
        successText: successMessage,
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "We could not upload those product images.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleRemove(index: number): Promise<void> {
    const asset = assets[index];
    const nextAssets = assets.filter((_, currentIndex) => currentIndex !== index);

    setError(null);
    setMessage(null);

    try {
      if (asset.isNewUpload && asset.path) {
        await deleteAdminProductImages([asset.path]);
      }
      await syncAssets({
        nextAssets,
        previousAssets: assets,
        successText: successMessage,
      });
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "We could not remove that product image.",
      );
    }
  }

  async function handleMove(index: number, direction: "up" | "down"): Promise<void> {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= assets.length) return;

    setError(null);
    setMessage(null);
    const nextAssets = [...assets];
    const [movedAsset] = nextAssets.splice(index, 1);
    nextAssets.splice(targetIndex, 0, movedAsset);
    await syncAssets({
      nextAssets,
      previousAssets: assets,
      successText: successMessage,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-sm border border-border-warm bg-cream p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-dm-sans text-caption uppercase tracking-[0.24em] text-text-muted">
            Product images
          </p>
          <p className="mt-1 font-dm-sans text-body-sm text-text-secondary">
            {productLabel}
          </p>
        </div>

        {canManage ? (
          <div className="flex items-center gap-3">
            <input
              id={inputId}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => void handleUpload(event)}
            />
            <label htmlFor={inputId}>
              <span className="sr-only">Upload product images</span>
              <span
                className={cn(
                  "inline-flex h-11 cursor-pointer items-center rounded-sm bg-gold px-4 font-dm-sans text-caption uppercase tracking-widest text-obsidian transition-colors hover:bg-sand",
                  isUploading ? "pointer-events-none opacity-70" : "",
                )}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload images
              </span>
            </label>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-sm border border-error bg-ivory p-3 font-dm-sans text-caption text-error">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-sm border border-success bg-ivory p-3 font-dm-sans text-caption text-success">
          {message}
        </div>
      ) : null}

      {assets.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border-warm bg-ivory p-6 font-dm-sans text-body-sm text-text-secondary">
          {canManage
            ? "Upload one or more product images to preview them here."
            : "No product images available yet."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {assets.map((asset, index) => (
            <div key={`${asset.url}-${index}`} className="overflow-hidden rounded-sm border border-border-warm bg-ivory">
              <div className="relative aspect-[3/4] bg-cream">
                <Image
                  src={asset.url}
                  alt={`${productLabel} ${fileOrderLabel(index)}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <div className="space-y-3 p-3">
                <div>
                  <p className="font-dm-sans text-caption uppercase tracking-[0.24em] text-text-muted">
                    {fileOrderLabel(index)}
                  </p>
                  <p className="mt-1 truncate font-dm-sans text-body-sm text-obsidian">
                    {asset.name}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="border-border-warm bg-cream text-obsidian hover:bg-sand"
                      onClick={() => void handleMove(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="border-border-warm bg-cream text-obsidian hover:bg-sand"
                      onClick={() => void handleMove(index, "down")}
                      disabled={index === assets.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className="border-border-warm bg-cream text-obsidian hover:bg-sand"
                      onClick={() => void handleRemove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
