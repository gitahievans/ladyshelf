"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";

import AddressForm from "@/components/account/AddressForm";
import { Button } from "@/components/ui/button";
import { createAccountAddress, deleteAccountAddress, updateAccountAddress } from "@/lib/api/addresses";
import type { Address, AddressInput } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";

interface AddressBookProps {
  addresses: Address[];
}

export default function AddressBook({ addresses }: AddressBookProps): ReactElement {
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const editingAddress = addresses.find((address) => address.id === editingAddressId) ?? null;

  async function handleCreate(input: AddressInput): Promise<void> {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await createAccountAddress(input);
      await refreshUser();
      setIsCreating(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We couldn't save that address.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(addressId: string, input: AddressInput): Promise<void> {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await updateAccountAddress(addressId, input);
      await refreshUser();
      setEditingAddressId(null);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We couldn't update that address.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(addressId: string): Promise<void> {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await deleteAccountAddress(addressId);
      await refreshUser();
      if (editingAddressId === addressId) {
        setEditingAddressId(null);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We couldn't remove that address.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetDefault(address: Address): Promise<void> {
    await handleUpdate(address.id, {
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      county: address.county,
      town: address.town,
      streetAddress: address.streetAddress,
      additionalInfo: address.additionalInfo,
      isDefault: true,
    });
  }

  return (
    <section className="rounded-lg border border-border-warm bg-ivory p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-dm-sans text-label uppercase tracking-[0.16em] text-gold">
            Delivery Book
          </p>
          <h2 className="font-cormorant text-h3 text-obsidian">Saved Addresses</h2>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-dm-sans text-body-sm text-text-secondary">{addresses.length} saved</p>
          <Button
            className="h-10 rounded-lg bg-gold px-4 font-dm-sans text-body-sm font-medium text-obsidian hover:bg-sand"
            disabled={isSubmitting}
            onClick={(): void => {
              setIsCreating(true);
              setEditingAddressId(null);
              setSubmitError("");
            }}
            type="button"
          >
            <Plus className="mr-2 size-4" />
            Add Address
          </Button>
        </div>
      </div>

      {isCreating ? (
        <div className="mt-6">
          <AddressForm
            isSubmitting={isSubmitting}
            onCancel={(): void => {
              setIsCreating(false);
              setSubmitError("");
            }}
            onSubmit={(value): void => {
              void handleCreate(value);
            }}
            submitError={submitError}
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {addresses.length === 0 ? (
          <div className="rounded-md border border-dashed border-border-warm bg-cream p-6 md:col-span-2">
            <p className="font-dm-sans text-body text-obsidian">You have not saved a delivery address yet.</p>
            <p className="mt-2 font-dm-sans text-body-sm text-text-secondary">
              Add one here, or save one during checkout so your next order feels faster.
            </p>
          </div>
        ) : null}

        {addresses.map((address) => (
          <article className="rounded-md border border-border-warm bg-cream p-4" key={address.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-dm-sans text-body font-medium text-obsidian">{address.fullName}</h3>
                <p className="mt-1 font-dm-sans text-caption uppercase tracking-[0.16em] text-text-muted">
                  {address.label}
                  {address.isDefault ? " • Default" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!address.isDefault ? (
                  <button
                    aria-label="Set as default address"
                    className="rounded-full border border-border-warm p-2 text-text-muted transition-colors hover:border-gold hover:text-gold"
                    disabled={isSubmitting}
                    onClick={(): void => {
                      void handleSetDefault(address);
                    }}
                    type="button"
                  >
                    <Star className="size-4" />
                  </button>
                ) : null}
                <button
                  aria-label="Edit address"
                  className="rounded-full border border-border-warm p-2 text-text-muted transition-colors hover:border-gold hover:text-obsidian"
                  disabled={isSubmitting}
                  onClick={(): void => {
                    setEditingAddressId(address.id);
                    setIsCreating(false);
                    setSubmitError("");
                  }}
                  type="button"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  aria-label="Delete address"
                  className="rounded-full border border-border-warm p-2 text-text-muted transition-colors hover:border-error hover:text-error"
                  disabled={isSubmitting}
                  onClick={(): void => {
                    void handleDelete(address.id);
                  }}
                  type="button"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <p className="mt-3 font-dm-sans text-body-sm text-text-secondary">{address.streetAddress}</p>
            <p className="font-dm-sans text-body-sm text-text-secondary">{address.town}, {address.county}</p>
            {address.additionalInfo ? (
              <p className="mt-2 font-dm-sans text-body-sm text-text-muted">{address.additionalInfo}</p>
            ) : null}
            <p className="mt-3 font-dm-sans text-body-sm text-obsidian">{address.phone}</p>

            {editingAddressId === address.id ? (
              <div className="mt-5">
                <AddressForm
                  initialValue={editingAddress}
                  isSubmitting={isSubmitting}
                  onCancel={(): void => {
                    setEditingAddressId(null);
                    setSubmitError("");
                  }}
                  onSubmit={(value): void => {
                    void handleUpdate(address.id, value);
                  }}
                  submitError={submitError}
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
