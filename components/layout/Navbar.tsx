"use client";

import { type ReactElement, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Heart,
  LogIn,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import { fadeInVariant } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

interface NavigationLink {
  href: string;
  label: string;
}

const navigationLinks: NavigationLink[] = [
  { href: "/shop", label: "Shop" },
  { href: "/shop", label: "Collections" },
  { href: "/#about", label: "About" },
];

export default function Navbar(): ReactElement {
  const totalItems = useCartStore((state) => state.totalItems);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const allowTransparent = pathname === "/";

  useEffect((): (() => void) => {
    function handleScroll(): void {
      setIsScrolled(window.scrollY > 12);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return (): void => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect((): (() => void) => {
    function handleResize(): void {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return (): void => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const accountHref = isAuthenticated ? "/account" : "/auth/login";
  const accountLabel = isAuthenticated ? "Account" : "Welcome Back";
  const showOpaqueNavbar = isScrolled || !allowTransparent;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-50 border-b border-transparent transition-all duration-300",
          showOpaqueNavbar ? "bg-obsidian shadow-card" : "bg-transparent",
        )}
      >
        <div className="mx-auto grid h-[60px] max-w-container grid-cols-[auto_1fr_auto] items-center px-4 md:px-6 lg:flex lg:h-[var(--navbar-height)] lg:justify-between lg:px-8">
          <div className="flex items-center gap-3 lg:w-1/3">
            <button
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold lg:hidden"
              onClick={(): void => setIsMobileMenuOpen((current) => !current)}
              type="button"
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
            <Link
              className="hidden font-cormorant text-body-lg font-light tracking-[0.3em] text-ivory lg:inline-block lg:text-h4"
              href="/"
            >
              WAHI FASHION
            </Link>
          </div>

          <Link
            className="justify-self-center font-cormorant text-body-lg font-light tracking-[0.3em] text-ivory md:text-h4 lg:hidden"
            href="/"
          >
            WAHI FASHION
          </Link>

          <nav className="hidden items-center justify-center gap-8 lg:flex lg:w-1/3">
            {navigationLinks.map((link) => (
              <Link
                key={link.label}
                className="font-dm-sans text-label uppercase tracking-[0.18em] text-ivory transition-colors hover:text-gold"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2 lg:w-1/3">
            <button
              aria-label="Open cart"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold"
              onClick={toggleCart}
              type="button"
            >
              <ShoppingBag className="size-5" />
              {totalItems > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-dm-sans text-[10px] font-semibold text-obsidian">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              ) : null}
            </button>

            <div className="hidden items-center gap-2 lg:flex">
              <button
                aria-label="Search"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold"
                type="button"
              >
                <Search className="size-5" />
              </button>
              <button
                aria-label="Wishlist"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold"
                type="button"
              >
                <Heart className="size-5" />
              </button>
              <Link
                aria-label={accountLabel}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold"
                href={accountHref}
              >
                {isAuthenticated ? (
                  <UserRound className="size-5" />
                ) : (
                  <LogIn className="size-5" />
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            animate="visible"
            className="fixed inset-0 z-40 bg-obsidian px-6 pt-24 pb-8 lg:hidden"
            exit="hidden"
            initial="hidden"
            variants={
              reducedMotion
                ? {
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 },
                  }
                : fadeInVariant
            }
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex flex-col gap-6">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.label}
                    className="font-cormorant text-h2 text-ivory transition-colors hover:text-gold"
                    href={link.href}
                    onClick={(): void => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                {isAuthenticated ? (
                  <Link
                    className="flex h-12 items-center justify-center rounded-full bg-gold px-6 font-dm-sans text-body-sm font-medium text-obsidian"
                    href="/account"
                    onClick={(): void => setIsMobileMenuOpen(false)}
                  >
                    My Account
                  </Link>
                ) : (
                  <>
                    <Link
                      className="flex h-12 items-center justify-center rounded-full bg-gold px-6 font-dm-sans text-body-sm font-medium text-obsidian"
                      href="/auth/login"
                      onClick={(): void => setIsMobileMenuOpen(false)}
                    >
                      Welcome Back
                    </Link>
                    <Link
                      className="flex h-12 items-center justify-center rounded-full border border-ivory/20 px-6 font-dm-sans text-body-sm font-medium text-ivory"
                      href="/auth/register"
                      onClick={(): void => setIsMobileMenuOpen(false)}
                    >
                      Join Wahi
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
