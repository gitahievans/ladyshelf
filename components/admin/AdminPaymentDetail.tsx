"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import AdminStatus from "@/components/admin/AdminStatus";
import { fetchAdminPaymentDetail } from "@/lib/api/admin";
import { formatDate, formatPrice } from "@/lib/utils/format";
import type { AdminPaymentDetail as AdminPaymentDetailType } from "@/lib/types";

interface AdminPaymentDetailProps {
  id: string;
}

export default function AdminPaymentDetail({ id }: AdminPaymentDetailProps): ReactElement {
  const [payment, setPayment] = useState<AdminPaymentDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    async function loadPayment(): Promise<void> {
      setIsLoading(true);
      setError(null);
      try {
        setPayment(await fetchAdminPaymentDetail(id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load payment.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPayment();
  }, [id]);

  if (isLoading) {
    return <div className="flex items-center gap-3 rounded-lg border border-border-warm bg-ivory p-6 font-dm-sans text-body text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" />Loading payment...</div>;
  }

  if (!payment) {
    return <div className="rounded-lg border border-error bg-ivory p-6 font-dm-sans text-body text-error">{error ?? "Payment not found."}</div>;
  }

  return (
    <section className="space-y-6">
      <Link href="/admin/payments" className="font-dm-sans text-body-sm text-gold hover:text-bark">Back to payments</Link>
      <div className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
        <p className="font-dm-sans text-label uppercase tracking-widest text-gold">Payment Detail</p>
        <h2 className="mt-2 font-cormorant text-h2 text-obsidian">{payment.orderNumber}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <AdminStatus value={payment.status} tone={payment.status === "paid" ? "success" : payment.status === "failed" ? "error" : "warning"} />
          <p className="font-dm-sans text-body text-text-secondary">{formatPrice(payment.amount, payment.currency)}</p>
          <p className="font-dm-sans text-body text-text-secondary">{formatDate(payment.createdAt)}</p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
          <h3 className="font-cormorant text-h4 text-obsidian">Transaction fields</h3>
          <dl className="mt-4 space-y-3 font-dm-sans text-body-sm">
            <div><dt className="text-text-muted">Merchant reference</dt><dd className="text-obsidian">{payment.merchantReference || "None"}</dd></div>
            <div><dt className="text-text-muted">Merchant request ID</dt><dd className="text-obsidian">{payment.merchantRequestId || "None"}</dd></div>
            <div><dt className="text-text-muted">Checkout request ID</dt><dd className="text-obsidian">{payment.checkoutRequestId || "None"}</dd></div>
            <div><dt className="text-text-muted">Transaction code</dt><dd className="text-obsidian">{payment.transactionCode || "None"}</dd></div>
            <div><dt className="text-text-muted">Last synced</dt><dd className="text-obsidian">{payment.lastSyncedAt ? formatDate(payment.lastSyncedAt) : "Not synced"}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
          <h3 className="font-cormorant text-h4 text-obsidian">Provider payload</h3>
          <pre className="mt-4 max-h-96 overflow-auto rounded-sm bg-cream p-3 font-dm-sans text-caption text-text-secondary">{JSON.stringify({ providerResponse: payment.providerResponse, callbackPayload: payment.callbackPayload, lastStatusPayload: payment.lastStatusPayload }, null, 2)}</pre>
        </div>
      </div>
    </section>
  );
}
