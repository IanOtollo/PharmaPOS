"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

const TYPES = [
  { value: "restock", label: "Restock" },
  { value: "damage", label: "Damage" },
  { value: "return", label: "Return" },
  { value: "correction", label: "Correction" },
];

export function StockAdjustModal({
  product,
  onClose,
}: {
  product: Doc<"products"> | null;
  onClose: () => void;
}) {
  const [type, setType] = useState("restock");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const adjustStock = useMutation(api.inventory.adjustStock);
  const { showToast } = useToast();

  function reset() {
    setType("restock");
    setQuantity("");
    setReason("");
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setError("");
    const qty = Number(quantity);
    if (!qty) {
      setError("Enter a quantity");
      return;
    }
    const signed = type === "damage" ? -Math.abs(qty) : Math.abs(qty);

    setSubmitting(true);
    try {
      await adjustStock({
        productId: product._id,
        type,
        quantityChange: signed,
        reason: reason.trim() || undefined,
      });
      showToast("Stock adjusted");
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adjustment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={!!product}
      onClose={handleClose}
      title={product ? `Adjust stock — ${product.name}` : ""}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <p className="text-sm text-text-secondary">
          Current stock:{" "}
          <span className="font-numeric text-text-primary">
            {product?.stock} {product?.unit}
          </span>
        </p>

        <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>

        <Input
          label="Quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={type === "damage" ? "amount to remove" : "amount to add"}
        />

        <Input
          label="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save adjustment"}
        </Button>
      </form>
    </Modal>
  );
}
