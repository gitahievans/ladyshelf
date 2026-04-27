import type { ReactElement } from "react";

import { cn } from "@/lib/utils/cn";

interface AdminStatusProps {
  value: string;
  tone?: "neutral" | "success" | "warning" | "error";
}

export function formatAdminLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AdminStatus({
  value,
  tone = "neutral",
}: AdminStatusProps): ReactElement {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full px-2 py-1 font-dm-sans text-caption uppercase tracking-wider",
        tone === "success" && "bg-success text-ivory",
        tone === "warning" && "bg-warning text-obsidian",
        tone === "error" && "bg-error text-ivory",
        tone === "neutral" && "bg-cream text-text-secondary",
      )}
    >
      {formatAdminLabel(value)}
    </span>
  );
}
