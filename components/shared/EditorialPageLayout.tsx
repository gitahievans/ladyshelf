import type { ReactElement } from "react";
import Link from "next/link";

import Footer from "@/components/layout/Footer";

interface EditorialSection {
  title: string;
  body: readonly string[];
}

interface EditorialPageLayoutProps {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: readonly EditorialSection[];
  ctaTitle: string;
  ctaBody: string;
  ctaHref: string;
  ctaLabel: string;
}

export default function EditorialPageLayout({
  eyebrow,
  title,
  introduction,
  sections,
  ctaTitle,
  ctaBody,
  ctaHref,
  ctaLabel,
}: EditorialPageLayoutProps): ReactElement {
  return (
    <>
      <section className="bg-ivory px-6 py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-container space-y-10">
          <div className="space-y-4 border-b border-border-warm pb-8">
            <nav className="flex items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
              <Link className="transition-colors hover:text-obsidian" href="/">
                Home
              </Link>
              <span>/</span>
              <span className="text-obsidian">{title}</span>
            </nav>
            <div className="space-y-3">
              <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
                {eyebrow}
              </p>
              <h1 className="max-w-4xl font-cormorant text-h1 text-obsidian lg:text-display-lg">
                {title}
              </h1>
              <p className="max-w-3xl font-dm-sans text-body text-text-secondary">
                {introduction}
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
            <div className="space-y-6">
              {sections.map((section) => (
                <article
                  className="rounded-lg border border-border-warm bg-cream p-6 shadow-card"
                  key={section.title}
                >
                  <h2 className="font-cormorant text-h3 text-obsidian">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-3">
                    {section.body.map((paragraph) => (
                      <p
                        className="font-dm-sans text-body text-text-secondary"
                        key={paragraph}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <aside className="rounded-lg border border-border-warm bg-obsidian p-6 shadow-card lg:sticky lg:top-24 lg:h-fit">
              <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
                Need Help?
              </p>
              <h2 className="mt-3 font-cormorant text-h3 text-ivory">
                {ctaTitle}
              </h2>
              <p className="mt-3 font-dm-sans text-body text-text-muted">
                {ctaBody}
              </p>
              <Link
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm bg-gold px-6 py-3 font-dm-sans text-label uppercase tracking-[0.18em] text-obsidian transition-colors hover:bg-sand"
                href={ctaHref}
              >
                {ctaLabel}
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
