import type { ReactElement } from "react";

import type { Address } from "@/lib/types";

interface AddressBookProps {
  addresses: Address[];
}

export default function AddressBook({
  addresses,
}: AddressBookProps): ReactElement {
  return (
    <section className="rounded-lg border border-border-warm bg-ivory p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-gold">
            Delivery Book
          </p>
          <h2 className="font-cormorant text-h3 text-obsidian">Saved Addresses</h2>
        </div>
        <p className="font-dm-sans text-body-sm text-text-secondary">
          {addresses.length} saved
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <article
            className="rounded-md border border-border-warm bg-cream p-4"
            key={address.id}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-dm-sans text-body font-medium text-obsidian">
                {address.fullName}
              </h3>
              <span className="font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
                {address.label}
                {address.isDefault ? " • Default" : ""}
              </span>
            </div>
            <p className="mt-3 font-dm-sans text-body-sm text-text-secondary">
              {address.streetAddress}
            </p>
            <p className="font-dm-sans text-body-sm text-text-secondary">
              {address.town}, {address.county}
            </p>
            {address.additionalInfo ? (
              <p className="mt-2 font-dm-sans text-body-sm text-text-muted">
                {address.additionalInfo}
              </p>
            ) : null}
            <p className="mt-3 font-dm-sans text-body-sm text-obsidian">
              {address.phone}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
