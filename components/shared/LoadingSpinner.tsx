import type { ReactElement } from "react";

import { cn } from "@/lib/utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<LoadingSpinnerProps["size"]>, string> = {
  lg: "size-10 border-[3px]",
  md: "size-7 border-2",
  sm: "size-5 border-2",
};

export default function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps): ReactElement {
  return (
    <span
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-gold/25 border-t-gold",
        sizeClasses[size],
        className,
      )}
      role="status"
    />
  );
}
