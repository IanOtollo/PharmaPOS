"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Plus, ShoppingBasket, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatKES, formatDateTime } from "@/lib/utils";

type Line = {
  productId: Id<"products">;
  productName: string;
  quantity: number;
  buyingPrice: number;
};

function RecordPurchaseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const suppliers = useQuery(api.suppliers.list);
  const create = useMutation(api.purchases.create);
  const { showToast } = useToast();

  const [supplierId, setSupplierId] = useState<Id<"suppliers"> | "">("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [term, setTerm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const products = useQuery(api.products.search, term.trim() ? { term, category: "All" } : "skip");

  function addLine(id: Id<"products">, name: string) {
    if (lines.some((l) => l.productId === id)) return;
    setLines((prev) => [...prev, { productId: id, productName: name, quantity: 1, buyingPrice: 0 }]);
    setTerm("");
  }

  function updateLine(id: Id<"products">, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.productId === id ? { ...l, ...patch } : l)));
  }

  function removeLine(id: Id<"products">) {
    setLines((prev) => prev.filter((l) => l.productId !== id));
  }

  function reset() {
    setSupplierId("");
    setReferenceNumber("");
    setLines([]);
    setTerm("");
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supplierId) return setError("Select a supplier");
    if (lines.length === 0) return setError("Add at least one product");
    if (lines.some((l) => l.quantity <= 0 || l.buyingPrice <= 0)) {
      return setError("Every line needs a quantity and buying price greater than 0");
    }

    setSubmitting(true);
    try {
      await create({
        supplierId,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          buyingPrice: l.buyingPrice,
        })),
        referenceNumber: referenceNumber.trim() || undefined,
      });
      showToast("Purchase recorded, stock updated");
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const total = lines.reduce((s, l) => s + l.quantity * l.buyingPrice, 0);

  return (
    <Modal open={open} onClose={handleClose} title="Record purchase" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Dropdown
            label="Supplier"
            value={supplierId}
            onChange={(v) => setSupplierId(v as Id<"suppliers">)}
            placeholder="Select supplier"
            options={(suppliers ?? []).map((s) => ({ value: s._id, label: s.name }))}
          />
          <Input
            label="Reference number (optional)"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm text-text-secondary">Add products</p>
          <div className="relative">
            <SearchInput value={term} onChange={setTerm} placeholder="Search products…" />
            {term.trim() && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-surface shadow-sm">
                {products === undefined ? (
                  <p className="px-3 py-2 text-sm text-text-secondary">Searching…</p>
                ) : products.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-text-secondary">No products found.</p>
                ) : (
                  products.slice(0, 6).map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => addLine(p._id, p.name)}
                      className="block w-full px-3 py-2 text-left text-sm text-text-primary transition-colors duration-150 hover:bg-surface-hover"
                    >
                      {p.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {lines.length > 0 && (
          <div className="flex flex-col divide-y divide-border rounded-md border border-border">
            {lines.map((l) => (
              <div key={l.productId} className="flex items-center gap-2 p-3">
                <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                  {l.productName}
                </span>
                <input
                  type="number"
                  min="1"
                  value={l.quantity}
                  onChange={(e) => updateLine(l.productId, { quantity: Number(e.target.value) })}
                  className="h-9 w-16 rounded-md border border-border bg-surface px-2 text-center text-sm text-text-primary outline-none focus:border-accent"
                  placeholder="Qty"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={l.buyingPrice}
                  onChange={(e) =>
                    updateLine(l.productId, { buyingPrice: Number(e.target.value) })
                  }
                  className="h-9 w-24 rounded-md border border-border bg-surface px-2 text-center text-sm text-text-primary outline-none focus:border-accent"
                  placeholder="Cost"
                />
                <span className="font-numeric w-20 shrink-0 text-right text-sm text-accent">
                  {formatKES(l.quantity * l.buyingPrice)}
                </span>
                <button
                  type="button"
                  onClick={() => removeLine(l.productId)}
                  className="text-text-secondary transition-colors duration-150 hover:text-danger"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between rounded-md bg-surface-hover px-4 py-3">
          <span className="text-sm text-text-secondary">Total cost</span>
          <span className="font-numeric text-lg text-accent">{formatKES(total)}</span>
        </div>

        {error && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Record purchase & update stock"}
        </Button>
      </form>
    </Modal>
  );
}

export default function PurchasesPage() {
  const purchases = useQuery(api.purchases.list);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Purchases"
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Record purchase
          </Button>
        }
      />

      <div className="px-4 py-4 sm:px-6">
        {purchases === undefined ? (
          <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>
        ) : purchases.length === 0 ? (
          <EmptyState
            icon={ShoppingBasket}
            title="No purchases recorded"
            description="Record a purchase to restock and track supplier costs."
            action={
              <Button size="sm" onClick={() => setModalOpen(true)}>
                <Plus size={16} /> Record purchase
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
            {purchases.map((p) => (
              <div key={p._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-numeric text-sm text-text-primary">{p.purchaseNumber}</p>
                  <p className="text-xs text-text-secondary">
                    {p.supplierName} · {formatDateTime(p._creationTime)} · {p.items.length} item
                    {p.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="font-numeric shrink-0 text-sm text-accent">
                  {formatKES(p.totalCost)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <RecordPurchaseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
