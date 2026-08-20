"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatDate, daysUntilExpiry } from "@/lib/utils";

export function ExpiryAlerts() {
  const alerts = useQuery(api.inventory.expiryAlerts);

  if (!alerts || (alerts.expiring.length === 0 && alerts.expired.length === 0)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:px-6">
      {alerts.expired.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-danger">
            Expired ({alerts.expired.length})
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {alerts.expired.map((p) => (
              <div
                key={p._id}
                className="w-56 shrink-0 rounded-lg border border-danger/40 bg-surface p-3"
              >
                <p className="truncate text-sm font-medium text-text-primary">
                  {p.name}
                </p>
                <p className="text-xs text-text-secondary">
                  Batch {p.batchNumber ?? "—"}
                </p>
                <p className="mt-1 font-numeric text-xs text-danger">
                  {formatDate(p.expiryDate!)} · {Math.abs(daysUntilExpiry(p.expiryDate!))}d ago
                </p>
                <p className="font-numeric mt-1 text-xs text-text-secondary">
                  {p.stock} {p.unit} left
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.expiring.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-warning">
            Expiring soon ({alerts.expiring.length})
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {alerts.expiring.map((p) => (
              <div
                key={p._id}
                className="w-56 shrink-0 rounded-lg border border-warning/40 bg-surface p-3"
              >
                <p className="truncate text-sm font-medium text-text-primary">
                  {p.name}
                </p>
                <p className="text-xs text-text-secondary">
                  Batch {p.batchNumber ?? "—"}
                </p>
                <p className="mt-1 font-numeric text-xs text-warning">
                  {formatDate(p.expiryDate!)} · {daysUntilExpiry(p.expiryDate!)}d left
                </p>
                <p className="font-numeric mt-1 text-xs text-text-secondary">
                  {p.stock} {p.unit} left
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
