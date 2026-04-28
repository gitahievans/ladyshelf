import type { ReactElement } from "react";

import EditorialPageLayout from "@/components/shared/EditorialPageLayout";

const sections = [
  {
    title: "Visit the Studio",
    body: [
      "Wahi Fashion welcomes clients to our Roysambu studio for fittings, styling conversations, and collection previews. We are at Lumumba Drive, Roysambu, Nairobi.",
      "Studio hours are Monday to Saturday from 9am to 7pm, and Sunday from 11am to 5pm.",
    ],
  },
  {
    title: "Call or Message",
    body: [
      "For delivery updates, product questions, or custom sizing guidance, reach us on +254 700 000 000 or send a WhatsApp message during studio hours.",
      "If you are following up on an order, include your order number so our team can assist you faster.",
    ],
  },
  {
    title: "Email Support",
    body: [
      "For collaborations, media, or detailed customer support, email hello@wahifashion.africa.",
      "We aim to respond within one business day, and sooner for active order issues.",
    ],
  },
] as const;

export default function ContactPage(): ReactElement {
  return (
    <EditorialPageLayout
      ctaBody="Browse the latest collection if you already know the piece you want, and we will help with the rest."
      ctaHref="/shop"
      ctaLabel="Shop the Collection"
      ctaTitle="Ready to choose your next look?"
      eyebrow="Speak with Wahi"
      introduction="Whether you need help with an order, delivery guidance, or a styling question, our team is here to make the experience feel personal and easy."
      sections={[...sections]}
      title="Contact"
    />
  );
}
