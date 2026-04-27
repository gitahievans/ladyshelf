"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAdminPickupLocation,
  fetchAdminDeliverySettings,
  fetchAdminPickupLocations,
  updateAdminDeliverySettings,
  updateAdminPickupLocation,
} from "@/lib/api/admin";
import type {
  AdminDeliverySettings,
  AdminPickupLocation,
  AdminPickupLocationInput,
} from "@/lib/types";

const defaultPickup: AdminPickupLocationInput = {
  name: "",
  county: "Nairobi",
  town: "",
  streetAddress: "",
  contactName: "",
  contactPhone: "",
  mapsUrl: "",
  openingHours: "",
  collectionWindowHours: 72,
  notes: "",
  isActive: true,
};

function LabeledInput({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}): ReactElement {
  return (
    <label className="space-y-2">
      <span className="block font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function AdminSettingsManager(): ReactElement {
  const [deliverySettings, setDeliverySettings] = useState<AdminDeliverySettings | null>(null);
  const [pickups, setPickups] = useState<AdminPickupLocation[]>([]);
  const [pickupDraft, setPickupDraft] = useState<AdminPickupLocationInput>(defaultPickup);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect((): void => {
    void (async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const [nextSettings, nextPickups] = await Promise.all([
          fetchAdminDeliverySettings(),
          fetchAdminPickupLocations(),
        ]);
        setDeliverySettings(nextSettings);
        setPickups(nextPickups);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load settings.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function saveDeliverySettings(nextSettings: AdminDeliverySettings): Promise<void> {
    setSavingId("delivery-settings");
    setError(null);
    setMessage(null);
    try {
      const updated = await updateAdminDeliverySettings(nextSettings);
      setDeliverySettings(updated);
      setMessage("Delivery settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save delivery settings.");
    } finally {
      setSavingId(null);
    }
  }

  async function addPickup(): Promise<void> {
    setError(null);
    setMessage(null);
    try {
      const created = await createAdminPickupLocation(pickupDraft);
      setPickups((current) => [...current, created]);
      setPickupDraft(defaultPickup);
      setMessage("Pickup location created.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create pickup location.");
    }
  }

  async function savePickup(pickup: AdminPickupLocation): Promise<void> {
    setSavingId(`pickup-${pickup.id}`);
    setError(null);
    try {
      const updated = await updateAdminPickupLocation(pickup.id, pickup);
      setPickups((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage("Pickup location saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save pickup location.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
        <h2 className="mt-2 font-cormorant text-h2 text-obsidian">Commerce settings</h2>
        <p className="mt-3 max-w-3xl font-dm-sans text-body-sm text-text-secondary">
          Owner-only controls for distance-based delivery, parcel switching, and pickup operations.
        </p>
      </div>
      {error ? <div className="rounded-lg border border-error bg-ivory p-4 font-dm-sans text-body-sm text-error">{error}</div> : null}
      {message ? <div className="rounded-lg border border-success bg-ivory p-4 font-dm-sans text-body-sm text-success">{message}</div> : null}
      {isLoading ? (
        <div className="flex items-center gap-3 rounded-lg border border-border-warm bg-ivory p-6 font-dm-sans text-body text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" />Loading settings...</div>
      ) : (
        <div className="space-y-6">
          {deliverySettings ? (
            <DeliverySettingsCard
              isSaving={savingId === "delivery-settings"}
              onSave={saveDeliverySettings}
              settings={deliverySettings}
            />
          ) : null}

          <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
            <h3 className="font-cormorant text-h4 text-obsidian">Pickup locations</h3>
            <div className="mt-4 grid gap-3 lg:grid-cols-6">
              <LabeledInput label="Name">
                <Input value={pickupDraft.name} onChange={(event) => setPickupDraft({ ...pickupDraft, name: event.target.value })} placeholder="Name" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
              </LabeledInput>
              <LabeledInput label="Town">
                <Input value={pickupDraft.town} onChange={(event) => setPickupDraft({ ...pickupDraft, town: event.target.value })} placeholder="Town" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
              </LabeledInput>
              <LabeledInput label="Street Address">
                <Input value={pickupDraft.streetAddress} onChange={(event) => setPickupDraft({ ...pickupDraft, streetAddress: event.target.value })} placeholder="Street address" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption lg:col-span-2" />
              </LabeledInput>
              <LabeledInput label="Phone">
                <Input value={pickupDraft.contactPhone} onChange={(event) => setPickupDraft({ ...pickupDraft, contactPhone: event.target.value })} placeholder="Phone" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
              </LabeledInput>
              <Button type="button" onClick={() => void addPickup()} className="h-10 rounded-sm bg-gold font-dm-sans text-caption uppercase tracking-widest text-obsidian hover:bg-sand">Add Pickup</Button>
            </div>
            <div className="mt-5 divide-y divide-border-warm">
              {pickups.map((pickup) => (
                <PickupRow key={pickup.id} isSaving={savingId === `pickup-${pickup.id}`} onSave={savePickup} pickup={pickup} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function DeliverySettingsCard({
  isSaving,
  onSave,
  settings,
}: {
  isSaving: boolean;
  onSave: (settings: AdminDeliverySettings) => Promise<void>;
  settings: AdminDeliverySettings;
}): ReactElement {
  const [draft, setDraft] = useState<AdminDeliverySettings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  return (
    <div className="rounded-lg border border-border-warm bg-ivory p-5 shadow-card">
      <h3 className="font-cormorant text-h4 text-obsidian">Distance-based delivery</h3>
      <p className="mt-2 font-dm-sans text-body-sm text-text-secondary">
        Rider fee is calculated as KES {draft.riderBaseFee} for the first 10 km, then KES {draft.riderIncrementPer10Km} for each additional 10 km band. Beyond the switch radius, checkout becomes parcel delivery with manual fee confirmation.
      </p>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <LabeledInput label="Shop Name">
          <Input value={draft.shopName} onChange={(event) => setDraft({ ...draft, shopName: event.target.value })} placeholder="Shop name" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
        </LabeledInput>
        <LabeledInput label="Town">
          <Input value={draft.shopTown} onChange={(event) => setDraft({ ...draft, shopTown: event.target.value })} placeholder="Town" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
        </LabeledInput>
        <LabeledInput label="County">
          <Input value={draft.shopCounty} onChange={(event) => setDraft({ ...draft, shopCounty: event.target.value })} placeholder="County" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
        </LabeledInput>
        <LabeledInput label="Street Address">
          <Input value={draft.shopStreetAddress} onChange={(event) => setDraft({ ...draft, shopStreetAddress: event.target.value })} placeholder="Street address" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption lg:col-span-2" />
        </LabeledInput>
        <label className="space-y-2">
          <span className="block font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
            Rider Pay on Delivery
          </span>
          <span className="flex items-center gap-2 font-dm-sans text-caption text-text-secondary"><input type="checkbox" checked={draft.allowPayOnDelivery} onChange={(event) => setDraft({ ...draft, allowPayOnDelivery: event.target.checked })} className="h-4 w-4 accent-gold" />Allow rider pay on delivery</span>
        </label>
        <LabeledInput label="Shop Latitude">
          <Input value={draft.shopLatitude} type="number" step="0.000001" onChange={(event) => setDraft({ ...draft, shopLatitude: Number(event.target.value) || 0 })} placeholder="Shop latitude" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
        </LabeledInput>
        <LabeledInput label="Shop Longitude">
          <Input value={draft.shopLongitude} type="number" step="0.000001" onChange={(event) => setDraft({ ...draft, shopLongitude: Number(event.target.value) || 0 })} placeholder="Shop longitude" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
        </LabeledInput>
        <LabeledInput label="Rider Max Radius (km)">
          <Input value={draft.riderMaxRadiusKm} type="number" onChange={(event) => setDraft({ ...draft, riderMaxRadiusKm: Number(event.target.value) || 0 })} placeholder="Rider max radius" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
        </LabeledInput>
        <LabeledInput label="Parcel Switch Radius (km)">
          <Input value={draft.parcelSwitchRadiusKm} type="number" onChange={(event) => setDraft({ ...draft, parcelSwitchRadiusKm: Number(event.target.value) || 0 })} placeholder="Parcel switch radius" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
        </LabeledInput>
        <LabeledInput label="Base Fee (KES)">
          <Input value={draft.riderBaseFee} type="number" onChange={(event) => setDraft({ ...draft, riderBaseFee: Number(event.target.value) || 0 })} placeholder="Base fee" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
        </LabeledInput>
        <LabeledInput label="Increment Per 10 km (KES)">
          <Input value={draft.riderIncrementPer10Km} type="number" onChange={(event) => setDraft({ ...draft, riderIncrementPer10Km: Number(event.target.value) || 0 })} placeholder="Increment per 10 km" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
        </LabeledInput>
        <LabeledInput label="Rider Timeline">
          <Input value={draft.riderEstimatedWindow} onChange={(event) => setDraft({ ...draft, riderEstimatedWindow: event.target.value })} placeholder="Rider timeline" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
        </LabeledInput>
        <LabeledInput label="Parcel Timeline">
          <Input value={draft.parcelEstimatedWindow} onChange={(event) => setDraft({ ...draft, parcelEstimatedWindow: event.target.value })} placeholder="Parcel timeline" className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
        </LabeledInput>
        <label className="space-y-2">
          <span className="block font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
            Parcel Fee Confirmation
          </span>
          <span className="flex items-center gap-2 font-dm-sans text-caption text-text-secondary"><input type="checkbox" checked={draft.parcelManualFeeConfirmationRequired} onChange={(event) => setDraft({ ...draft, parcelManualFeeConfirmationRequired: event.target.checked })} className="h-4 w-4 accent-gold" />Parcel fee confirmed manually</span>
        </label>
      </div>
      <div className="mt-4">
        <Button type="button" disabled={isSaving} onClick={() => void onSave(draft)} className="h-10 rounded-sm bg-gold font-dm-sans text-caption uppercase tracking-widest text-obsidian hover:bg-sand">{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Delivery Settings</Button>
      </div>
    </div>
  );
}

function PickupRow({
  isSaving,
  onSave,
  pickup,
}: {
  isSaving: boolean;
  onSave: (pickup: AdminPickupLocation) => Promise<void>;
  pickup: AdminPickupLocation;
}): ReactElement {
  const [draft, setDraft] = useState<AdminPickupLocation>(pickup);

  useEffect(() => {
    setDraft(pickup);
  }, [pickup]);

  return (
    <div className="grid gap-3 py-4 lg:grid-cols-6 lg:items-center">
      <LabeledInput label="Name">
        <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
      </LabeledInput>
      <LabeledInput label="Town">
        <Input value={draft.town} onChange={(event) => setDraft({ ...draft, town: event.target.value })} className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption" />
      </LabeledInput>
      <LabeledInput label="Street Address">
        <Input value={draft.streetAddress} onChange={(event) => setDraft({ ...draft, streetAddress: event.target.value })} className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-caption lg:col-span-2" />
      </LabeledInput>
      <label className="space-y-2">
        <span className="block font-dm-sans text-caption uppercase tracking-[0.14em] text-text-muted">
          Status
        </span>
        <span className="flex items-center gap-2 font-dm-sans text-caption text-text-secondary"><input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} className="h-4 w-4 accent-gold" />Active</span>
      </label>
      <Button type="button" disabled={isSaving} onClick={() => void onSave(draft)} className="h-10 rounded-sm bg-gold font-dm-sans text-caption uppercase tracking-widest text-obsidian hover:bg-sand">{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save</Button>
    </div>
  );
}
