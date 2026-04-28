import type { ReactElement } from "react";

import EditorialPageLayout from "@/components/shared/EditorialPageLayout";

const sections = [
  {
    title: "Ordering and Payment",
    body: [
      "You can place your order directly through the website and complete payment using the supported checkout options shown at checkout.",
      "Delivery pricing is confirmed based on your location, and some delivery methods may limit which payment options are available.",
    ],
  },
  {
    title: "Delivery and Pickup",
    body: [
      "Within rider-served areas, delivery timelines are typically shared during checkout. For longer-distance deliveries, parcel arrangements may require manual confirmation.",
      "Pickup details are also confirmed at checkout whenever collection is available for your order.",
    ],
  },
  {
    title: "Product Availability",
    body: [
      "If a size or color is low in stock, the storefront will show limited availability. Cart quantity is also checked against stock before you can proceed.",
      "If a piece sells out before checkout is completed, we will let you know immediately so you can adjust your order.",
    ],
  },
] as const;

export default function FaqPage(): ReactElement {
  return (
    <EditorialPageLayout
      ctaBody="If your question is not covered here, our team can help with product, delivery, and order support."
      ctaHref="/contact"
      ctaLabel="Ask a Question"
      ctaTitle="Still need clarity?"
      eyebrow="Helpful Answers"
      introduction="A few of the questions customers ask most often, answered in a simple and practical way."
      sections={[...sections]}
      title="FAQ"
    />
  );
}
