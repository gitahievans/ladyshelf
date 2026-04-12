import type { ReactElement } from "react";
import Link from "next/link";
import { Heart, Search, ShoppingBag } from "lucide-react";

interface AccountQuickLinksProps {
  wishlistCount: number;
  cartCount: number;
}

interface QuickLink {
  description: string;
  href: string;
  icon: typeof Heart;
  label: string;
  meta: string;
}

export default function AccountQuickLinks({
  wishlistCount,
  cartCount,
}: AccountQuickLinksProps): ReactElement {
  const links: QuickLink[] = [
    {
      description: "Pieces you want to revisit when the timing feels right.",
      href: "/wishlist",
      icon: Heart,
      label: "Wishlist",
      meta: `${wishlistCount} saved`,
    },
    {
      description: "Your open bag, ready whenever you're ready to check out.",
      href: "/cart",
      icon: ShoppingBag,
      label: "Bag",
      meta: `${cartCount} in bag`,
    },
    {
      description: "Discover new arrivals, fabrics, and statement silhouettes.",
      href: "/search",
      icon: Search,
      label: "Search",
      meta: "Explore the collection",
    },
  ];

  return (
    <section className="rounded-lg border border-border-warm bg-obsidian p-6 text-ivory shadow-card">
      <div className="max-w-2xl">
        <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-gold">
          Quick Access
        </p>
        <h2 className="mt-2 font-cormorant text-h2">Your Wahi shortcuts</h2>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              className="rounded-md border border-ivory/15 bg-ivory/5 p-4 transition-colors hover:border-gold/60 hover:bg-ivory/10"
              href={link.href}
              key={link.label}
            >
              <div className="flex items-center justify-between gap-3">
                <Icon className="size-5 text-gold" />
                <span className="font-dm-sans text-caption uppercase tracking-[0.16em] text-ivory/70">
                  {link.meta}
                </span>
              </div>
              <h3 className="mt-4 font-cormorant text-h4">{link.label}</h3>
              <p className="mt-2 font-dm-sans text-body-sm text-ivory/75">
                {link.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
