"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import AdminStatus from "@/components/admin/AdminStatus";
import { fetchAdminCustomerDetail } from "@/lib/api/admin";
import { formatDate, formatPrice } from "@/lib/utils/format";
import type { AdminCustomerDetail as AdminCustomerDetailType } from "@/lib/types";

interface AdminCustomerDetailProps {
  id: string;
}

export default function AdminCustomerDetail({ id }: AdminCustomerDetailProps): ReactElement {
  const [customer, setCustomer] = useState<AdminCustomerDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    async function loadCustomer(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        setCustomer(await fetchAdminCustomerDetail(id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load customer.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCustomer();
  }, [id]);

  if (isLoading) {
    return <div className="flex items-center gap-3 rounded-lg border border-border-warm bg-ivory p-6 font-dm-sans text-body text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" />Loading customer...</div>;
  }

  if (!customer) {
    return <div className="rounded-lg border border-error bg-ivory p-6 font-dm-sans text-body text-error">{error ?? "Customer not found."}</div>;
  }

  return (
    <section className="space-y-6">
      <Link href="/admin/customers" className="font-dm-sans text-body-sm text-gold hover:text-bark">Back to customers</Link>
      <div className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
        <p className="font-dm-sans text-label uppercase tracking-widest text-gold">Customer Detail</p>
        <h2 className="mt-2 font-cormorant text-h2 text-obsidian">{`${customer.firstName} ${customer.lastName}`.trim() || customer.email}</h2>
        <p className="font-dm-sans text-body text-text-secondary">{customer.email} · {customer.phone || "No phone"}</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
            <h3 className="font-cormorant text-h4 text-obsidian">Recent orders</h3>
            {customer.recentOrders.length === 0 ? (
              <p className="mt-3 font-dm-sans text-body text-text-secondary">No orders yet.</p>
            ) : (
              <div className="mt-4 divide-y divide-border-warm">
                {customer.recentOrders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.orderNumber}`} className="grid gap-2 py-4 md:grid-cols-4 md:items-center">
                    <div>
                      <p className="font-dm-sans text-body-sm font-medium text-obsidian">{order.orderNumber}</p>
                      <p className="font-dm-sans text-caption text-text-muted">{formatDate(order.createdAt)}</p>
                    </div>
                    <AdminStatus value={order.orderStatus} />
                    <p className="font-dm-sans text-body-sm text-text-secondary">{order.deliveryMode}</p>
                    <p className="font-dm-sans text-body-sm font-semibold text-obsidian md:text-right">{formatPrice(order.total, order.currency)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
            <h3 className="font-cormorant text-h4 text-obsidian">Wishlist</h3>
            {customer.wishlist.length === 0 ? (
              <p className="mt-3 font-dm-sans text-body text-text-secondary">No saved pieces.</p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {customer.wishlist.map((product) => (
                  <Link key={product.id} href={`/shop/${product.slug}`} className="rounded-sm border border-border-warm bg-cream p-3 font-dm-sans text-body-sm text-obsidian hover:border-gold">{product.name}</Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
            <h3 className="font-cormorant text-h4 text-obsidian">Profile</h3>
            <dl className="mt-4 space-y-3 font-dm-sans text-body-sm">
              <div><dt className="text-text-muted">Supabase ID</dt><dd className="break-all text-obsidian">{customer.supabaseUserId}</dd></div>
              <div><dt className="text-text-muted">Joined</dt><dd className="text-obsidian">{formatDate(customer.createdAt)}</dd></div>
              <div><dt className="text-text-muted">Email confirmed</dt><dd className="text-obsidian">{customer.emailConfirmedAt ? formatDate(customer.emailConfirmedAt) : "Not confirmed"}</dd></div>
            </dl>
          </div>
          <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
            <h3 className="font-cormorant text-h4 text-obsidian">Addresses</h3>
            {customer.addresses.length === 0 ? (
              <p className="mt-3 font-dm-sans text-body text-text-secondary">No saved addresses.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="rounded-sm bg-cream p-3 font-dm-sans text-body-sm text-text-secondary">
                    <p className="font-medium text-obsidian">{address.fullName}</p>
                    <p>{address.phone}</p>
                    <p>{address.streetAddress}, {address.town}, {address.county}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
