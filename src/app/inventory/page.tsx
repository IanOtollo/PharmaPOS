"use client";

import { Suspense, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { Package } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExpiryAlerts } from "@/components/inventory/ExpiryAlerts";
import { StockTable } from "@/components/inventory/StockTable";
import { StockAdjustModal } from "@/components/inventory/StockAdjustModal";
import { daysUntilExpiry } from "@/lib/utils";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Low Stock", "Expiring Soon", "Expired"] as const;
type Filter = (typeof FILTERS)[number];

function InventoryContent() {
  const searchParams = useSearchParams();
  const requestedFilter = searchParams.get("filter");
  const initialFilter: Filter = (FILTERS as readonly string[]).includes(
    requestedFilter ?? ""
  )
    ? (requestedFilter as Filter)
    : "All";

  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [term, setTerm] = useState("");
  const [adjusting, setAdjusting] = useState<Doc<"products"> | null>(null);
  const products = useQuery(api.inventory.stockTable);

  const filtered = useMemo(() => {
    if (!products) return undefined;
    let list = products;
    if (term.trim()) {
      const t = term.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)
      );
    }
    if (filter === "Low Stock") {
      list = list.filter((p) => p.stock > 0 && p.stock <= p.minStock);
    } else if (filter === "Expiring Soon") {
      list = list.filter(
        (p) =>
          p.expiryDate &&
          daysUntilExpiry(p.expiryDate) >= 0 &&
          daysUntilExpiry(p.expiryDate) <= 90
      );
    } else if (filter === "Expired") {
      list = list.filter((p) => p.expiryDate && daysUntilExpiry(p.expiryDate) < 0);
    }
    return list;
  }, [products, term, filter]);

  return (
    <div>
      <PageHeader title="Inventory" />
      <ExpiryAlerts />

      <div className="flex flex-col gap-3 px-4 sm:px-6">
        <SearchInput
          className="max-w-sm"
          placeholder="Search inventory…"
          value={term}
          onChange={setTerm}
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
                filter === f
                  ? "bg-accent text-background"
                  : "border border-border text-text-secondary hover:bg-surface-hover"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6">
        {filtered === undefined ? (
          <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No matching products"
            description="Try a different search or filter."
          />
        ) : (
          <StockTable products={filtered} onAdjust={setAdjusting} />
        )}
      </div>

      <StockAdjustModal product={adjusting} onClose={() => setAdjusting(null)} />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={null}>
      <InventoryContent />
    </Suspense>
  );
}
