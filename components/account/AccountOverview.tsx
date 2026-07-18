"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import AccountProfileEditor from "@/components/account/AccountProfileEditor";
import AccountSecurityPanel from "@/components/account/AccountSecurityPanel";
import AddressBook from "@/components/account/AddressBook";
import AccountQuickLinks from "@/components/account/AccountQuickLinks";
import ProfileSummary from "@/components/account/ProfileSummary";
import RecentOrders from "@/components/account/RecentOrders";
import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { fetchAccountOrders } from "@/lib/api/orders";
import { fadeUpVariant, staggerContainer } from "@/lib/utils/animations";
import type { Order } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

export default function AccountOverview(): ReactElement {
  const prefersReducedMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const totalItems = useCartStore((state) => state.totalItems);
  const wishlistCount = useWishlistStore((state) => state.count);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const userId = user?.id;

  useEffect((): (() => void) | void => {
    if (!isInitialized || !isAuthenticated || !userId) {
      return;
    }

    let isMounted = true;

    void Promise.resolve()
      .then(() => {
        if (!isMounted) {
          return [];
        }

        setIsLoadingOrders(true);
        return fetchAccountOrders();
      })
      .then((nextOrders) => {
        if (!isMounted) {
          return;
        }

        setOrders(nextOrders);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setOrders([]);
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        setIsLoadingOrders(false);
      });

    return (): void => {
      isMounted = false;
    };
  }, [isAuthenticated, isInitialized, userId]);

  if (!isInitialized) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-ivory px-6">
        <LoadingSpinner size="lg" />
      </section>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <section className="bg-ivory px-6 py-12 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-container">
            <EmptyState
              ctaHref="/auth/login"
              ctaLabel="Sign In"
              description="Your account page opens once you sign in. From there you can revisit orders, addresses, and saved pieces."
              title="Your Lady Shelf account is waiting"
            />
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section className="bg-ivory px-6 py-10 lg:px-8 lg:py-12">
        <motion.div
          animate="visible"
          className="mx-auto max-w-container space-y-8"
          initial="hidden"
          variants={prefersReducedMotion ? undefined : staggerContainer}
        >
          <motion.div className="space-y-4" variants={fadeUpVariant}>
            <nav className="flex items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
              <Link className="transition-colors hover:text-obsidian" href="/">
                Home
              </Link>
              <span>/</span>
              <span className="text-obsidian">Account</span>
            </nav>
            <div className="space-y-3">
              <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
                Welcome back
              </p>
              <h1 className="font-cormorant text-h1 text-obsidian lg:text-display-lg">
                {user.firstName}, your wardrobe world
              </h1>
              <p className="max-w-2xl font-dm-sans text-body text-text-secondary">
                Review your profile, delivery book, recent orders, and the pieces
                you keep returning to.
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUpVariant}>
            <AccountQuickLinks cartCount={totalItems} wishlistCount={wishlistCount} />
          </motion.div>

          <motion.div variants={fadeUpVariant}>
            <ProfileSummary user={user} />
          </motion.div>

          <motion.div className="grid gap-6 xl:grid-cols-2" variants={fadeUpVariant}>
            <AccountProfileEditor user={user} />
            <AccountSecurityPanel />
          </motion.div>

          <motion.div variants={fadeUpVariant}>
            <AddressBook addresses={user.addresses} />
          </motion.div>

          <motion.div variants={fadeUpVariant}>
            {isLoadingOrders ? <LoadingSpinner size="md" /> : <RecentOrders orders={orders} />}
          </motion.div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}
