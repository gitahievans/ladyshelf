"use client";

import { type ReactElement, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Heart,
  LogIn,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import SearchOverlay from "@/components/search/SearchOverlay";
import { fetchAdminMeFromSession } from "@/lib/api/admin";
import { brandMedia } from "@/lib/mock/media";
import { fadeInVariant } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

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
  const router = useRouter();
  const totalItems = useCartStore((state) => state.totalItems);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const wishlistCount = useWishlistStore((state) => state.count);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
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
    let isMounted = true;

    async function resolveAdminAccess(): Promise<void> {
      if (!isAuthenticated) {
        setHasAdminAccess(false);
        return;
      }

      try {
        const adminUser = await fetchAdminMeFromSession();

        if (isMounted) {
          setHasAdminAccess(Boolean(adminUser?.isActive));
        }
      } catch {
        if (isMounted) {
          setHasAdminAccess(false);
        }
      }
    }

    void resolveAdminAccess();

    return (): void => {
      isMounted = false;
    };
  }, [isAuthenticated]);

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

  async function handleLogout(): Promise<void> {
    await logout();
    router.push("/");
  }

  return (
    <>
      <SearchOverlay onOpenChange={setIsSearchOpen} open={isSearchOpen} />
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-50 border-b transition-all duration-300",
          showOpaqueNavbar
            ? "border-ivory/8 bg-obsidian/98 shadow-card backdrop-blur-sm"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto grid h-[60px] max-w-[1400px] grid-cols-[auto_1fr_auto] items-center px-4 md:px-6 lg:h-[var(--navbar-height)] lg:grid-cols-[minmax(220px,1fr)_auto_minmax(480px,1fr)] lg:px-10 xl:px-12">
          <div className="flex items-center gap-3 lg:min-w-0">
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
              className="hidden lg:inline-flex lg:items-center"
              href="/"
            >
              <Image
                alt="Lady Shelf logo"
                className="h-12 w-auto object-contain xl:h-14"
                height={88}
                priority
                src={brandMedia.logoWhite}
                width={244}
              />
            </Link>
          </div>

          <Link className="justify-self-center lg:hidden" href="/">
            <Image
              alt="Lady Shelf logo"
              className="h-10 w-auto object-contain"
              height={72}
              priority
              src={brandMedia.logoWhite}
              width={188}
            />
          </Link>

          <nav className="hidden items-center justify-center gap-10 lg:flex xl:gap-14">
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

          <div className="flex items-center justify-end gap-2 lg:min-w-0 lg:gap-3">
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

            <div className="hidden items-center gap-3 lg:flex lg:flex-nowrap lg:justify-end">
              <button
                aria-label="Search"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold"
                onClick={(): void => setIsSearchOpen(true)}
                type="button"
              >
                <Search className="size-5" />
              </button>
              <Link
                aria-label="Wishlist"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold"
                href="/wishlist"
              >
                <Heart className="size-5" />
                {wishlistCount > 0 ? (
                  <span className="absolute top-1.5 right-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-dm-sans text-[10px] font-semibold text-obsidian">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                ) : null}
              </Link>
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
              {hasAdminAccess ? (
                <Link
                  className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-gold bg-gold px-5 font-dm-sans text-caption font-semibold uppercase tracking-widest text-obsidian transition-colors hover:bg-sand"
                  href="/admin"
                >
                  <ShieldCheck className="size-4" />
                  Admin
                </Link>
              ) : null}
              {isAuthenticated ? (
                <button
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-full border border-ivory/20 px-6 font-dm-sans text-caption uppercase tracking-[0.18em] whitespace-nowrap text-ivory transition-colors hover:border-gold hover:text-gold"
                  onClick={(): void => {
                    void handleLogout();
                  }}
                  type="button"
                >
                  Sign Out
                </button>
              ) : null}
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
                <Link
                  className="font-cormorant text-h2 text-ivory transition-colors hover:text-gold"
                  href="/search"
                  onClick={(): void => setIsMobileMenuOpen(false)}
                >
                  Search
                </Link>
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
                <Link
                  className="font-cormorant text-h2 text-ivory transition-colors hover:text-gold"
                  href="/wishlist"
                  onClick={(): void => setIsMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    {hasAdminAccess ? (
                      <Link
                        className="flex h-12 items-center justify-center rounded-full border border-gold bg-gold px-6 font-dm-sans text-body-sm font-medium text-obsidian"
                        href="/admin"
                        onClick={(): void => setIsMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    ) : null}
                    <Link
                      className="flex h-12 items-center justify-center rounded-full border border-ivory/20 px-6 font-dm-sans text-body-sm font-medium text-ivory"
                      href="/account/orders"
                      onClick={(): void => setIsMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      className="flex h-12 items-center justify-center rounded-full bg-gold px-6 font-dm-sans text-body-sm font-medium text-obsidian"
                      href="/account"
                      onClick={(): void => setIsMobileMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      className="flex h-12 items-center justify-center rounded-full border border-ivory/20 px-6 font-dm-sans text-body-sm font-medium text-ivory"
                      onClick={(): void => {
                        setIsMobileMenuOpen(false);
                        void handleLogout();
                      }}
                      type="button"
                    >
                      Sign Out
                    </button>
                  </>
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
                      Join Lady Shelf
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
