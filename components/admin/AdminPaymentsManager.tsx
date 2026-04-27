"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";

import AdminStatus from "@/components/admin/AdminStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAdminPayments } from "@/lib/api/admin";
import { formatDate, formatPrice } from "@/lib/utils/format";
import type { AdminPaymentListItem, PaymentTransactionStatus } from "@/lib/types";

const statusOptions: Array<{ label: string; value: PaymentTransactionStatus | "" }> = [
  { label: "All statuses", value: "" },
  { label: "Initiated", value: "initiated" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
];

export default function AdminPaymentsManager(): ReactElement {
  const [payments, setPayments] = useState<AdminPaymentListItem[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPayments(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      setPayments(await fetchAdminPayments({ q: query, status }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load payments.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect((): void => {
    void loadPayments();
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
        <h2 className="mt-2 font-cormorant text-h2 text-obsidian">Payment operations</h2>
        <p className="mt-3 max-w-3xl font-dm-sans text-body-sm text-text-secondary">
          Review SasaPay transaction state and trace payments back to their orders.
        </p>
      </div>
      <div className="grid gap-3 rounded-lg border border-border-warm bg-ivory p-4 shadow-card lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, reference, checkout, or transaction code" className="h-11 rounded-sm border-border-warm bg-cream px-4 font-dm-sans text-body-sm" />
        </div>
        <select className="h-11 rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
          {statusOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
        </select>
        <Button type="button" onClick={() => void loadPayments()} className="h-11 rounded-sm bg-gold px-4 text-obsidian hover:bg-sand"><Search className="mr-2 h-4 w-4" />Filter</Button>
      </div>
      {error ? <div className="rounded-lg border border-error bg-ivory p-4 font-dm-sans text-body-sm text-error">{error}</div> : null}
      <div className="overflow-hidden rounded-lg border border-border-warm bg-ivory shadow-card">
        {isLoading ? (
          <div className="flex items-center gap-3 p-6 font-dm-sans text-body text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" />Loading payments...</div>
        ) : payments.length === 0 ? (
          <p className="p-6 font-dm-sans text-body text-text-secondary">No payments match this view.</p>
        ) : (
          <div>
            <div className="hidden grid-cols-6 gap-3 border-b border-border-warm bg-cream px-5 py-3 font-dm-sans text-caption uppercase tracking-widest text-text-muted md:grid">
              <span className="col-span-2">Order / Reference</span>
              <span>Status</span>
              <span>Provider</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="divide-y divide-border-warm">
            {payments.map((payment) => (
              <Link key={payment.id} href={`/admin/payments/${payment.id}`} className="grid gap-3 p-5 transition-colors hover:bg-cream md:grid-cols-6 md:items-center">
                <div className="md:col-span-2">
                  <p className="font-dm-sans text-body-sm font-semibold text-obsidian">{payment.orderNumber}</p>
                  <p className="font-dm-sans text-caption text-text-muted">{payment.transactionCode || payment.merchantReference}</p>
                </div>
                <AdminStatus value={payment.status} tone={payment.status === "paid" ? "success" : payment.status === "failed" ? "error" : "warning"} />
                <p className="font-dm-sans text-body-sm text-text-secondary">{payment.provider}</p>
                <p className="font-dm-sans text-body-sm text-text-secondary">{formatDate(payment.createdAt)}</p>
                <p className="font-dm-sans text-body-sm font-semibold text-obsidian md:text-right">{formatPrice(payment.amount, payment.currency)}</p>
              </Link>
            ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
