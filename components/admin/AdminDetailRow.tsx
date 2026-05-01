import type { ReactElement } from "react";

interface AdminDetailRowProps {
  label: string;
  value?: string | number | null;
}

export default function AdminDetailRow({
  label,
  value,
}: AdminDetailRowProps): ReactElement | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="rounded-sm border border-border-warm bg-cream px-3 py-3">
      <p className="font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 font-dm-sans text-body-sm text-obsidian">
        {value}
      </p>
    </div>
  );
}
