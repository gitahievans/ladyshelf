import type { ReactElement } from "react";

import { cn } from "@/lib/utils/cn";
import type { BadgeType } from "@/lib/types";

interface BadgeProps {
  type: BadgeType;
  className?: string;
}

const badgeLabels: Record<BadgeType, string> = {
  bestseller: "Bestseller",
  limited: "Limited",
  new: "New",
  sale: "Sale",
};

const badgeStyles: Record<BadgeType, string> = {
  bestseller: "bg-mahogany text-ivory",
  limited: "bg-bark text-ivory",
  new: "bg-obsidian text-ivory",
  sale: "bg-gold text-obsidian",
};

export default function Badge({
  type,
  className,
}: BadgeProps): ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 font-dm-sans text-sm uppercase tracking-[0.18em]",
        badgeStyles[type],
        className,
      )}
    >
      {badgeLabels[type]}
    </span>
  );
}
