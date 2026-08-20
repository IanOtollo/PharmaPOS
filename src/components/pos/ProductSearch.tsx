"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Plus, Pill } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatKES } from "@/lib/utils";

export function ProductSearch({
  onAdd,
}: {
  onAdd: (product: Doc<"products">) => void;
}) {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("All");
  const products = useQuery(api.products.search, { term, category });
  const categories = useQuery(api.categories.list);

  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        className="max-w-sm"
        placeholder="Search products…"
        value={term}
        onChange={setTerm}
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...(categories ?? []).map((c) => c.name)].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
              category === c
                ? "bg-accent text-background"
                : "border border-border text-text-secondary hover:bg-surface-hover"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {products === undefined ? (
        <p className="py-16 text-center text-sm text-text-secondary">Loading…</p>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No products found"
          description="Try a different search or category."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => {
            const outOfStock = p.stock === 0;
            return (
              <div
                key={p._id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {p.name}
                  </p>
                  {p.requiresPrescription && <Badge tone="accent">Rx</Badge>}
                </div>
                <p className="font-numeric text-base text-accent">
                  {formatKES(p.sellingPrice)}
                </p>
                <div className="flex items-center justify-between">
                  {outOfStock ? (
                    <Badge tone="danger">Out of stock</Badge>
                  ) : (
                    <span className="font-numeric text-xs text-text-secondary">
                      {p.stock} {p.unit}
                    </span>
                  )}
                  <button
                    disabled={outOfStock}
                    onClick={() => onAdd(p)}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-background transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-text-secondary"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
