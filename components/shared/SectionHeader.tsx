import type { ReactElement } from "react";

import { cn } from "@/lib/utils/cn";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export default function SectionHeader({
  label,
  title,
  subtitle,
  align = "left",
}: SectionHeaderProps): ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
      )}
    >
      {label ? (
        <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
          {label}
        </p>
      ) : null}
      <h2 className="max-w-3xl font-cormorant text-h2 text-obsidian md:text-h1">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl font-dm-sans text-body text-text-secondary">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
