import type { ReactElement } from "react";

import SectionHeader from "@/components/shared/SectionHeader";
import { formatDate } from "@/lib/utils/format";
import type { User } from "@/lib/types";

interface ProfileSummaryProps {
  user: User;
}

export default function ProfileSummary({
  user,
}: ProfileSummaryProps): ReactElement {
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <section className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
      <SectionHeader
        label="Your Profile"
        subtitle="A snapshot of the woman behind the wardrobe."
        title={fullName}
      />
      <dl className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <dt className="font-dm-sans text-label uppercase tracking-[0.16em] text-text-muted">
            Email
          </dt>
          <dd className="font-dm-sans text-body text-obsidian">{user.email}</dd>
        </div>
        <div className="space-y-1">
          <dt className="font-dm-sans text-label uppercase tracking-[0.16em] text-text-muted">
            Phone
          </dt>
          <dd className="font-dm-sans text-body text-obsidian">
            {user.phone ?? "Add a phone number at checkout"}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="font-dm-sans text-label uppercase tracking-[0.16em] text-text-muted">
            Member Since
          </dt>
          <dd className="font-dm-sans text-body text-obsidian">
            {formatDate(user.createdAt)}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="font-dm-sans text-label uppercase tracking-[0.16em] text-text-muted">
            Delivery Preference
          </dt>
          <dd className="font-dm-sans text-body text-obsidian">
            {user.addresses.find((address) => address.isDefault)?.town ?? "Not set"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
