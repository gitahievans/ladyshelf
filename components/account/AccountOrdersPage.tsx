"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

import Footer from "@/components/layout/Footer";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import RecentOrders from "@/components/account/RecentOrders";
import { fetchAccountOrders } from "@/lib/api/orders";
import type { Order } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";

export default function AccountOrdersPage(): ReactElement {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);

  useEffect((): (() => void) | void => {
    if (!isInitialized || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    void (async (): Promise<void> => {
      try {
        setIsLoadingOrders(true);
        const nextOrders = await fetchAccountOrders();

        if (!isMounted) {
          return;
        }

        setOrders(nextOrders);
      } catch {
        if (!isMounted) {
          return;
        }

        setOrders([]);
      } finally {
        if (!isMounted) {
          return;
        }

        setIsLoadingOrders(false);
      }
    })();

    return (): void => {
      isMounted = false;
    };
  }, [isAuthenticated, isInitialized]);

  if (!isInitialized) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-ivory px-6">
        <LoadingSpinner size="lg" />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <section className="bg-ivory px-6 py-12 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-container">
            <EmptyState
              ctaHref="/auth/login"
              ctaLabel="Sign In"
              description="Sign in to track orders, retry pending payments, and open order details quickly."
              title="Your order desk is in your account"
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
        <div className="mx-auto max-w-container space-y-8">
          <div className="space-y-4">
            <nav className="flex items-center gap-2 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
              <Link className="transition-colors hover:text-obsidian" href="/">
                Home
              </Link>
              <span>/</span>
              <Link className="transition-colors hover:text-obsidian" href="/account">
                Account
              </Link>
              <span>/</span>
              <span className="text-obsidian">Orders</span>
            </nav>
            <div className="space-y-3">
              <p className="font-dm-sans text-label uppercase tracking-[0.18em] text-gold">
                Order Desk
              </p>
              <h1 className="font-cormorant text-h1 text-obsidian lg:text-display-lg">
                Your Orders
              </h1>
              <p className="max-w-2xl font-dm-sans text-body text-text-secondary">
                Open any order to review items, retry payment, or manage changes while the order is still eligible.
              </p>
            </div>
          </div>

          {isLoadingOrders ? <LoadingSpinner size="md" /> : <RecentOrders orders={orders} />}
        </div>
      </section>
      <Footer />
    </>
  );
}
