"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { cn, formatKES, calculateVAT } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";
import { CURRENT_STAFF_KEY } from "@/components/auth/AppGate";
import type { CartLine } from "@/components/pos/cart";

export function CheckoutModal({
  open,
  onClose,
  lines,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  onComplete: () => void;
}) {
  const [method, setMethod] = useState<"cash" | "mpesa" | "card">("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [mpesaRef, setMpesaRef] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [servedBy, setServedBy] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ saleNumber: string } | null>(null);
  const completeSale = useMutation(api.sales.completeSale);
  const staff = useQuery(api.staff.list);

  useEffect(() => {
    if (open) {
      setServedBy(sessionStorage.getItem(CURRENT_STAFF_KEY) ?? "");
    }
  }, [open]);

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const { vat, total } = calculateVAT(subtotal);
  const received = Number(amountReceived) || 0;
  const change = received - total;

  function handleClose() {
    setMethod("cash");
    setAmountReceived("");
    setMpesaRef("");
    setCustomerName("");
    setCustomerPhone("");
    setServedBy("");
    setError("");
    setResult(null);
    onClose();
  }

  async function handleComplete() {
    setError("");
    if (method === "mpesa" && !mpesaRef.trim()) {
      setError("Enter the M-Pesa reference code");
      return;
    }
    if (method === "cash" && amountReceived && received < total) {
      setError("Amount received is less than the total");
      return;
    }

    setSubmitting(true);
    try {
      const { saleNumber } = await completeSale({
        items: lines.map((l) => ({
          productId: l.productId,
          productName: l.productName,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          lineTotal: l.unitPrice * l.quantity,
        })),
        subtotal,
        vatAmount: vat,
        totalAmount: total,
        paymentMethod: method,
        mpesaRef: method === "mpesa" ? mpesaRef.trim() : undefined,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        servedBy: servedBy || undefined,
      });
      setResult({ saleNumber });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sale failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={result ? "Sale complete" : "Checkout"}>
      {result ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 size={40} className="text-success" />
          <p className="font-display text-lg font-bold text-text-primary">
            Sale complete
          </p>
          <p className="font-numeric text-sm text-text-secondary">{result.saleNumber}</p>
          <p className="font-numeric text-2xl text-accent">{formatKES(total)}</p>
          {method === "cash" && received > 0 && (
            <p className="text-sm text-text-secondary">
              Change due:{" "}
              <span className="font-numeric text-text-primary">
                {formatKES(Math.max(change, 0))}
              </span>
            </p>
          )}
          <Button className="mt-2 w-full" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-md bg-surface-hover px-4 py-3">
            <span className="text-sm text-text-secondary">Total due</span>
            <span className="font-numeric text-xl text-accent">{formatKES(total)}</span>
          </div>

          <div className="flex rounded-md border border-border p-1">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                className={cn(
                  "flex-1 rounded-md py-2 text-sm font-medium transition-colors duration-150",
                  method === m.value
                    ? "bg-accent text-background"
                    : "text-text-secondary hover:bg-surface-hover"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {method === "cash" && (
            <Input
              label="Amount received (optional)"
              type="number"
              min="0"
              step="0.01"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              placeholder={total.toFixed(2)}
            />
          )}
          {method === "cash" && received > 0 && (
            <p className="text-sm text-text-secondary">
              Change:{" "}
              <span className="font-numeric text-text-primary">
                {formatKES(Math.max(change, 0))}
              </span>
            </p>
          )}

          {method === "mpesa" && (
            <Input
              label="M-Pesa reference code"
              value={mpesaRef}
              onChange={(e) => setMpesaRef(e.target.value)}
              placeholder="e.g. QGH7XXXXX"
            />
          )}

          {staff !== undefined && staff.length > 0 && (
            <Dropdown
              label="Served by (optional)"
              value={servedBy}
              onChange={setServedBy}
              placeholder="Not specified"
              options={staff.map((s) => ({ value: s.name, label: s.name }))}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Customer phone (optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button size="lg" disabled={submitting} onClick={handleComplete}>
            {submitting ? "Processing…" : "Complete sale"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
