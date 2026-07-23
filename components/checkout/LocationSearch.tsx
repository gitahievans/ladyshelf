"use client";

import type { ReactElement } from "react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { searchKenyanLocations } from "@/lib/mapbox";
import { cn } from "@/lib/utils/cn";
import type { MapboxLocationSuggestion } from "@/lib/types";

interface LocationSearchProps {
  disabled?: boolean;
  error?: string;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
  onSelect: (suggestion: MapboxLocationSuggestion) => void;
}

const inputClassName =
  "h-12 rounded-2xl border-border-warm bg-ivory px-4 font-dm-sans text-body-sm text-obsidian placeholder:text-text-muted focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/30";

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
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const skipNextSearchRef = useRef(false);

  useEffect(() => {
    setQuery(initialQuery);
    setHasUserEdited(false);
    setSelectedSuggestionId(null);
    setResults([]);
    setIsLoading(false);
  }, [initialQuery]);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      setResults([]);
      setIsLoading(false);
      return;
    }

    if (disabled) {
      setResults([]);
      return;
    }

    if (!hasUserEdited) {
      setResults([]);
      setIsLoading(false);
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
  }, [disabled, hasUserEdited, query]);

  function handleSelect(suggestion: MapboxLocationSuggestion): void {
    skipNextSearchRef.current = true;
    setHasUserEdited(false);
    setSelectedSuggestionId(suggestion.id);
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
            setHasUserEdited(true);
            setSelectedSuggestionId(null);
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
              aria-pressed={selectedSuggestionId === result.id}
              className={cn(
                "flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0 focus-visible:border-gold focus-visible:bg-gold/15 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-gold/30",
                selectedSuggestionId === result.id
                  ? "border-gold bg-gold/15"
                  : "border-border-warm bg-ivory hover:border-sand hover:bg-cream",
              )}
              key={result.id}
              onClick={(): void => handleSelect(result)}
              type="button"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
              <span className="min-w-0 flex-1">
                <span className="block font-dm-sans text-body-sm text-obsidian">
                  {result.label}
                </span>
                <span className="block font-dm-sans text-caption text-text-muted">
                  {result.town || "Selected area"}, {result.county || "Kenya"}
                </span>
              </span>
              {selectedSuggestionId === result.id ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {error ? <p className="font-dm-sans text-caption text-error">{error}</p> : null}
    </div>
  );
}
