import type { ReactElement } from "react";

interface AdminSectionPlaceholderProps {
  description: string;
  eyebrow: string;
  title: string;
}

export default function AdminSectionPlaceholder({
  description,
  eyebrow,
  title,
}: AdminSectionPlaceholderProps): ReactElement {
  return (
    <section className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
      <p className="font-dm-sans text-label uppercase tracking-widest text-gold">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-cormorant text-h2 text-obsidian">{title}</h2>
      <p className="mt-3 max-w-3xl font-dm-sans text-body-sm text-text-secondary">
        {description}
      </p>
    </section>
  );
}
