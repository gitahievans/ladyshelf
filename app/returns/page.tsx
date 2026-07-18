import type { ReactElement } from "react";

import EditorialPageLayout from "@/components/shared/EditorialPageLayout";

const sections = [
  {
    title: "Return Window",
    body: [
      "Eligible pieces may be returned within 7 days of delivery, provided they are unworn, unwashed, and returned with original tags and packaging intact.",
      "For hygiene and quality reasons, earrings, intimate items, and any clearly marked final-sale pieces are not returnable.",
    ],
  },
  {
    title: "Condition Requirements",
    body: [
      "Returned items must be in resale-ready condition. If a piece shows signs of wear, fragrance, makeup transfer, or damage, the return may be declined and sent back to the customer.",
      "If your item arrived damaged or incorrect, contact us immediately so we can resolve it as a priority.",
    ],
  },
  {
    title: "How Returns Are Processed",
    body: [
      "Once your return is approved and received, we inspect it before confirming a refund, exchange, or store credit depending on the case.",
      "Approved refunds are issued to the original payment method where possible. Processing timelines may vary depending on your payment provider.",
    ],
  },
] as const;

export default function ReturnsPage(): ReactElement {
  return (
    <EditorialPageLayout
      ctaBody="If your order needs attention, contact us before sending the piece back so we can guide you on the best next step."
      ctaHref="/contact"
      ctaLabel="Contact Support"
      ctaTitle="Need help with a return?"
      eyebrow="Before You Send It Back"
      introduction="We want every Lady Shelf purchase to feel considered and confident. If something is not quite right, here is how we handle returns with care."
      sections={[...sections]}
      title="Returns Policy"
    />
  );
}
