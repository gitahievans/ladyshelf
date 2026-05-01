import type { ReactElement } from "react";
import { Loader2, ReceiptText, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AdminManualPaymentPanelProps {
  amountCollected: string;
  isMarkingPaid: boolean;
  onAmountCollectedChange: (value: string) => void;
  onConfirmPayment: () => void;
  onPaymentReferenceChange: (value: string) => void;
  onStaffNoteChange: (value: string) => void;
  paymentReference: string;
  staffNote: string;
}

export default function AdminManualPaymentPanel({
  amountCollected,
  isMarkingPaid,
  onAmountCollectedChange,
  onConfirmPayment,
  onPaymentReferenceChange,
  onStaffNoteChange,
  paymentReference,
  staffNote,
}: AdminManualPaymentPanelProps): ReactElement {
  return (
    <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-gold">
          <Wallet className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-cormorant text-h4 text-obsidian">Mark as paid</h3>
          <p className="mt-1 font-dm-sans text-body-sm text-text-secondary">
            Use this after the customer has paid the attendant or rider.
          </p>
        </div>
      </div>
      <label className="mt-4 block font-dm-sans text-label uppercase tracking-widest text-text-secondary">Amount collected</label>
      <input
        className="mt-2 h-11 w-full rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm outline-none focus:border-gold"
        inputMode="numeric"
        min="1"
        type="number"
        value={amountCollected}
        onChange={(event) => onAmountCollectedChange(event.target.value)}
      />
      <label className="mt-4 block font-dm-sans text-label uppercase tracking-widest text-text-secondary">M-Pesa reference</label>
      <input
        className="mt-2 h-11 w-full rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm outline-none focus:border-gold"
        value={paymentReference}
        onChange={(event) => onPaymentReferenceChange(event.target.value)}
      />
      <label className="mt-4 block font-dm-sans text-label uppercase tracking-widest text-text-secondary">Staff note</label>
      <textarea
        className="mt-2 min-h-24 w-full rounded-sm border border-border-warm bg-cream px-3 py-3 font-dm-sans text-body-sm outline-none focus:border-gold"
        value={staffNote}
        onChange={(event) => onStaffNoteChange(event.target.value)}
      />
      <Button
        type="button"
        disabled={isMarkingPaid}
        onClick={onConfirmPayment}
        className="mt-4 h-11 w-full rounded-sm bg-gold font-dm-sans text-body-sm font-medium uppercase tracking-widest text-obsidian hover:bg-sand"
      >
        {isMarkingPaid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ReceiptText className="mr-2 h-4 w-4" />}
        Confirm Payment
      </Button>
    </div>
  );
}
