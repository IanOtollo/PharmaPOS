"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/Badge";
import { formatKES, formatDate, daysUntilExpiry } from "@/lib/utils";

export function ProductCard({
  product,
  onClick,
}: {
  product: Doc<"products">;
  onClick: () => void;
}) {
  const stockDot =
    product.stock === 0
      ? "bg-danger"
      : product.stock <= product.minStock
        ? "bg-warning"
        : "bg-success";

  const expiryDays = product.expiryDate
    ? daysUntilExpiry(product.expiryDate)
    : null;

  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 text-left transition-colors duration-150 hover:bg-surface-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-text-primary">{product.name}</p>
          {product.genericName && (
            <p className="truncate text-xs text-text-secondary">
              {product.genericName}
            </p>
          )}
        </div>
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${stockDot}`} />
      </div>

      <div className="flex items-center gap-2">
        <Badge tone="neutral">{product.category}</Badge>
        {product.requiresPrescription && <Badge tone="accent">Rx</Badge>}
      </div>

      <div className="flex items-end justify-between">
        <p className="font-numeric text-lg text-accent">
          {formatKES(product.sellingPrice)}
        </p>
        <p className="font-numeric text-xs text-text-secondary">
          {product.stock} {product.unit}
        </p>
      </div>

      {product.expiryDate && (
        <p
          className={`text-xs ${
            expiryDays !== null && expiryDays < 0
              ? "text-danger"
              : expiryDays !== null && expiryDays <= 90
                ? "text-warning"
                : "text-text-secondary"
          }`}
        >
          Exp {formatDate(product.expiryDate)}
        </p>
      )}
    </button>
  );
}
