import type { ReactElement } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminForbiddenState(): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-12">
      <div className="w-full max-w-auth-card rounded-lg border border-border-warm bg-ivory p-8 text-center shadow-card">
        <p className="font-dm-sans text-label uppercase text-gold">
          Access Restricted
        </p>
        <h1 className="mt-3 font-cormorant text-h1 text-obsidian">
          This space is for Wahi staff.
        </h1>
        <p className="mt-4 font-dm-sans text-body text-text-secondary">
          Your account is signed in, but it does not have an active admin role.
          Please contact an owner if you should have dashboard access.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="h-11 rounded-sm bg-gold px-6 font-dm-sans text-body-sm font-medium uppercase tracking-widest text-obsidian hover:bg-sand"
          >
            <Link href="/">Back to Storefront</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-sm border-gold bg-transparent px-6 font-dm-sans text-body-sm font-medium uppercase tracking-widest text-gold hover:bg-gold hover:text-obsidian"
          >
            <Link href="/account">Open My Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
