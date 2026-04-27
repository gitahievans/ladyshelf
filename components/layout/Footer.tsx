import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, MessageCircle, Music2 } from "lucide-react";

import { brandMedia } from "@/lib/mock/media";

interface FooterLink {
  href: string;
  label: string;
}

const shopLinks: FooterLink[] = [
  { href: "/shop", label: "All Products" },
  { href: "/shop?category=office-formal", label: "Office & Formal" },
  { href: "/shop?category=casual", label: "Casual Wear" },
  { href: "/shop?category=party-evening", label: "Party & Evening" },
  { href: "/shop?category=traditional-african", label: "Traditional African" },
  { href: "/shop?category=accessories", label: "Accessories" },
];

const helpLinks: FooterLink[] = [
  { href: "/#about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/sizing-guide", label: "Sizing Guide" },
  { href: "/delivery", label: "Delivery Information" },
  { href: "/returns", label: "Returns Policy" },
  { href: "/faqs", label: "FAQs" },
];

export default function Footer(): ReactElement {
  return (
    <footer className="border-t border-bark/30 bg-obsidian text-ivory">
      <div className="mx-auto grid max-w-container gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-5">
          <div className="space-y-3">
            <Link
              className="inline-flex items-center"
              href="/"
            >
              <Image
                alt="Wahi Fashion logo"
                className="h-16 w-auto object-contain lg:h-18"
                height={104}
                src={brandMedia.logoWhite}
                width={280}
              />
            </Link>
            <p className="max-w-xs font-dm-sans text-body text-text-muted">
              More than fashion. A lifestyle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bark/60 text-ivory transition-colors hover:border-gold hover:text-gold"
              href="https://instagram.com"
            >
              <Camera className="size-4" />
            </Link>
            <Link
              aria-label="TikTok"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bark/60 text-ivory transition-colors hover:border-gold hover:text-gold"
              href="https://tiktok.com"
            >
              <Music2 className="size-4" />
            </Link>
            <Link
              aria-label="Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bark/60 text-ivory transition-colors hover:border-gold hover:text-gold"
              href="https://facebook.com"
            >
              <MessageCircle className="size-4" />
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
            Shop
          </p>
          <div className="flex flex-col gap-3">
            {shopLinks.map((link) => (
              <Link
                key={link.label}
                className="font-dm-sans text-body-sm text-ivory transition-colors hover:text-gold"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
            Help
          </p>
          <div className="flex flex-col gap-3">
            {helpLinks.map((link) => (
              <Link
                key={link.label}
                className="font-dm-sans text-body-sm text-ivory transition-colors hover:text-gold"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
            Contact
          </p>
          <div className="space-y-3 font-dm-sans text-body-sm text-text-muted">
            <p>Lumumba Drive, Roysambu, Nairobi</p>
            <p>wahifashion.africa</p>
            <p>Mon-Sat 9am-7pm, Sun 11am-5pm</p>
          </div>
        </div>
      </div>

      <div className="border-t border-bark/30 px-6 py-4 text-center font-dm-sans text-caption text-text-muted">
        &copy; 2026 Wahi Fashion. All rights reserved.
      </div>
    </footer>
  );
}
