"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DEFAULT_CATEGORIES, UNITS } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

type FormState = {
  name: string;
  genericName: string;
  category: string;
  sku: string;
  barcode: string;
  costPrice: string;
  sellingPrice: string;
  stock: string;
  minStock: string;
  unit: string;
  expiryDate: string;
  batchNumber: string;
  requiresPrescription: boolean;
};

const EMPTY: FormState = {
  name: "",
  genericName: "",
  category: DEFAULT_CATEGORIES[0],
  sku: "",
  barcode: "",
  costPrice: "",
  sellingPrice: "",
  stock: "",
  minStock: "",
  unit: UNITS[0],
  expiryDate: "",
  batchNumber: "",
  requiresPrescription: false,
};

export function ProductForm({
  product,
  onDone,
}: {
  product?: Doc<"products"> | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const create = useMutation(api.products.create);
  const update = useMutation(api.products.update);
  const remove = useMutation(api.products.remove);
  const suggestedSku = useQuery(
    api.products.generateSku,
    !product ? { category: form.category } : "skip"
  );
  const { showToast } = useToast();

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        genericName: product.genericName ?? "",
        category: product.category,
        sku: product.sku,
        barcode: product.barcode ?? "",
        costPrice: String(product.costPrice),
        sellingPrice: String(product.sellingPrice),
        stock: String(product.stock),
        minStock: String(product.minStock),
        unit: product.unit,
        expiryDate: product.expiryDate ?? "",
        batchNumber: product.batchNumber ?? "",
        requiresPrescription: product.requiresPrescription,
      });
    }
  }, [product]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name is required");
    const sellingPrice = Number(form.sellingPrice);
    if (!(sellingPrice > 0)) return setError("Selling price must be greater than 0");
    const stock = Number(form.stock);
    if (stock < 0) return setError("Stock cannot be negative");
    const sku = form.sku.trim() || suggestedSku || `SKU-${Date.now()}`;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        genericName: form.genericName.trim() || undefined,
        category: form.category,
        sku,
        barcode: form.barcode.trim() || undefined,
        costPrice: Number(form.costPrice) || 0,
        sellingPrice,
        stock,
        minStock: Number(form.minStock) || 0,
        unit: form.unit,
        expiryDate: form.expiryDate || undefined,
        batchNumber: form.batchNumber.trim() || undefined,
        requiresPrescription: form.requiresPrescription,
      };

      if (product) {
        await update({ id: product._id, ...payload });
        showToast("Product updated");
      } else {
        await create(payload);
        showToast("Product added");
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`Remove "${product.name}" from the catalog?`)) return;
    await remove({ id: product._id });
    showToast("Product removed");
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Input
        label="Product name"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="e.g. Paracetamol 500mg"
        required
      />
      <Input
        label="Generic name"
        value={form.genericName}
        onChange={(e) => set("genericName", e.target.value)}
        placeholder="e.g. Paracetamol"
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Category"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
        >
          {DEFAULT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          label="Unit"
          value={form.unit}
          onChange={(e) => set("unit", e.target.value)}
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="SKU"
          value={form.sku}
          onChange={(e) => set("sku", e.target.value)}
          placeholder={suggestedSku ?? "auto-generated"}
        />
        <Input
          label="Barcode"
          value={form.barcode}
          onChange={(e) => set("barcode", e.target.value)}
          placeholder="optional"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Cost price (KES)"
          type="number"
          step="0.01"
          min="0"
          value={form.costPrice}
          onChange={(e) => set("costPrice", e.target.value)}
        />
        <Input
          label="Selling price (KES)"
          type="number"
          step="0.01"
          min="0"
          value={form.sellingPrice}
          onChange={(e) => set("sellingPrice", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={(e) => set("stock", e.target.value)}
        />
        <Input
          label="Min stock"
          type="number"
          min="0"
          value={form.minStock}
          onChange={(e) => set("minStock", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Expiry date"
          type="date"
          value={form.expiryDate}
          onChange={(e) => set("expiryDate", e.target.value)}
        />
        <Input
          label="Batch number"
          value={form.batchNumber}
          onChange={(e) => set("batchNumber", e.target.value)}
          placeholder="optional"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-text-primary">
        <input
          type="checkbox"
          checked={form.requiresPrescription}
          onChange={(e) => set("requiresPrescription", e.target.checked)}
          className="h-4 w-4 rounded border-border bg-surface accent-accent"
        />
        Requires prescription
      </label>

      <div className="mt-2 flex items-center justify-between gap-3">
        {product ? (
          <Button
            type="button"
            variant="ghost"
            className="text-danger hover:bg-danger/10"
            onClick={handleDelete}
          >
            Delete
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : product ? "Save changes" : "Add product"}
        </Button>
      </div>
    </form>
  );
}
