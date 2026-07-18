"use client";

import type { FormEvent, ReactElement } from "react";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAdminStaff,
  fetchAdminStaff,
  updateAdminStaff,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";
import type {
  AdminRole,
  AdminStaffInput,
  AdminStaffRecord,
} from "@/lib/types";

const roleOptions: Array<{ label: string; value: AdminRole }> = [
  { label: "Owner", value: "owner" },
  { label: "Attendant", value: "attendant" },
];

function formatRole(role: AdminRole): string {
  return role === "owner" ? "Owner" : "Attendant";
}

function buildName(record: AdminStaffRecord): string {
  const name = `${record.firstName} ${record.lastName}`.trim();

  return name || record.email;
}

export default function AdminStaffManager(): ReactElement {
  const [records, setRecords] = useState<AdminStaffRecord[]>([]);
  const [email, setEmail] = useState("");
  const [supabaseUserId, setSupabaseUserId] = useState("");
  const [role, setRole] = useState<AdminRole>("attendant");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadStaff(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const staffRecords = await fetchAdminStaff();
      setRecords(staffRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load staff access records.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect((): void => {
    void loadStaff();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const input: AdminStaffInput = {
      email: email.trim() || undefined,
      supabaseUserId: supabaseUserId.trim() || undefined,
      role,
      isActive,
    };

    setIsSubmitting(true);

    try {
      const createdRecord = await createAdminStaff(input);
      setRecords((currentRecords) => [...currentRecords, createdRecord]);
      setEmail("");
      setSupabaseUserId("");
      setRole("attendant");
      setIsActive(true);
      setMessage("Staff access created.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create staff access.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate({
    id,
    nextIsActive,
    nextRole,
  }: {
    id: string;
    nextIsActive: boolean;
    nextRole: AdminRole;
  }): Promise<void> {
    setUpdatingId(id);
    setError(null);
    setMessage(null);

    try {
      const updatedRecord = await updateAdminStaff({
        id,
        input: { role: nextRole, isActive: nextIsActive },
      });
      setRecords((currentRecords) =>
        currentRecords.map((record) =>
          record.id === id ? updatedRecord : record,
        ),
      );
      setMessage("Staff access updated.");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update staff access.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
        <h2 className="mt-2 font-cormorant text-h2 text-obsidian">
          Staff management
        </h2>
        <p className="mt-3 max-w-3xl font-dm-sans text-body-sm text-text-secondary">
          Link existing Supabase-backed customer profiles to dashboard roles.
          Deactivated staff lose access on the next admin request.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-error bg-ivory p-4 font-dm-sans text-body-sm text-error">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="flex items-center gap-3 rounded-lg border border-success bg-ivory p-4 font-dm-sans text-body-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-border-warm bg-ivory p-5 shadow-card lg:grid-cols-5"
      >
        <div className="lg:col-span-2">
          <Label
            htmlFor="staff-email"
            className="font-dm-sans text-label uppercase tracking-widest text-text-secondary"
          >
            Email
          </Label>
          <Input
            id="staff-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="staff@ladyshelf.site"
            className="mt-2 h-11 rounded-sm border-border-warm bg-cream px-4 font-dm-sans text-body-sm text-obsidian focus-visible:border-gold"
          />
        </div>
        <div className="lg:col-span-2">
          <Label
            htmlFor="staff-supabase-id"
            className="font-dm-sans text-label uppercase tracking-widest text-text-secondary"
          >
            Supabase User ID
          </Label>
          <Input
            id="staff-supabase-id"
            value={supabaseUserId}
            onChange={(event) => setSupabaseUserId(event.target.value)}
            placeholder="Optional if email is known"
            className="mt-2 h-11 rounded-sm border-border-warm bg-cream px-4 font-dm-sans text-body-sm text-obsidian focus-visible:border-gold"
          />
        </div>
        <div>
          <Label
            htmlFor="staff-role"
            className="font-dm-sans text-label uppercase tracking-widest text-text-secondary"
          >
            Role
          </Label>
          <select
            id="staff-role"
            value={role}
            onChange={(event) => setRole(event.target.value as AdminRole)}
            className="mt-2 h-11 w-full rounded-sm border border-border-warm bg-cream px-4 font-dm-sans text-body-sm text-obsidian outline-none focus:border-gold"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-3 font-dm-sans text-body-sm text-text-secondary lg:col-span-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Active staff access
        </label>
        <div className="lg:col-span-3 lg:flex lg:justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-sm bg-gold px-6 font-dm-sans text-body-sm font-medium uppercase tracking-widest text-obsidian hover:bg-sand lg:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Add Staff Access
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-border-warm bg-ivory shadow-card">
        <div className="border-b border-border-warm bg-cream px-5 py-4">
          <h3 className="font-cormorant text-h4 text-obsidian">
            Current dashboard staff
          </h3>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-3 px-5 py-8 font-dm-sans text-body-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading staff access...
          </div>
        ) : records.length === 0 ? (
          <div className="px-5 py-8 font-dm-sans text-body text-text-secondary">
            No staff access records exist yet.
          </div>
        ) : (
          <div className="divide-y divide-border-warm">
            {records.map((record) => (
              <div
                key={record.id}
                className="grid gap-4 px-5 py-5 lg:grid-cols-12 lg:items-center"
              >
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-obsidian text-ivory">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-dm-sans text-body-sm font-medium text-obsidian">
                        {buildName(record)}
                      </p>
                      <p className="font-dm-sans text-caption text-text-muted">
                        {record.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 font-dm-sans text-caption uppercase tracking-wider",
                      record.isActive
                        ? "bg-success text-ivory"
                        : "bg-border-warm text-text-secondary",
                    )}
                  >
                    {record.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="lg:col-span-2">
                  <select
                    value={record.role}
                    disabled={updatingId === record.id}
                    onChange={(event) =>
                      void handleUpdate({
                        id: record.id,
                        nextRole: event.target.value as AdminRole,
                        nextIsActive: record.isActive,
                      })
                    }
                    className="h-10 w-full rounded-sm border border-border-warm bg-cream px-3 font-dm-sans text-body-sm text-obsidian outline-none focus:border-gold"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <Button
                    type="button"
                    disabled={updatingId === record.id}
                    onClick={() =>
                      void handleUpdate({
                        id: record.id,
                        nextRole: record.role,
                        nextIsActive: !record.isActive,
                      })
                    }
                    variant="outline"
                    className="h-10 w-full rounded-sm border-gold bg-transparent font-dm-sans text-body-sm font-medium uppercase tracking-widest text-gold hover:bg-gold hover:text-obsidian"
                  >
                    {record.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
                <div className="font-dm-sans text-caption text-text-muted lg:col-span-2">
                  ID: {record.supabaseUserId}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
