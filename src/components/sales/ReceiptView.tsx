"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Printer, Ban } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatKES, formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const METHOD_LABEL: Record<string, string> = {
  cash: "Cash",
  mpesa: "M-Pesa",
  card: "Card",
};

export function ReceiptView({ sale }: { sale: Doc<"sales"> }) {
  const [voiding, setVoiding] = useState(false);
  const voidSale = useMutation(api.sales.voidSale);
  const settings = useQuery(api.settings.get);
  const router = useRouter();
  const { showToast } = useToast();

  const vatBase = sale.subtotal - (sale.discountAmount ?? 0);
  const vatPercent = vatBase > 0 ? Math.round((sale.vatAmount / vatBase) * 100) : 16;

  async function handleVoid() {
    if (!confirm(`Void sale ${sale.saleNumber}? Stock will be restored.`)) return;
    const reason = prompt("Reason for voiding this sale (optional):") ?? undefined;
    setVoiding(true);
    try {
      await voidSale({ id: sale._id, reason: reason?.trim() || undefined });
      showToast("Sale voided");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Void failed", "danger");
    } finally {
      setVoiding(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="print:shadow-none rounded-lg border border-border bg-surface p-6">
        <div className="text-center">
          <p className="font-display text-lg font-bold text-text-primary">
            {settings?.pharmacyName ?? "PharmaPOS"}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-text-secondary">Sale No.</span>
          <span className="font-numeric text-text-primary">{sale.saleNumber}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Date</span>
          <span className="font-numeric text-text-primary">
            {formatDateTime(sale._creationTime)}
          </span>
        </div>
        {sale.status === "voided" && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <Badge tone="danger">Voided</Badge>
            {sale.voidReason && (
              <p className="text-xs text-text-secondary">Reason: {sale.voidReason}</p>
            )}
          </div>
        )}

        <div className="my-4 border-t border-dashed border-border" />

        <div className="flex flex-col gap-2">
          {sale.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <div className="min-w-0">
                <p className="truncate text-text-primary">{item.productName}</p>
                <p className="font-numeric text-xs text-text-secondary">
                  {item.quantity} × {formatKES(item.unitPrice)}
                </p>
              </div>
              <span className="font-numeric shrink-0 text-text-primary">
                {formatKES(item.lineTotal)}
              </span>
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-dashed border-border" />

        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal</span>
            <span className="font-numeric">{formatKES(sale.subtotal)}</span>
          </div>
          {sale.discountAmount ? (
            <div className="flex justify-between text-danger">
              <span>Discount</span>
              <span className="font-numeric">-{formatKES(sale.discountAmount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-text-secondary">
            <span>VAT ({vatPercent}%)</span>
            <span className="font-numeric">{formatKES(sale.vatAmount)}</span>
          </div>
          <div className="flex justify-between text-base font-medium text-text-primary">
            <span>Total</span>
            <span className="font-numeric text-accent">{formatKES(sale.totalAmount)}</span>
          </div>
          {sale.amountReceived !== undefined && (
            <div className="flex justify-between text-text-secondary">
              <span>Amount paid</span>
              <span className="font-numeric">{formatKES(sale.amountReceived)}</span>
            </div>
          )}
          {sale.changeGiven !== undefined && sale.changeGiven > 0 && (
            <div className="flex justify-between text-text-secondary">
              <span>Change</span>
              <span className="font-numeric">{formatKES(sale.changeGiven)}</span>
            </div>
          )}
        </div>

        <div className="my-4 border-t border-dashed border-border" />

        <div className="flex flex-col gap-1 text-sm text-text-secondary">
          <div className="flex justify-between">
            <span>Payment method</span>
            <span className="text-text-primary">
              {METHOD_LABEL[sale.paymentMethod] ?? sale.paymentMethod}
            </span>
          </div>
          {sale.mpesaRef && (
            <div className="flex justify-between">
              <span>M-Pesa ref</span>
              <span className="font-numeric text-text-primary">{sale.mpesaRef}</span>
            </div>
          )}
          {sale.servedBy && (
            <div className="flex justify-between">
              <span>Served by</span>
              <span className="text-text-primary">{sale.servedBy}</span>
            </div>
          )}
          {sale.customerName && (
            <div className="flex justify-between">
              <span>Customer</span>
              <span className="text-text-primary">{sale.customerName}</span>
            </div>
          )}
          {sale.customerPhone && (
            <div className="flex justify-between">
              <span>Phone</span>
              <span className="font-numeric text-text-primary">{sale.customerPhone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="no-print mt-4 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
          <Printer size={16} /> Print
        </Button>
        {sale.status !== "voided" && (
          <Button
            variant="danger"
            className="flex-1"
            disabled={voiding}
            onClick={handleVoid}
          >
            <Ban size={16} /> Void sale
          </Button>
        )}
      </div>
    </div>
  );
}
