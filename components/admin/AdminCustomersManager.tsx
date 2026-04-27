"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAdminCustomers } from "@/lib/api/admin";
import { formatDate } from "@/lib/utils/format";
import type { AdminCustomerListItem } from "@/lib/types";

export default function AdminCustomersManager(): ReactElement {
  const [customers, setCustomers] = useState<AdminCustomerListItem[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCustomers(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      setCustomers(await fetchAdminCustomers({ q: query }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load customers.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect((): void => {
    void loadCustomers();
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
        <h2 className="mt-2 font-cormorant text-h2 text-obsidian">Customer lookup</h2>
        <p className="mt-3 max-w-3xl font-dm-sans text-body-sm text-text-secondary">
          Search customers by email, name, or phone and open support context quickly.
        </p>
      </div>
      <div className="flex gap-3 rounded-lg border border-border-warm bg-ivory p-4 shadow-card">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search email, name, or phone" className="h-11 rounded-sm border-border-warm bg-cream px-4 font-dm-sans text-body-sm" />
        <Button type="button" onClick={() => void loadCustomers()} className="h-11 rounded-sm bg-gold px-4 text-obsidian hover:bg-sand"><Search className="mr-2 h-4 w-4" />Search</Button>
      </div>
      {error ? <div className="rounded-lg border border-error bg-ivory p-4 font-dm-sans text-body-sm text-error">{error}</div> : null}
      <div className="overflow-hidden rounded-lg border border-border-warm bg-ivory shadow-card">
        {isLoading ? (
          <div className="flex items-center gap-3 p-6 font-dm-sans text-body text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" />Loading customers...</div>
        ) : customers.length === 0 ? (
          <p className="p-6 font-dm-sans text-body text-text-secondary">No customers match this search.</p>
        ) : (
          <div>
            <div className="hidden grid-cols-5 gap-3 border-b border-border-warm bg-cream px-5 py-3 font-dm-sans text-caption uppercase tracking-widest text-text-muted md:grid">
              <span className="col-span-2">Customer</span>
              <span>Phone</span>
              <span>Orders</span>
              <span className="text-right">Joined</span>
            </div>
            <div className="divide-y divide-border-warm">
            {customers.map((customer) => (
              <Link key={customer.id} href={`/admin/customers/${customer.id}`} className="grid gap-3 p-5 transition-colors hover:bg-cream md:grid-cols-5 md:items-center">
                <div className="md:col-span-2">
                  <p className="font-dm-sans text-body-sm font-semibold text-obsidian">{`${customer.firstName} ${customer.lastName}`.trim() || customer.email}</p>
                  <p className="font-dm-sans text-caption text-text-muted">{customer.email}</p>
                </div>
                <p className="font-dm-sans text-body-sm text-text-secondary">{customer.phone || "No phone"}</p>
                <p className="font-dm-sans text-body-sm text-text-secondary">{customer.orderCount} orders</p>
                <p className="font-dm-sans text-body-sm text-text-secondary md:text-right">{formatDate(customer.createdAt)}</p>
              </Link>
            ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
