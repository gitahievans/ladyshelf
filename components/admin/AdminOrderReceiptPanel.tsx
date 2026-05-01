import type { ReactElement } from "react";
import { Loader2, Send } from "lucide-react";

import AdminDetailRow from "@/components/admin/AdminDetailRow";
import AdminStatus from "@/components/admin/AdminStatus";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/utils/format";
import type { Receipt } from "@/lib/types";

interface AdminOrderReceiptPanelProps {
  isResendingReceipt: boolean;
  onResendReceipt: () => void;
  receipt?: Receipt | null;
}

export default function AdminOrderReceiptPanel({
  isResendingReceipt,
  onResendReceipt,
  receipt,
}: AdminOrderReceiptPanelProps): ReactElement {
  return (
    <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-cormorant text-h4 text-obsidian">Receipt</h3>
          <p className="mt-1 font-dm-sans text-body-sm text-text-secondary">
            Official receipts are issued only after payment confirmation.
          </p>
        </div>
        {receipt ? (
          <AdminStatus
            value={receipt.status}
            tone={receipt.status === "sent" ? "success" : receipt.status === "failed" ? "error" : "warning"}
          />
        ) : null}
      </div>
      {receipt ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <AdminDetailRow label="Receipt Number" value={receipt.receiptNumber} />
          <AdminDetailRow label="Total Paid" value={formatPrice(receipt.totalPaid, receipt.currency)} />
          <AdminDetailRow label="Sent To" value={receipt.sentToEmail} />
          <AdminDetailRow label="Sent At" value={receipt.sentAt ? formatDate(receipt.sentAt) : "Not sent yet"} />
          <AdminDetailRow label="Payment Reference" value={receipt.paymentReference} />
        </div>
      ) : (
        <p className="mt-3 font-dm-sans text-body text-text-secondary">No receipt has been issued yet.</p>
      )}
      <Button
        type="button"
        disabled={!receipt || isResendingReceipt}
        onClick={onResendReceipt}
        className="mt-4 h-11 w-full rounded-sm border border-border-warm bg-cream font-dm-sans text-body-sm font-medium uppercase tracking-widest text-obsidian hover:bg-sand"
      >
        {isResendingReceipt ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        Resend Receipt
      </Button>
    </div>
  );
}
