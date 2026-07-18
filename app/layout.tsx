import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Suspense } from "react";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "react-international-phone/style.css";

import AuthSessionBridge from "@/components/auth/AuthSessionBridge";
import AppShell from "@/components/layout/AppShell";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lady Shelf",
  description: "Luxury women's fashion. More than fashion — a lifestyle.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>): ReactElement {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-ivory text-obsidian"
      >
        <Suspense fallback={null}>
          <AuthSessionBridge />
        </Suspense>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
