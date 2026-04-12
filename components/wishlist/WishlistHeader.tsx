import type { ReactElement } from "react";

interface WishlistHeaderProps {
  count: number;
}

export default function WishlistHeader({
  count,
}: WishlistHeaderProps): ReactElement {
  return (
    <div className="space-y-3">
      <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
        Saved for later
      </p>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <h1 className="font-cormorant text-h1 text-obsidian lg:text-display-lg">
            Your Wishlist
          </h1>
          <p className="max-w-2xl font-dm-sans text-body text-text-secondary">
            A private edit of silhouettes, textures, and statement pieces worth
            returning to.
          </p>
        </div>
        <p className="font-dm-sans text-body-sm text-text-secondary">
          {count} {count === 1 ? "piece" : "pieces"} saved
        </p>
      </div>
    </div>
  );
}
