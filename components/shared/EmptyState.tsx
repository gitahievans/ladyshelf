import type { ReactElement } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
}: EmptyStateProps): ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-border-warm bg-cream px-6 py-12 text-center shadow-card",
        className,
      )}
    >
      <h2 className="font-cormorant text-h2 text-obsidian">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-md font-dm-sans text-body text-text-secondary">
          {description}
        </p>
      ) : null}
      {ctaLabel && ctaHref ? (
        <Button
          asChild
          className="mt-6 h-11 rounded-full bg-gold px-6 font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
        >
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
