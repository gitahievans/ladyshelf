import type { ReactElement } from "react";

import { cn } from "@/lib/utils/cn";
import type { ProductImagePublicationMode } from "@/lib/types";

interface AdminImagePublicationChoiceProps {
  checked: boolean;
  description: string;
  label: string;
  mode: ProductImagePublicationMode;
  onChange: (mode: ProductImagePublicationMode) => void;
}

export default function AdminImagePublicationChoice({
  checked,
  description,
  label,
  mode,
  onChange,
}: AdminImagePublicationChoiceProps): ReactElement {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-sm border p-4",
        checked ? "border-gold bg-sand/40" : "border-border-warm bg-cream",
      )}
    >
      <input
        checked={checked}
        className="mt-1 h-4 w-4 accent-gold"
        name="publication-mode"
        onChange={() => onChange(mode)}
        type="radio"
        value={mode}
      />
      <span>
        <span className="block font-dm-sans text-body-sm font-semibold text-obsidian">
          {label}
        </span>
        <span className="mt-1 block font-dm-sans text-caption text-text-secondary">
          {description}
        </span>
      </span>
    </label>
  );
}
