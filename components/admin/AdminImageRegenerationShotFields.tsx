import type { ReactElement } from "react";

import { Label } from "@/components/ui/label";
import type {
  ProductImageBodyProfile,
  ProductImageComposition,
  ProductImageDetailFocus,
  ProductImageModelRegenerationSettings,
  ProductImageDetailRegenerationSettings,
  ProductImageShotType,
  ProductImageSkinTone,
} from "@/lib/types";

export type RegenerationShotDraft =
  | ProductImageModelRegenerationSettings
  | ProductImageDetailRegenerationSettings;

interface AdminImageRegenerationShotFieldsProps {
  catalogColors: string[];
  disabledColors: string[];
  draft: RegenerationShotDraft;
  onChange: (draft: RegenerationShotDraft) => void;
  shotType: ProductImageShotType;
}

const selectClasses =
  "h-10 w-full min-w-0 rounded-sm border border-border-warm bg-ivory px-3 font-dm-sans text-body-sm text-obsidian outline-none focus:border-gold focus:ring-2 focus:ring-gold/20";
const bodyProfiles: ProductImageBodyProfile[] = ["automatic", "slim", "curvy", "athletic"];
const skinTones: ProductImageSkinTone[] = [
  "automatic",
  "light_brown",
  "medium_brown",
  "deep_brown",
];
const compositions: ProductImageComposition[] = [
  "automatic",
  "standing",
  "seated",
  "walking",
  "three_quarter",
];
const detailFocuses: ProductImageDetailFocus[] = [
  "automatic",
  "fabric",
  "pattern",
  "stitching",
  "closure",
  "construction",
];

function formatOption(value: string): string {
  if (value === "light_brown") return "Light Brown";
  if (value === "medium_brown") return "Medium Brown";
  if (value === "deep_brown") return "Deep Brown";
  if (value === "three_quarter") return "Three-quarter";
  if (value === "pattern") return "Print / Pattern";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AdminImageRegenerationShotFields({
  catalogColors,
  disabledColors,
  draft,
  onChange,
  shotType,
}: AdminImageRegenerationShotFieldsProps): ReactElement {
  const isDetail = shotType === "detail";
  const modelDraft = isDetail ? null : (draft as ProductImageModelRegenerationSettings);
  const detailDraft = isDetail ? (draft as ProductImageDetailRegenerationSettings) : null;
  const instructionId = `${shotType}-regeneration-instruction`;

  return (
    <fieldset className="min-w-0 space-y-4 rounded-sm border border-border-warm bg-cream p-4">
      <legend className="px-2 font-cormorant text-h4 text-obsidian">
        {formatOption(shotType)}
      </legend>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${shotType}-color`}>Catalog color</Label>
          <select
            className={selectClasses}
            id={`${shotType}-color`}
            onChange={(event) => onChange({ ...draft, color: event.target.value || null })}
            value={draft.color ?? ""}
          >
            <option value="">Automatic</option>
            {catalogColors.map((color) => (
              <option disabled={disabledColors.includes(color)} key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {modelDraft ? (
          <>
            <div className="space-y-2">
              <Label htmlFor={`${shotType}-body-profile`}>Model build</Label>
              <select
                className={selectClasses}
                id={`${shotType}-body-profile`}
                onChange={(event) =>
                  onChange({ ...modelDraft, bodyProfile: event.target.value as ProductImageBodyProfile })
                }
                value={modelDraft.bodyProfile}
              >
                {bodyProfiles.map((value) => <option key={value} value={value}>{formatOption(value)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${shotType}-skin-tone`}>Skin tone</Label>
              <select
                className={selectClasses}
                id={`${shotType}-skin-tone`}
                onChange={(event) =>
                  onChange({ ...modelDraft, skinTone: event.target.value as ProductImageSkinTone })
                }
                value={modelDraft.skinTone}
              >
                {skinTones.map((value) => <option key={value} value={value}>{formatOption(value)}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${shotType}-composition`}>Composition</Label>
              <select
                className={selectClasses}
                id={`${shotType}-composition`}
                onChange={(event) =>
                  onChange({ ...modelDraft, composition: event.target.value as ProductImageComposition })
                }
                value={modelDraft.composition}
              >
                {compositions.map((value) => <option key={value} value={value}>{formatOption(value)}</option>)}
              </select>
            </div>
          </>
        ) : null}

        {detailDraft ? (
          <div className="space-y-2">
            <Label htmlFor="detail-focus">Detail focus</Label>
            <select
              className={selectClasses}
              id="detail-focus"
              onChange={(event) =>
                onChange({ ...detailDraft, detailFocus: event.target.value as ProductImageDetailFocus })
              }
              value={detailDraft.detailFocus}
            >
              {detailFocuses.map((value) => <option key={value} value={value}>{formatOption(value)}</option>)}
            </select>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor={instructionId}>Creative direction (optional)</Label>
          <span className="font-dm-sans text-caption text-text-muted">
            {draft.instruction.length}/500
          </span>
        </div>
        <textarea
          className="min-h-24 w-full min-w-0 resize-y rounded-sm border border-border-warm bg-ivory p-3 font-dm-sans text-body-sm text-obsidian outline-none placeholder:text-text-muted focus:border-gold focus:ring-2 focus:ring-gold/20"
          id={instructionId}
          maxLength={500}
          onChange={(event) => onChange({ ...draft, instruction: event.target.value })}
          placeholder="Styling, setting, pose, hair, framing, texture, or product emphasis."
          value={draft.instruction}
        />
      </div>
    </fieldset>
  );
}
