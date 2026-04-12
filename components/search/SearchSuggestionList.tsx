import type { ReactElement } from "react";

import type { SearchResultGroup } from "@/lib/types";

interface SearchSuggestionListProps {
  groups: SearchResultGroup[];
  onSelect: (value: string) => void;
}

export default function SearchSuggestionList({
  groups,
  onSelect,
}: SearchSuggestionListProps): ReactElement {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section className="space-y-3" key={group.title}>
          <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-text-muted">
            {group.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <button
                className="min-h-11 rounded-full border border-border-warm bg-ivory px-4 py-2 font-dm-sans text-caption uppercase tracking-[0.14em] text-text-secondary transition-colors hover:border-gold hover:text-obsidian"
                key={item}
                onClick={(): void => onSelect(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
