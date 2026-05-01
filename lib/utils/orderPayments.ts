import type { Order } from "@/lib/types";

export function isOrderEligibleForSasaPayRetry(order: Order): boolean {
  return (
    order.paymentTiming === "prepay" &&
    order.paymentMethod === "mpesa" &&
    order.orderStatus === "awaiting_payment" &&
    order.paymentStatus !== "paid"
  );
}
