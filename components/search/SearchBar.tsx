"use client";

import type { FormEvent, ReactElement } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface SearchBarProps {
  query: string;
  onClear?: () => void;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  query,
  onClear,
  onQueryChange,
  onSubmit,
  placeholder = "Search products, fabrics, colours, or collections",
  className,
  autoFocus = false,
}: SearchBarProps): ReactElement {
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-full border border-border-warm bg-ivory px-4 py-2 shadow-card",
        className,
      )}
      onSubmit={handleSubmit}
    >
      <Search className="size-5 text-text-muted" />
      <input
        autoFocus={autoFocus}
        className="h-11 flex-1 bg-transparent font-dm-sans text-body text-obsidian outline-none placeholder:text-text-muted"
        onChange={(event): void => onQueryChange(event.target.value)}
        placeholder={placeholder}
        value={query}
      />
      {query ? (
        <button
          aria-label="Clear search"
          className="inline-flex size-10 items-center justify-center rounded-full text-text-muted transition-colors hover:text-obsidian"
          onClick={onClear}
          type="button"
        >
          <X className="size-4" />
        </button>
      ) : null}
      <button
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 font-dm-sans text-caption uppercase tracking-[0.16em] text-obsidian transition-colors hover:bg-bark hover:text-ivory"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}
