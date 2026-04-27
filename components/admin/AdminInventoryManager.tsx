"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Loader2, Search, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAdminInventory, updateAdminVariantStock } from "@/lib/api/admin";
import type { AdminInventoryRow } from "@/lib/types";

export default function AdminInventoryManager(): ReactElement {
  const [rows, setRows] = useState<AdminInventoryRow[]>([]);
  const [query, setQuery] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadInventory(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      setRows(await fetchAdminInventory({ q: query, lowStock: lowStock ? "true" : undefined }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect((): void => {
    void loadInventory();
  }, []);

  async function updateStock(row: AdminInventoryRow, stock: number): Promise<void> {
    setUpdatingId(row.id);
    setError(null);
    try {
      const updated = await updateAdminVariantStock(row.id, stock);
      setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update stock.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-border-warm bg-cream p-6 shadow-card">
        <h2 className="mt-2 font-cormorant text-h2 text-obsidian">Inventory controls</h2>
        <p className="mt-3 max-w-3xl font-dm-sans text-body-sm text-text-secondary">
          Fast stock updates for owners and attendants without opening full product records.
        </p>
      </div>
      <div className="grid gap-3 rounded-lg border border-border-warm bg-ivory p-4 shadow-card lg:grid-cols-4">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product, SKU, color, or size" className="h-11 rounded-sm border-border-warm bg-cream px-4 font-dm-sans text-body-sm lg:col-span-2" />
        <label className="flex items-center gap-3 font-dm-sans text-body-sm text-text-secondary">
          <input type="checkbox" checked={lowStock} onChange={(event) => setLowStock(event.target.checked)} className="h-4 w-4 accent-gold" />
          Low stock only
        </label>
        <Button type="button" onClick={() => void loadInventory()} className="h-11 rounded-sm bg-gold text-obsidian hover:bg-sand"><Search className="mr-2 h-4 w-4" />Filter</Button>
      </div>
      {error ? <div className="rounded-lg border border-error bg-ivory p-4 font-dm-sans text-body-sm text-error">{error}</div> : null}
      <div className="overflow-hidden rounded-lg border border-border-warm bg-ivory shadow-card">
        {isLoading ? (
          <div className="flex items-center gap-3 p-6 font-dm-sans text-body text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" />Loading inventory...</div>
        ) : rows.length === 0 ? (
          <p className="p-6 font-dm-sans text-body text-text-secondary">No variants match this view.</p>
        ) : (
          <div>
            <div className="hidden grid-cols-6 gap-3 border-b border-border-warm bg-cream px-5 py-3 font-dm-sans text-caption uppercase tracking-widest text-text-muted md:grid">
              <span className="col-span-2">Product / SKU</span>
              <span>Color</span>
              <span>Size</span>
              <span>Stock</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-border-warm">
              {rows.map((row) => (
                <InventoryRow key={row.id} row={row} isUpdating={updatingId === row.id} onSave={updateStock} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function InventoryRow({
  isUpdating,
  onSave,
  row,
}: {
  isUpdating: boolean;
  onSave: (row: AdminInventoryRow, stock: number) => Promise<void>;
  row: AdminInventoryRow;
}): ReactElement {
  const [stock, setStock] = useState(String(row.stock));

  useEffect((): void => {
    setStock(String(row.stock));
  }, [row.stock]);

  return (
    <div className="grid gap-3 p-5 md:grid-cols-6 md:items-center">
      <div className="md:col-span-2">
        <p className="font-dm-sans text-body-sm font-semibold text-obsidian">{row.productName}</p>
        <p className="font-dm-sans text-caption text-text-muted">{row.sku}</p>
      </div>
      <p className="font-dm-sans text-body-sm text-text-secondary">{row.color}</p>
      <p className="font-dm-sans text-body-sm text-text-secondary">{row.size}</p>
      <Input value={stock} onChange={(event) => setStock(event.target.value)} type="number" min={0} className="h-10 rounded-sm border-border-warm bg-cream px-3 font-dm-sans text-body-sm" />
      <Button type="button" disabled={isUpdating} onClick={() => void onSave(row, Math.max(Number(stock) || 0, 0))} className="h-10 rounded-sm bg-gold font-dm-sans text-caption uppercase tracking-widest text-obsidian hover:bg-sand">
        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save
      </Button>
    </div>
  );
}
