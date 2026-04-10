import type { ReactElement } from "react";

export default function Home(): ReactElement {
  return (
    <section className="min-h-screen bg-ivory px-6 py-16 md:px-20 md:py-24">
      <div className="mx-auto flex max-w-container flex-col gap-10 rounded-lg border border-border-warm bg-cream p-8 shadow-card md:p-12">
        <div className="flex flex-col gap-4">
          <p className="font-dm-sans text-label uppercase text-gold">
            Phase 1 Foundation
          </p>
          <h1 className="max-w-3xl font-cormorant text-h2 text-obsidian md:text-h1">
            Wahi Fashion&apos;s design tokens, typography, and state layer are in
            place.
          </h1>
          <p className="max-w-2xl font-dm-sans text-body text-text-secondary">
            This temporary foundation page exists to verify the Tailwind token
            pipeline, the Google font wiring, and the base Wahi palette before
            the real interface components are built in later phases.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-sm border border-border-warm bg-gold p-6 text-obsidian shadow-card">
            <p className="font-dm-sans text-label uppercase">Token Check</p>
            <p className="mt-3 font-cormorant text-h4">bg-gold is active.</p>
          </div>
          <div className="rounded-sm border border-border-warm bg-obsidian p-6 text-ivory shadow-card">
            <p className="font-dm-sans text-label uppercase text-sand">
              Editorial Type
            </p>
            <p className="mt-3 font-cormorant text-h4">Cormorant Garamond</p>
          </div>
          <div className="rounded-sm border border-border-warm bg-ivory p-6 text-obsidian shadow-card">
            <p className="font-dm-sans text-label uppercase text-bark">
              Interface Type
            </p>
            <p className="mt-3 font-dm-sans text-body">
              DM Sans carries the product UI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
