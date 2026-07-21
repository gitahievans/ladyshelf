"use client";

import type { ReactElement } from "react";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import CollectionCard from "@/components/collections/CollectionCard";
import CollectionViewToggle from "@/components/collections/CollectionViewToggle";
import type { CollectionViewMode } from "@/components/collections/CollectionViewToggle";
import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/shared/EmptyState";
import { fadeUpVariant, staggerContainer } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/lib/types";

interface CollectionsPageContentProps {
  collections: Category[];
}

const storageKey = "lady-shelf-collections-view";
const storageEvent = "lady-shelf-collections-view-change";

function getSavedViewMode(): CollectionViewMode {
  if (typeof window === "undefined") return "grid";

  return window.sessionStorage.getItem(storageKey) === "list" ? "list" : "grid";
}

function subscribeToViewMode(onChange: () => void): () => void {
  window.addEventListener(storageEvent, onChange);

  return (): void => window.removeEventListener(storageEvent, onChange);
}

export default function CollectionsPageContent({
  collections,
}: CollectionsPageContentProps): ReactElement {
  const reducedMotion = useReducedMotion();
  const viewMode = useSyncExternalStore(
    subscribeToViewMode,
    getSavedViewMode,
    (): CollectionViewMode => "grid",
  );

  function handleViewModeChange(nextView: CollectionViewMode): void {
    window.sessionStorage.setItem(storageKey, nextView);
    window.dispatchEvent(new Event(storageEvent));
  }

  return (
    <>
      <section className="bg-ivory px-6 py-10 md:px-8 lg:py-16">
        <div className="mx-auto max-w-container">
          <motion.header
            animate="visible"
            className="border-b border-border-warm pb-8 md:pb-10"
            initial={reducedMotion ? false : "hidden"}
            variants={fadeUpVariant}
          >
            <nav className="flex items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
              <Link className="hover:text-obsidian" href="/">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-obsidian">Collections</span>
            </nav>
            <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
                  The Lady Shelf edit
                </p>
                <h1 className="mt-3 max-w-4xl font-cormorant text-h1 text-obsidian lg:text-display-lg">
                  Dress for every version of you.
                </h1>
                <p className="mt-4 max-w-2xl font-dm-sans text-body text-text-secondary">
                  Explore considered edits for workdays, weekends, celebrations,
                  and moments shaped by heritage.
                </p>
              </div>
              <div className="flex items-center justify-between gap-6 md:justify-end">
                <p
                  aria-live="polite"
                  className="font-dm-sans text-body-sm text-text-muted"
                >
                  {collections.length}{" "}
                  {collections.length === 1 ? "collection" : "collections"}
                </p>
                <CollectionViewToggle
                  onViewModeChange={handleViewModeChange}
                  viewMode={viewMode}
                />
              </div>
            </div>
          </motion.header>

          {collections.length === 0 ? (
            <EmptyState
              className="mt-10"
              ctaHref="/shop"
              ctaLabel="Shop all pieces"
              description="Our edits are being prepared. Explore the full shop while we finish arranging them."
              title="The collection room is being curated"
            />
          ) : (
            <motion.div
              animate="visible"
              className={cn(
                "mt-8",
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6"
                  : "flex flex-col gap-5",
              )}
              initial={reducedMotion ? false : "hidden"}
              variants={reducedMotion ? undefined : staggerContainer}
            >
              {collections.map((collection, index) => (
                <motion.div
                  className={cn(
                    viewMode === "grid" &&
                      index === collections.length - 1 &&
                      collections.length % 2 === 1 &&
                      "md:col-span-2",
                  )}
                  key={collection.id}
                  variants={reducedMotion ? undefined : fadeUpVariant}
                >
                  <CollectionCard
                    category={collection}
                    isFeature={
                      viewMode === "grid" &&
                      index === collections.length - 1 &&
                      collections.length % 2 === 1
                    }
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
