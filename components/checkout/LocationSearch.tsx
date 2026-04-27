"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { searchKenyanLocations } from "@/lib/mapbox";
import type { MapboxLocationSuggestion } from "@/lib/types";

interface LocationSearchProps {
  disabled?: boolean;
  error?: string;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
  onSelect: (suggestion: MapboxLocationSuggestion) => void;
}

const inputClassName =
  "h-12 rounded-2xl border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-gold/20";

export default function LocationSearch({
  disabled = false,
  error,
  initialQuery = "",
  onQueryChange,
  onSelect,
}: LocationSearchProps): ReactElement {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MapboxLocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (disabled) {
      setResults([]);
      return;
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);
      void (async (): Promise<void> => {
        const nextResults = await searchKenyanLocations(trimmedQuery);
        setResults(nextResults);
        setIsLoading(false);
      })();
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [disabled, query]);

  function handleSelect(suggestion: MapboxLocationSuggestion): void {
    setQuery(suggestion.label);
    setResults([]);
    onSelect(suggestion);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          className={inputClassName}
          disabled={disabled}
          onChange={(event): void => {
            setQuery(event.target.value);
            onQueryChange?.(event.target.value);
          }}
          placeholder="Search estate, building, road, or town"
          value={query}
        />
        {isLoading ? (
          <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-gold" />
        ) : null}
      </div>

      {results.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border-warm bg-ivory shadow-card">
          {results.map((result) => (
            <button
              className="flex w-full items-start gap-3 border-b border-border-warm px-4 py-3 text-left last:border-b-0 hover:bg-cream"
              key={result.id}
              onClick={(): void => handleSelect(result)}
              type="button"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              <span className="min-w-0">
                <span className="block font-dm-sans text-body-sm text-obsidian">
                  {result.label}
                </span>
                <span className="block font-dm-sans text-caption text-text-muted">
                  {result.town || "Selected area"}, {result.county || "Kenya"}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {error ? <p className="font-dm-sans text-caption text-error">{error}</p> : null}
    </div>
  );
}
