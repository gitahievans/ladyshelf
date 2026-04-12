"use client";

import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { brandMedia } from "@/lib/mock/media";

interface AuthShellProps {
  heading: string;
  subheading: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthShell({
  heading,
  subheading,
  children,
  footer,
}: AuthShellProps): ReactElement {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="flex min-h-screen items-center justify-center bg-cream px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-auth-card rounded-lg bg-ivory p-8 shadow-card sm:p-10"
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
      >
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Image
                alt="Wahi Fashion logo"
                className="h-14 w-auto object-contain"
                height={80}
                priority
                src={brandMedia.logo}
                width={220}
              />
            </div>
            <div className="space-y-2">
              <h1 className="font-cormorant text-h2 text-obsidian sm:text-h1">
                {heading}
              </h1>
              <p className="font-dm-sans text-body-sm text-text-muted">
                {subheading}
              </p>
            </div>
          </div>

          {children}

          <div className="border-t border-border-warm pt-6 text-center">{footer}</div>
        </div>
      </motion.div>
    </section>
  );
}
