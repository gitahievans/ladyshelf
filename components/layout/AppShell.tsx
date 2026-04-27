"use client";

import type { ReactElement, ReactNode } from "react";
import { usePathname } from "next/navigation";

import CartDrawer from "@/components/layout/CartDrawer";
import Navbar from "@/components/layout/Navbar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps): ReactElement {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAuthRoute || isAdminRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen pt-[60px] lg:pt-[var(--navbar-height)]">
        {children}
      </main>
    </>
  );
}
