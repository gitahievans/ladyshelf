import type { ReactElement } from "react";

import EditorialPageLayout from "@/components/shared/EditorialPageLayout";

const sections = [
  {
    title: "Where We Deliver",
    body: [
      "Lady Shelf serves customers across Nairobi and beyond through a mix of rider delivery, parcel dispatch, and pickup options depending on location.",
      "Your available delivery method is determined during checkout after you confirm your address details.",
    ],
  },
  {
    title: "Delivery Timelines",
    body: [
      "For rider-served zones, delivery is usually fulfilled within the estimated window shown at checkout. Parcel deliveries may take longer depending on destination.",
      "Orders that require manual delivery confirmation will be reviewed before final dispatch costs are shared.",
    ],
  },
  {
    title: "Fees and Confirmation",
    body: [
      "Delivery fees are calculated from your location and order context, rather than using a flat blanket charge.",
      "Please make sure your phone number and location details are accurate so our team or delivery partners can reach you without delays.",
    ],
  },
] as const;

export default function DeliveryInfoPage(): ReactElement {
  return (
    <EditorialPageLayout
      ctaBody="If you want to confirm how your order can be delivered before checkout, our team can guide you."
      ctaHref="/contact"
      ctaLabel="Talk to Support"
      ctaTitle="Questions about delivery?"
      eyebrow="Shipping with Care"
      introduction="Every Lady Shelf order is handled with attention, and delivery options are shaped around your location so the experience stays reliable."
      sections={[...sections]}
      title="Delivery Information"
    />
  );
}
