"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

function statusOf(p: Doc<"products">) {
  if (p.stock === 0) return { label: "Out of Stock", tone: "danger" as const };
  if (p.stock <= p.minStock) return { label: "Low Stock", tone: "warning" as const };
  return { label: "In Stock", tone: "success" as const };
}

export function StockTable({
  products,
  onAdjust,
}: {
  products: Doc<"products">[];
  onAdjust: (product: Doc<"products">) => void;
}) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Min</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => {
              const status = statusOf(p);
              return (
                <tr key={p._id} className="text-text-primary">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 font-numeric text-text-secondary">{p.sku}</td>
                  <td className="px-4 py-3 font-numeric">
                    {p.stock} {p.unit}
                  </td>
                  <td className="px-4 py-3 font-numeric text-text-secondary">
                    {p.minStock}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 font-numeric text-text-secondary">
                    {p.expiryDate ? formatDate(p.expiryDate) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onAdjust(p)}
                      className="text-sm text-accent transition-colors duration-150 hover:text-accent-hover"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:hidden">
        {products.map((p) => {
          const status = statusOf(p);
          return (
            <div
              key={p._id}
              className="rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-text-primary">{p.name}</p>
                  <p className="font-numeric text-xs text-text-secondary">{p.sku}</p>
                </div>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
                <span className="font-numeric">
                  {p.stock}/{p.minStock} {p.unit}
                </span>
                <span className="font-numeric">
                  {p.expiryDate ? formatDate(p.expiryDate) : "—"}
                </span>
              </div>
              <button
                onClick={() => onAdjust(p)}
                className="mt-3 w-full rounded-md border border-border py-1.5 text-sm text-accent transition-colors duration-150 hover:bg-surface-hover"
              >
                Adjust stock
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
