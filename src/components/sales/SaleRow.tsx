"use client";

import Link from "next/link";
import { Doc } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/Badge";
import { formatKES, formatDateTime } from "@/lib/utils";

const METHOD_LABEL: Record<string, string> = {
  cash: "Cash",
  mpesa: "M-Pesa",
  card: "Card",
};

export function SaleRow({ sale }: { sale: Doc<"sales"> }) {
  return (
    <Link
      href={`/sales/${sale._id}`}
      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-150 hover:bg-surface-hover"
    >
      <div className="min-w-0">
        <p className="font-numeric text-sm text-text-primary">{sale.saleNumber}</p>
        <p className="text-xs text-text-secondary">
          {formatDateTime(sale._creationTime)} · {sale.items.length} item
          {sale.items.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge tone="neutral">{METHOD_LABEL[sale.paymentMethod] ?? sale.paymentMethod}</Badge>
        {sale.status === "voided" && <Badge tone="danger">Voided</Badge>}
        <span className="font-numeric w-24 text-right text-sm text-text-primary">
          {formatKES(sale.totalAmount)}
        </span>
      </div>
    </Link>
  );
}
