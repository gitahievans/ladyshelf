import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

import CartDrawer from "@/components/layout/CartDrawer";
import Navbar from "@/components/layout/Navbar";

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
  title: "Wahi Fashion",
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
        <Navbar />
        <CartDrawer />
        <main className="min-h-screen pt-[60px] lg:pt-[var(--navbar-height)]">
          {children}
        </main>
      </body>
    </html>
  );
}
